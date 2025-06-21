#!/usr/bin/env node

/* eslint-env node */
/* eslint no-console: "off" */

import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import readline from "readline";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const question = (query) =>
  new Promise((resolve) => rl.question(query, resolve));

// Utility functions
const exists = async (filePath) => {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
};

const readPackageJson = async () => {
  const packagePath = path.join(rootDir, "package.json");
  const content = await fs.readFile(packagePath, "utf-8");
  return JSON.parse(content);
};

const writePackageJson = async (pkg) => {
  const packagePath = path.join(rootDir, "package.json");
  await fs.writeFile(packagePath, JSON.stringify(pkg, null, 2) + "\n");
};

const getExistingExtensions = async () => {
  const extensionsDir = path.join(rootDir, "src/extensions");
  try {
    const items = await fs.readdir(extensionsDir, { withFileTypes: true });
    return items.filter((item) => item.isDirectory()).map((item) => item.name);
  } catch {
    return [];
  }
};

const getExistingUIs = async (extensionName) => {
  const extensionDir = path.join(rootDir, "src/extensions", extensionName);
  try {
    const items = await fs.readdir(extensionDir, { withFileTypes: true });
    return items
      .filter(
        (item) => item.isDirectory() && item.name !== extensionName + ".ts"
      )
      .map((item) => item.name);
  } catch {
    return [];
  }
};

const confirm = async (message) => {
  const answer = await question(`${message} (y/N): `);
  return answer.toLowerCase() === "y" || answer.toLowerCase() === "yes";
};

// Validation functions
const isValidJSIdentifier = (name) => {
  // More restrictive validation for extension/UI names
  // Must start with a letter (a-z, A-Z)
  // Can contain letters, digits, underscores only
  // No dollar signs or other special characters to avoid shell issues
  const identifierRegex = /^[a-zA-Z][a-zA-Z0-9_]*$/;
  
  // Also check it's not a reserved word
  const reservedWords = [
    'break', 'case', 'catch', 'class', 'const', 'continue', 'debugger', 'default',
    'delete', 'do', 'else', 'export', 'extends', 'finally', 'for', 'function',
    'if', 'import', 'in', 'instanceof', 'let', 'new', 'return', 'super', 'switch',
    'this', 'throw', 'try', 'typeof', 'var', 'void', 'while', 'with', 'yield',
    'enum', 'implements', 'interface', 'package', 'private', 'protected', 'public', 'static'
  ];
  
  return identifierRegex.test(name) && !reservedWords.includes(name);
};

// YAML management functions
const readReearthYml = async () => {
  const ymlPath = path.join(rootDir, "public/reearth.yml");
  const content = await fs.readFile(ymlPath, "utf-8");
  return content;
};

const writeReearthYml = async (content) => {
  const ymlPath = path.join(rootDir, "public/reearth.yml");
  await fs.writeFile(ymlPath, content);
};

const addExtensionToYml = async (extensionId, extensionName) => {
  const content = await readReearthYml();
  const lines = content.split("\n");
  
  const extensionEntry = `  - id: ${extensionId}
    type: widget
    name: ${extensionName}
    schema:
      groups:
        - id: appearance
          title: Appearance
          fields:
            - id: primary_color
              title: Primary color
              type: string
              ui: color`;

  // Find the extensions section and add the new extension
  const extensionsIndex = lines.findIndex(line => line.startsWith("extensions:"));
  if (extensionsIndex !== -1) {
    // Find the end of the extensions section (next top-level key or end of file)
    let insertIndex = lines.length;
    for (let i = extensionsIndex + 1; i < lines.length; i++) {
      if (lines[i] && !lines[i].startsWith(" ") && !lines[i].startsWith("\t")) {
        insertIndex = i;
        break;
      }
    }
    
    // Insert the new extension
    const extensionLines = extensionEntry.split("\n");
    lines.splice(insertIndex, 0, ...extensionLines);
  } else {
    // If no extensions section exists, add it
    lines.push("extensions:");
    lines.push(...extensionEntry.split("\n"));
  }

  await writeReearthYml(lines.join("\n"));
};

