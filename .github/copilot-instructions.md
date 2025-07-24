# Copilot Instructions for game-ts

## Project Overview

This repository is a personal game prototype by Konrad Jamrozik.

The game is a purely client-side web app, using:

- TypeScript as the language
- Vite as the build system
- React as the UI framework
- Redux Toolkit for state management
- MUI (Material UI) as web component framework
- IndexedDB with Dexie.js for persistent storage
- GitHub Pages for deployment, via GitHub actions CI/CD
- Radash for utility functions
- Vitest for unit testing
- ESLint for code linting
- Prettier for code formatting

The documentation is in `docs/` directory.
It has project-specific documentation for setup, linting, formatting, testing, MUI, and more.

## Key aspects and conventions of the project

**Sources**: The main web app sources is in `web/`. See Tech Stack below for details.

**Language**: TypeScript is used throughout the project. Uses project references and modern ES2024 features.

**CI/CD**:  CI/CD is set up to deploy to GitHub Pages on every push to `main`. 
  All pushes to `main` trigger lint, format, test, build, and deploy to GitHub Pages.

## Verification of work and build tasks

Run all of the below commands from the `web/` directory to verify your work:

- To check for obvious errors, run `npm run build`.
- To check for code formatting issues, run `npm run format`.
- To fix code formatting issues, run `npm run format:fix`.
- To check for code style issues, run `npm run lint:cached`.
- To fix code style issues, run `npm run lint:fix`.
- To verify that unit tests pass, run `npm run test`.
- To run the development server, run `npm run dev`.
- To install dependencies, run `npm install`.

## Tech stack

This project uses following technologies:

- GitHub pages
- IndexedDB with Dexie.js
- MUI (Material-UI)
- Node.js
- npm
- nvm-windows
- Radash
- React
- Redux Toolkit (RTK)
- TypeScript
- Vite
- Vitest

## Top-level and entry-point files

- `web/src/`: Main React app source code.
- `web/src/main.tsx`: Entry point for the React app.
- `web/src/App.tsx`: Main app component.

## Configuration files

- `web/package.json` for all scripts and dependencies.
- `web/vite.config.ts`: Vite config. Note the `base: '/game-ts/'` for GitHub Pages.
- `web/tsconfig.*.json`: TypeScript config. 
- `web/eslint.config.js`: ESLint linter config.
- `web/prettier.config.js`: "Prettier" formatter config.
- `web/vitest.config.ts`: Vitest config for unit tests. Test setup in `src/setupTests.ts`.
- `docs/`: 
- `.github/workflows/web_gh_pages_CICD.yml`: Main CI/CD workflow. Runs lint, format check, tests, build, and deploy.

### Theme and styling files

- `web/src/styling/theme.tsx`: MUI theme configuration, styling the components.

### State management files

- `web/src/app/store.ts`: Redux toolkit store setup.
- `web/src/app/persist.ts`: Redux store persistence setup using IndexedDB with Dexie.js.
- `web/src/app/hooks.ts`: Custom hooks for accessing the Redux store.
- `web/src/model/*slice.ts`: Redux slices for game state management.

### Component files

- `web/src/components/`: React components, including MUI components.
- `web/src/app/eventsMiddleware.ts`: Redux toolkit store events middleware for recording state changes in form of events.
- `web/src/components/EventLog.tsx`: Component for displaying the event log.

## MCP servers

- Use `mui-mcp` MCP server for MUI questions.
- Use `context7` MCP server for documentation of used libraries or frameworks.

---
For any unclear or missing conventions, check the `docs/` directory or ask for clarification.
