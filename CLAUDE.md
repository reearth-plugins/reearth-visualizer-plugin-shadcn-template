# Re-Earth Visualizer Plugin ShadCN Template

## Development Commands

- `yarn dev:demo:main` - Start development server for main UI
- `yarn dev-build` - Run concurrent development build with preview server
- `yarn build` - Build production version and create zip
- `yarn build:demo` - Build demo version (main + extension)
- `yarn preview` - Preview built app on port 5005
- `yarn manage` - Interactive script to create/remove extensions and UIs

## Code Quality

- `yarn lint` - Run ESLint
- `yarn fix` - Fix ESLint issues automatically
- `yarn format` - Format code with Prettier

## Tech Stack

- React 19.1.0 with TypeScript 5.7.2
- Vite 6.0.3 for build tooling
- TailwindCSS 4.1.10 for styling
- Radix UI components with ShadCN/UI (updated versions)
- Re-Earth Core 0.0.7-alpha.11

## Node Requirements

- Node.js >= 20.11.0
- Yarn 4.5.1 (managed via packageManager)

## Architecture

### Plugin Structure

This is a Re-Earth Visualizer plugin template following an extension-ui architecture:

- **Extensions** (`src/extensions/`): Main plugin logic that interfaces with Re-Earth API
  - Each extension contains a main TypeScript file (e.g., `demo.ts`) handling Re-Earth interactions
  - Extensions manage camera controls, event listeners, and data processing
  
- **UI Components** (`src/extensions/{name}/main/`): React UI components for the plugin interface
  - Built with ShadCN/UI and Tailwind CSS
  - Rendered as separate HTML/JS bundles injected into Re-Earth
  
- **Shared Components** (`src/shared/`): Reusable UI components and utilities
  - Common UI components in `components/ui/`
  - Type definitions for Re-Earth API in `reearthTypes/`
  - Utility functions and styling

### Communication Layer

- **PostMessage API**: Bidirectional communication between extension and UI layers
- Extensions post messages to UI components via:
  - `reearth.ui.postMessage()` - for UI components
  - `reearth.modal.postMessage()` - for modal components  
  - `reearth.popup.postMessage()` - for popup components
- UI components send messages back via `window.postMessage()`

### Build Process

- **Extension Build** (`configs/extension.ts`): Bundles extension logic as IIFE JavaScript
- **UI Build** (`configs/ui.ts`): Creates single-file HTML with embedded React app
- Separate builds allow independent deployment of logic and interface

### Extension Management

Use `yarn manage` to interactively:
- **Create Extension**: Generate new extension with multiple UI components
- **Create UI**: Add new UI components to existing extensions
- **Remove Extension**: Delete extension and all associated UIs
- **Remove UI**: Delete individual UI components

The script automatically:
- Updates `package.json` scripts for dev/build commands
- Updates `public/reearth.yml` with extension definitions
- Creates template files with proper imports and structure
- Maintains the dev-build script for concurrent development

## Development Conventions

### Dependencies

- Always use fixed versions (no caret ^ or tilde ~) when adding new dependencies
- Pin exact versions to ensure consistent builds across environments

### Git Conventions

- Keep commit messages brief and on one line