const removeExtensionFromYml = async (extensionId) => {
  const content = await readReearthYml();
  const lines = content.split("\n");
  
  // Find the extension to remove
  const extensionStart = lines.findIndex(line => 
    line.trim().startsWith(`- id: ${extensionId}`) && line.startsWith("  ")
  );
  
  if (extensionStart !== -1) {
    // Get the indentation level of the extension (should be 2 spaces)
    const extensionIndent = lines[extensionStart].search(/\S/);
    let extensionEnd = lines.length;
    
    // Look for the next item at the same or lesser indentation level
    for (let i = extensionStart + 1; i < lines.length; i++) {
      const line = lines[i];
      
      // Skip empty lines
      if (line.trim() === "") {
        continue;
      }
      
      const currentIndent = line.search(/\S/);
      
      // If we find a line at the same or lesser indentation level, that's the end
      if (currentIndent <= extensionIndent) {
        extensionEnd = i;
        break;
      }
    }
    
    // Remove the extension and all its nested content
    lines.splice(extensionStart, extensionEnd - extensionStart);
    
    // Clean up any trailing empty lines
    while (lines.length > 0 && lines[lines.length - 1].trim() === "") {
      lines.pop();
    }
  }

  await writeReearthYml(lines.join("\n"));
};

// Template generators
const generateExtensionTemplate = (extensionName, uiNames) => {
  const imports = uiNames
    .map(
      (ui) =>
        `import html_${ui} from "@distui/${extensionName}/${ui}/index.html?raw";`
    )
    .join("\n");

  const uiShows = uiNames
    .map((ui) => `reearth.ui.show(html_${ui});`)
    .join("\n");

  return `${imports}

import { GlobalThis } from "@/shared/reearthTypes";

type WidgetProperty = { appearance?: { primary_color?: string } };

const reearth = (globalThis as unknown as GlobalThis).reearth;
${uiShows}

// Get message from UI
reearth.extension.on("message", (message: unknown) => {
  const msg = message as { action: string; payload?: any };
  
  // Handle messages from UI components
  console.log("Received message:", msg);
});
`;
};

const generateUITemplate = (extensionName, uiName) => ({
  "App.tsx": `import useHooks from "./hooks";

import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";

function App() {
  const { handleAction } = useHooks();

  return (
    <Card>
      <CardHeader>
        <CardTitle>${extensionName} - ${uiName}</CardTitle>
        <CardDescription>
          This is the ${uiName} UI for ${extensionName} extension
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={handleAction}>
          Perform Action
        </Button>
      </CardContent>
    </Card>
  );
}

export default App;
`,
  "hooks.ts": `import { useCallback } from "react";

import { postMsg } from "@/shared/utils";

export default () => {
  const handleAction = useCallback(() => {
    postMsg("action", { from: "${uiName}" });
  }, []);

  return {
    handleAction,
  };
};
`,
  "main.tsx": `import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "./App";

import "@/shared/global.css";
import "./app.css";

const rootElement = document.getElementById("root");
if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}
`,
  "app.css": `:root {
  --background: transparent;
}

/* Add your custom styles here */
`,
  "index.html": `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${extensionName} - ${uiName}</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/main.tsx"></script>
  </body>
</html>
`,
});

