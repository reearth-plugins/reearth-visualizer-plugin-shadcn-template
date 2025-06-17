# Re-Earth Visualizer Plugin ShadCN Template

## Development Commands

- `yarn dev:demo:main` - Start development server for main UI
- `yarn dev-build` - Run concurrent development build with preview server
- `yarn build` - Build production version and create zip
- `yarn build:demo` - Build demo version (main + extension)
- `yarn preview` - Preview built app on port 5005

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

## Development Conventions

### Dependencies

- Always use fixed versions (no caret ^ or tilde ~) when adding new dependencies
- Pin exact versions to ensure consistent builds across environments

### Git Conventions

- Keep commit messages brief and on one line
