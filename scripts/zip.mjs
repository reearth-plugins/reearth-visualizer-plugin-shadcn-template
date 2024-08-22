import fs from "fs";
import path from "path";

import archiver from "archiver";
import Yml from "yml";

async function zipDirectory(sourceDir, outPath) {
  const archive = archiver("zip", { zlib: { level: 9 } });
  const stream = fs.createWriteStream(outPath);

  return new Promise((resolve, reject) => {
    archive
      .directory(sourceDir, false)
      .on("error", (err) => reject(err))
      .pipe(stream);

    stream.on("close", () => resolve());
    archive.finalize();
  });
}

async function main() {
  const rootDir = path.resolve("./");
  const sourceDir = path.resolve("dist");
  const outputDir = path.resolve("package");

  const reearthYml = Yml.load(`${rootDir}/public/reearth.yml`);
  const filename = `${reearthYml.id}-${reearthYml.version}.zip`;

  const outputPath = path.join(outputDir, filename);

  fs.copyFileSync(`${rootDir}/README.md`, `${sourceDir}/README.md`);
  fs.copyFileSync(`${rootDir}/LICENSE`, `${sourceDir}/LICENSE`);

  try {
    // Ensure the package directory exists
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    await fs.mkdir(outputDir, { recursive: true }, () => {});

    await zipDirectory(sourceDir, outputPath);
    console.log(`Zipped ${sourceDir} to ${outputPath}.`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
  }
}

main();