// Package.json script management
const addScriptsForExtension = (pkg, extensionName, uiNames) => {
  // Add UI scripts
  uiNames.forEach((uiName) => {
    pkg.scripts[`dev:${extensionName}:${uiName}`] =
      `cross-env EXTENSION_NAME=${extensionName} UI_NAME=${uiName} vite -c configs/ui.ts`;
    pkg.scripts[`build:${extensionName}:${uiName}`] =
      `cross-env EXTENSION_NAME=${extensionName} UI_NAME=${uiName} vite build -c configs/ui.ts`;
  });

  // Add extension script
  pkg.scripts[`build:${extensionName}:extension`] =
    `cross-env EXTENSION_NAME=${extensionName} vite build -c configs/extension.ts`;

  // Add combined build script
  const buildCommands = [
    ...uiNames.map((ui) => `build:${extensionName}:${ui}`),
    `build:${extensionName}:extension`,
  ];
  pkg.scripts[`build:${extensionName}`] = `run-s ${buildCommands.join(" ")}`;

  return pkg;
};

const removeScriptsForExtension = (pkg, extensionName) => {
  const scriptsToRemove = Object.keys(pkg.scripts).filter(
    (script) =>
      script.startsWith(`dev:${extensionName}:`) ||
      script.startsWith(`build:${extensionName}:`) ||
      script === `build:${extensionName}`
  );

  scriptsToRemove.forEach((script) => {
    delete pkg.scripts[script];
  });

  return pkg;
};

const removeScriptsForUI = (pkg, extensionName, uiName) => {
  delete pkg.scripts[`dev:${extensionName}:${uiName}`];
  delete pkg.scripts[`build:${extensionName}:${uiName}`];

  // Update combined build script
  const buildScriptKey = `build:${extensionName}`;
  if (pkg.scripts[buildScriptKey]) {
    const commands = pkg.scripts[buildScriptKey]
      .replace("run-s ", "")
      .split(" ");
    const filteredCommands = commands.filter(
      (cmd) => !cmd.includes(`:${uiName}`) || cmd.includes(":extension")
    );

    if (filteredCommands.length > 0) {
      pkg.scripts[buildScriptKey] = `run-s ${filteredCommands.join(" ")}`;
    } else {
      delete pkg.scripts[buildScriptKey];
    }
  }

  return pkg;
};

const updateDevBuildScript = async (pkg) => {
  const extensions = await getExistingExtensions();
  let devCommands = [];
  let buildCommands = [];

  for (const ext of extensions) {
    const uis = await getExistingUIs(ext);
    for (const ui of uis) {
      devCommands.push(`yarn dev:${ext}:${ui}`);
      buildCommands.push(`yarn build:${ext}:${ui} --watch`);
    }
    if (uis.length > 0) {
      buildCommands.push(`yarn build:${ext}:extension --watch`);
    }
  }

  if (devCommands.length > 0) {
    const allCommands = [
      ...devCommands.slice(0, 1), // Only one dev server
      ...buildCommands,
      "vite preview --port 5005 --strict-port",
    ];
    pkg.scripts["dev-build"] =
      `concurrently ${allCommands.map((cmd) => `'${cmd}'`).join(" ")}`;
  } else {
    // Fallback if no extensions exist
    pkg.scripts["dev-build"] = `vite preview --port 5005 --strict-port`;
  }

  return pkg;
};

