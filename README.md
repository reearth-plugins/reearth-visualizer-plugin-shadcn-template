# Re:Earth Visualizer Plugin ShadCN Template

This template provides a minimal setup to develop a Re:Earth Visualizer Plugin with Vite, React, ShadCN, and Tailwind CSS.

## Re:Earth Visualizer Plugin Structure

The structure of a Re:Earth Visualizer Plugin aligns with the definitions in `reearth.yml`. Specifically:

- A plugin can contain zero to multiple extensions.
- Extensions come in three types: `widget` `storyBlock` and `infoboxBlock`. However, in terms of structure, these three types are essentially the same when developing extensions.
- Each extension must correspond to a unique JavaScript script.
- An extension can render its UI in three different locations: `main`, `modal`, and `popup`.
  - `main` refers to the primary view of the extension, typically a widget panel or block panel.
  - You can prepare multiple UIs for `main`, `modal`, and `popup`. Each UI will be rendered in a sandboxed iframe, effectively acting as an independent Single Page Application (SPA).

## Demo

This template includes a simple demo of a plugin with a widget extension. The demo helps illustrate the file structure.

First, define the plugin YAML file `public/reearth.yml`:

```yaml
id: reearth-visualizer-plugin-shadcn-template
name: Visualizer plugin shadcn template
version: 1.0.0
extensions:
  - id: demo
    type: widget
    name: Demo
    schema:
      groups:
        - id: appearance
          title: Appearance
          fields:
            - id: primary_color
              title: Primary color
              type: string
              ui: color
```

As shown, it contains a single extension `demo` of type `widget`.

Then, review the structure of the project:

```planttext
my-project/
├── node_modules/
├── public/
│   └── reearth.yml             // Plugin definition
├── src/
│   ├── extensions/
│   │   └── demo/               // Extension folder, naming by extension ID
│   │       ├── main/           // UI project for the main view
│   │       └── demo.ts         // Extension script
│   └── shared/
│       ├── components/         // Shared components of ShadCN
│       ├── lib/                // Shared lib of ShanCN
│       ├── global.css          
│       ├── reearthTypes.ts     // Shared Re:Earth types
│       └── utils.ts
├── dist/                       // Output directory of the plugin build
├── dist-ui/                    // Output directory for the UI build
├── package/                    // Directory for packaging the plugin into a zip file
├── configs/                    // Vite configuration files for both extensions and UI
├── scripts/
├── package.json
└── README.md
```

## Scripts

Refer to the scripts in `package.json`. Here are explanations for some of them:

```zsh
yarn dev:demo:main
```

Starts the development server for the `main` UI project of the `demo` extension.
Ensure you check the environment variables being passed in so you can add your own scripts for different UI projects of different extensions.

```zsh
yarn build:demo:main
```

Builds the `main` UI project of the `demo` extension to `dist-ui/demo/main`.

```zsh
yarn build:demo
```

Builds the `demo` extension to `dist`. The `reearth.yml` file will also be copied to `dist`.

```zsh
yarn build
```

Builds the entire plugin (all extensions to `dist`), generating a zip file in the `package` folder.
Note that `README.md` and `LICENSE` will be included in the zip. Update this script to include build commands for additional extensions as needed.

```zsh
yarn preview
```

Starts the preview server on port `5005`.

## Development Workflow with Re:Earth Visualizer

### Traditional Method

- Start a dev server for the UI project of the extension you are developing.
- Develop the UI, checking it with the dev server.
- Develop the extension script, with no immediate way to check the result.
- Build the plugin and generate the plugin zip file.
- Go to Re:Earth Visualizer, install the plugin via the zip file, and add the widget or block.
- Check the result.

This process is lengthy and results in low development efficiency.

### Improved Method

We are working on adding a new feature to Re:Earth Visualizer to improve the development experience (DX) for plugins. Follow these steps:

0. Preparation:
   - Run Re:Earth Visualizer locally. Only the front-end is required; you can use any backend, such as the OSS backend.
   - Update the plugin code. You can test with the demo.
1. Run `dev-build`:
   This will:
     - Start a dev server for the UI project as usual (you might not use this often).
     - Automatically build the UI upon edits.
     - Automatically build the extension.
     - Start a preview server at `http://localhost:5005`.
2. Set environment variables in the Re:Earth Visualizer front-end project: `REEARTH_WEB_DEV_PLUGIN_URLS='["http://localhost:5005"]'`. The server will automatically restart after .env changes.
3. Done. Now Re:Earth Visualizer will offer two buttons in the editor header:
   - `Install Dev Plugins`
     - This fetches plugin files from the plugin preview, automatically zips, and installs them.
     - Click this only when initially setting up and after modifying `reearth.yml`.
   - `Reload Dev Plugin Extensions`
     - This reloads all extensions from the plugin preview.
     - Only the plugin reloads, which is much faster than reloading the entire page.

### Summary

Once everything is set up, the improved DX workflow will be:

- Make any changes to the plugin code.
- Click `Reload Dev Plugin Extensions` on the local Re:Earth Visualizer webpage.

This workflow significantly improves development efficiency compared to the traditional method.