// Main action functions
const createExtension = async () => {
  console.log("\n🚀 Creating new extension...\n");

  let extensionId;
  while (true) {
    extensionId = await question("Extension ID (used for folder/file names): ");
    if (!extensionId.trim()) {
      console.log("❌ Extension ID cannot be empty");
      continue;
    }
    
    if (!isValidJSIdentifier(extensionId.trim())) {
      console.log("❌ Extension ID must start with a letter and contain only letters, digits, and underscores (no special characters)");
      console.log("   Examples: myExtension, my_extension, extension1, Dashboard");
      continue;
    }
    
    extensionId = extensionId.trim();
    break;
  }

  const extensionName = await question(`Extension display name (default: ${extensionId}): `);
  const displayName = extensionName.trim() || extensionId;

  const extensionDir = path.join(rootDir, "src/extensions", extensionId);
  if (await exists(extensionDir)) {
    console.log(`⚠️  Extension '${extensionId}' already exists!`);
    const shouldOverride = await confirm("Do you want to override it?");
    if (!shouldOverride) {
      console.log("❌ Operation cancelled");
      return;
    }
  }

  let uiNames;
  while (true) {
    const uiNamesInput = await question(
      "UI names (comma-separated, default: main): "
    );
    const rawUiNames = uiNamesInput.trim()
      ? uiNamesInput
          .split(",")
          .map((name) => name.trim())
          .filter(Boolean)
      : ["main"];
    
    // Validate each UI name
    const invalidNames = rawUiNames.filter(name => !isValidJSIdentifier(name));
    if (invalidNames.length > 0) {
      console.log(`❌ Invalid UI names: ${invalidNames.join(", ")}`);
      console.log("   UI names must start with a letter and contain only letters, digits, and underscores (no special characters)");
      console.log("   Examples: main, settings, dashboard, my_ui, ui1");
      continue;
    }
    
    uiNames = rawUiNames;
    break;
  }

  console.log(
    `\n📁 Creating extension '${extensionId}' (${displayName}) with UIs: ${uiNames.join(", ")}\n`
  );

  // Create extension directory
  await fs.mkdir(extensionDir, { recursive: true });

  // Create extension file
  const extensionContent = generateExtensionTemplate(extensionId, uiNames);
  await fs.writeFile(
    path.join(extensionDir, `${extensionId}.ts`),
    extensionContent
  );

  // Create UI directories and files
  for (const uiName of uiNames) {
    const uiDir = path.join(extensionDir, uiName);
    await fs.mkdir(uiDir, { recursive: true });

    // Generate UI-specific templates
    const specificTemplates = generateUITemplate(extensionId, uiName);

    for (const [fileName, content] of Object.entries(specificTemplates)) {
      await fs.writeFile(path.join(uiDir, fileName), content);
    }
  }

  // Update package.json
  let pkg = await readPackageJson();
  pkg = addScriptsForExtension(pkg, extensionId, uiNames);
  pkg = await updateDevBuildScript(pkg);
  await writePackageJson(pkg);

  // Update reearth.yml
  await addExtensionToYml(extensionId, displayName);

  console.log(`✅ Extension '${extensionId}' (${displayName}) created successfully!`);
  
  // Trigger initial build for the new extension
  console.log(`\n🔨 Building initial extension...`);
  try {
    const { spawn } = await import('child_process');
    const buildProcess = spawn('yarn', [`build:${extensionId}`], {
      stdio: 'inherit',
      shell: true,
      cwd: rootDir
    });
    
    await new Promise((resolve) => {
      buildProcess.on('close', (code) => {
        if (code === 0) {
          console.log(`✅ Initial build completed successfully!`);
        } else {
          console.log(`⚠️  Initial build failed with code ${code}`);
        }
        resolve();
      });
      buildProcess.on('error', (error) => {
        console.log(`⚠️  Build error: ${error.message}`);
        resolve();
      });
    });
  } catch (error) {
    console.log(`⚠️  Could not trigger initial build: ${error.message}`);
  }

  console.log(`\n📝 Available commands:`);
  uiNames.forEach((ui) => {
    console.log(`   yarn dev:${extensionId}:${ui}`);
    console.log(`   yarn build:${extensionId}:${ui}`);
  });
  console.log(`   yarn build:${extensionId}:extension`);
  console.log(`   yarn build:${extensionId}`);
};

const createUI = async () => {
  console.log("\n🎨 Creating new UI...\n");

  const extensions = await getExistingExtensions();
  if (extensions.length === 0) {
    console.log("❌ No extensions found. Create an extension first.");
    return;
  }

  console.log("Available extensions:");
  extensions.forEach((ext, i) => console.log(`  ${i + 1}. ${ext}`));

  const extChoice = await question("\nSelect extension (number or name): ");
  const extensionName = isNaN(extChoice)
    ? extChoice.trim()
    : extensions[parseInt(extChoice) - 1];

  if (!extensions.includes(extensionName)) {
    console.log("❌ Invalid extension selected");
    return;
  }

  let uiName;
  while (true) {
    uiName = await question("UI name: ");
    if (!uiName.trim()) {
      console.log("❌ UI name cannot be empty");
      continue;
    }
    
    if (!isValidJSIdentifier(uiName.trim())) {
      console.log("❌ UI name must start with a letter and contain only letters, digits, and underscores (no special characters)");
      console.log("   Examples: main, settings, dashboard, my_ui, ui1");
      continue;
    }
    
    uiName = uiName.trim();
    break;
  }

  const uiDir = path.join(rootDir, "src/extensions", extensionName, uiName);
  if (await exists(uiDir)) {
    console.log(
      `⚠️  UI '${uiName}' already exists in extension '${extensionName}'!`
    );
    const shouldOverride = await confirm("Do you want to override it?");
    if (!shouldOverride) {
      console.log("❌ Operation cancelled");
      return;
    }
  }

  console.log(`\n📁 Creating UI '${uiName}' in extension '${extensionName}'\n`);

  // Create UI directory and files
  await fs.mkdir(uiDir, { recursive: true });
  const uiTemplates = generateUITemplate(extensionName, uiName);

  for (const [fileName, content] of Object.entries(uiTemplates)) {
    await fs.writeFile(path.join(uiDir, fileName), content);
  }

  // Update extension file to include new UI
  const extensionFile = path.join(
    rootDir,
    "src/extensions",
    extensionName,
    `${extensionName}.ts`
  );
  const extensionContent = await fs.readFile(extensionFile, "utf-8");

  const importLine = `import html_${uiName} from "@distui/${extensionName}/${uiName}/index.html?raw";`;
  const uiShowComment = `reearth.ui.show(html_${uiName});`;

  let updatedContent = extensionContent;

  // Add import if not exists
  if (!updatedContent.includes(importLine)) {
    const importSection = updatedContent
      .split("\n")
      .find((line) => line.includes("import html_"));
    if (importSection) {
      updatedContent = updatedContent.replace(
        importSection,
        importSection + "\n" + importLine
      );
    } else {
      const firstImport = updatedContent
        .split("\n")
        .findIndex((line) => line.startsWith("import"));
      if (firstImport !== -1) {
        const lines = updatedContent.split("\n");
        lines.splice(firstImport, 0, importLine);
        updatedContent = lines.join("\n");
      }
    }
  }

  // Add UI show comments after the reearth declaration
  if (!updatedContent.includes(`html_${uiName}`)) {
    const reearthLine = updatedContent.indexOf("const reearth = ");
    if (reearthLine !== -1) {
      const lines = updatedContent.split("\n");
      const insertIndex =
        lines.findIndex((line) => line.includes("const reearth = ")) + 1;
      lines.splice(insertIndex, 0, uiShowComment);
      updatedContent = lines.join("\n");
    }
  }

  await fs.writeFile(extensionFile, updatedContent);

  // Update package.json
  let pkg = await readPackageJson();
  pkg.scripts[`dev:${extensionName}:${uiName}`] =
    `cross-env EXTENSION_NAME=${extensionName} UI_NAME=${uiName} vite -c configs/ui.ts`;
  pkg.scripts[`build:${extensionName}:${uiName}`] =
    `cross-env EXTENSION_NAME=${extensionName} UI_NAME=${uiName} vite build -c configs/ui.ts`;

  // Update combined build script
  const buildScriptKey = `build:${extensionName}`;
  if (pkg.scripts[buildScriptKey]) {
    const commands = pkg.scripts[buildScriptKey]
      .replace("run-s ", "")
      .split(" ");
    const extensionCmd = `build:${extensionName}:extension`;
    const insertIndex = commands.indexOf(extensionCmd);
    if (insertIndex !== -1) {
      commands.splice(insertIndex, 0, `build:${extensionName}:${uiName}`);
    } else {
      commands.push(`build:${extensionName}:${uiName}`);
    }
    pkg.scripts[buildScriptKey] = `run-s ${commands.join(" ")}`;
  }

  pkg = await updateDevBuildScript(pkg);
  await writePackageJson(pkg);

  console.log(
    `✅ UI '${uiName}' created successfully in extension '${extensionName}'!`
  );
  
  // Trigger initial build for the new UI
  console.log(`\n🔨 Building initial UI...`);
  try {
    const { spawn } = await import('child_process');
    const buildProcess = spawn('yarn', [`build:${extensionName}:${uiName}`], {
      stdio: 'inherit',
      shell: true,
      cwd: rootDir
    });
    
    await new Promise((resolve) => {
      buildProcess.on('close', (code) => {
        if (code === 0) {
          console.log(`✅ Initial build completed successfully!`);
          resolve();
        } else {
          console.log(`⚠️  Initial build failed with code ${code}`);
          resolve(); // Don't fail the creation process
        }
      });
      buildProcess.on('error', (error) => {
        console.log(`⚠️  Build error: ${error.message}`);
        resolve(); // Don't fail the creation process
      });
    });
  } catch (error) {
    console.log(`⚠️  Could not trigger initial build: ${error.message}`);
  }

  console.log(`\n📝 Available commands:`);
  console.log(`   yarn dev:${extensionName}:${uiName}`);
  console.log(`   yarn build:${extensionName}:${uiName}`);
};

const removeExtension = async () => {
  console.log("\n🗑️  Removing extension...\n");

  const extensions = await getExistingExtensions();
  if (extensions.length === 0) {
    console.log("❌ No extensions found.");
    return;
  }

  console.log("Available extensions:");
  extensions.forEach((ext, i) => console.log(`  ${i + 1}. ${ext}`));

  const extChoice = await question(
    "\nSelect extension to remove (number or name): "
  );
  const extensionName = isNaN(extChoice)
    ? extChoice.trim()
    : extensions[parseInt(extChoice) - 1];

  if (!extensions.includes(extensionName)) {
    console.log("❌ Invalid extension selected");
    return;
  }

  const uis = await getExistingUIs(extensionName);
  console.log(
    `\n⚠️  This will remove extension '${extensionName}' and all its UIs: ${uis.join(", ")}`
  );
  console.log("⚠️  This action cannot be undone!");

  const confirmed = await confirm(
    "\nAre you sure you want to delete this extension?"
  );
  if (!confirmed) {
    console.log("❌ Operation cancelled");
    return;
  }

  const confirmName = await question(
    `Type the extension name to confirm deletion: `
  );
  if (confirmName !== extensionName) {
    console.log("❌ Extension name does not match. Operation cancelled.");
    return;
  }

  console.log(`\n🗑️  Removing extension '${extensionName}'...\n`);

  // Remove extension directory
  const extensionDir = path.join(rootDir, "src/extensions", extensionName);
  await fs.rm(extensionDir, { recursive: true, force: true });

  // Update package.json
  let pkg = await readPackageJson();
  pkg = removeScriptsForExtension(pkg, extensionName);
  pkg = await updateDevBuildScript(pkg);
  await writePackageJson(pkg);

  // Update reearth.yml
  await removeExtensionFromYml(extensionName);

  console.log(`✅ Extension '${extensionName}' removed successfully!`);
};

const removeUI = async () => {
  console.log("\n🗑️  Removing UI...\n");

  const extensions = await getExistingExtensions();
  if (extensions.length === 0) {
    console.log("❌ No extensions found.");
    return;
  }

  console.log("Available extensions:");
  extensions.forEach((ext, i) => console.log(`  ${i + 1}. ${ext}`));

  const extChoice = await question("\nSelect extension (number or name): ");
  const extensionName = isNaN(extChoice)
    ? extChoice.trim()
    : extensions[parseInt(extChoice) - 1];

  if (!extensions.includes(extensionName)) {
    console.log("❌ Invalid extension selected");
    return;
  }

  const uis = await getExistingUIs(extensionName);
  if (uis.length === 0) {
    console.log(`❌ No UIs found in extension '${extensionName}'.`);
    return;
  }

  if (uis.length === 1) {
    console.log(
      `⚠️  Extension '${extensionName}' only has one UI. Consider removing the entire extension instead.`
    );
    const shouldContinue = await confirm(
      "Do you want to continue removing the UI?"
    );
    if (!shouldContinue) {
      console.log("❌ Operation cancelled");
      return;
    }
  }

  console.log("\nAvailable UIs:");
  uis.forEach((ui, i) => console.log(`  ${i + 1}. ${ui}`));

  const uiChoice = await question("\nSelect UI to remove (number or name): ");
  const uiName = isNaN(uiChoice)
    ? uiChoice.trim()
    : uis[parseInt(uiChoice) - 1];

  if (!uis.includes(uiName)) {
    console.log("❌ Invalid UI selected");
    return;
  }

  console.log(
    `\n⚠️  This will remove UI '${uiName}' from extension '${extensionName}'`
  );
  console.log("⚠️  This action cannot be undone!");

  const confirmed = await confirm("\nAre you sure you want to delete this UI?");
  if (!confirmed) {
    console.log("❌ Operation cancelled");
    return;
  }

  console.log(
    `\n🗑️  Removing UI '${uiName}' from extension '${extensionName}'...\n`
  );

  // Remove UI directory
  const uiDir = path.join(rootDir, "src/extensions", extensionName, uiName);
  await fs.rm(uiDir, { recursive: true, force: true });

  // Update extension file to remove UI import and references
  const extensionFile = path.join(
    rootDir,
    "src/extensions",
    extensionName,
    `${extensionName}.ts`
  );
  const extensionContent = await fs.readFile(extensionFile, "utf-8");

  const lines = extensionContent.split("\n");
  const filteredLines = lines.filter(
    (line) =>
      !line.includes(`html_${uiName}`) ||
      (!line.includes("import") && !line.includes("show"))
  );

  await fs.writeFile(extensionFile, filteredLines.join("\n"));

  // Update package.json
  let pkg = await readPackageJson();
  pkg = removeScriptsForUI(pkg, extensionName, uiName);
  pkg = await updateDevBuildScript(pkg);
  await writePackageJson(pkg);

  console.log(
    `✅ UI '${uiName}' removed successfully from extension '${extensionName}'!`
  );
};

// Main menu
const showMenu = () => {
  console.log("\n🔧 Re-Earth Plugin Manager\n");
  console.log("1. Create new extension");
  console.log("2. Create new UI");
  console.log("3. Remove extension");
  console.log("4. Remove UI");
  console.log("5. Exit\n");
};

const main = async () => {
  try {
    console.log("🎉 Welcome to Re-Earth Plugin Manager!");

    while (true) {
      showMenu();
      const choice = await question("Select an option (1-5): ");

      switch (choice.trim()) {
        case "1":
          await createExtension();
          break;
        case "2":
          await createUI();
          break;
        case "3":
          await removeExtension();
          break;
        case "4":
          await removeUI();
          break;
        case "5":
          console.log("\n👋 Goodbye!");
          rl.close();
          return;
        default:
          console.log("❌ Invalid option. Please try again.");
      }

      await question("\nPress Enter to continue...");
    }
  } catch (error) {
    console.error("❌ An error occurred:", error.message);
    rl.close();
    process.exit(1);
  }
};

// Handle cleanup
process.on("SIGINT", () => {
  console.log("\n\n👋 Goodbye!");
  rl.close();
  process.exit(0);
});

main().catch(console.error);
