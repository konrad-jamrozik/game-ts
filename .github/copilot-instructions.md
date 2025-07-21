# Copilot Instructions for game-ts

## Project Overview

- This repository is a personal game prototype by Konrad Jamrozik.
- The main web app is in `web/` and uses React, TypeScript, Vite, MUI (Material UI), and Radash.
- Detailed documentation is in the `docs/` directory. 
  It has project-specific documentation for setup, linting, formatting, testing, MUI, and more.
- CI/CD is set up to deploy to GitHub Pages on every push to `main`.


## Project Conventions & Patterns

- **Linting:** ESLint is configured for strict, type-aware rules.
- **Formatting:** Prettier is used standalone, not via ESLint.
- **Testing:** Vitest is used for all tests.
- **MUI:** Use the MCP server for MUI questions.
- **Documentation:** Project-specific docs are in `docs/` and referenced throughout config files.
- **TypeScript:** Uses project references and modern features. See `docs/about_tsconfig.md`.
- **CI/CD:** All pushes to `main` trigger lint, format, test, build, and deploy to GitHub Pages.


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

### Theme and styling files

- `web/src/theme.tsx`: MUI theme configuration, styling the components.

### State management files

- `web/src/app/store.ts`: Redux toolkit store setup.
- `web/src/app/hooks.ts`: Custom hooks for accessing the Redux store.
- `web/src/model/*slice.ts`: Redux slices for game state management.

### Component files

- `web/src/components/`: React components, including MUI components.
- `web/src/app/eventsMiddleware.ts`: Redux toolkit store events middleware for recording state changes in form of events.
- `web/src/components/EventLog.tsx`: Component for displaying the event log.

## Configuration files

- `web/vite.config.ts`: Vite config. Note the `base: '/game-ts/'` for GitHub Pages.
- `web/tsconfig.*.json`: TypeScript config. Uses project references and modern ES2024 features.
- `web/eslint.config.js`: ESLint linter config.
- `web/prettier.config.js`: "Prettier" formatter config.
- `web/vitest.config.ts`: Vitest config for unit tests. Test setup in `src/setupTests.ts`.
- `docs/`: 
- `.github/workflows/web_gh_pages_CICD.yml`: Main CI/CD workflow. Runs lint, format check, tests, build, and deploy.


## Developer Workflows

All of the below commands to be run from the `web/` directory.

- **Install dependencies:** `npm clean-install` (see CI)
- **Run dev server:** `npm run dev`
- **Build:** `npm run build`
- **Lint:** `npm run lint:cached` (strict, type-aware)
- **Fix Lint:** `npm run lint:fix`
- **Format:** `npm run format` (uses Prettier, standalone)
- **Fix Format:** `npm run format:fix`
- **Test:** `npm run test` (Vitest)

## Integration Points & External Dependencies

- **MUI (Material UI):** Used for UI components. MCP server is configured for AI assistance.
- **React:** All UI is built with React and TypeScript. For React-specific conventions, see `docs/about_react.md` and `.github/instructions/react.instructions.md`.
- **Radash:** Utility library, see `docs/about_radash_lodash.md`.
- **GitHub Pages:** Deployment target. See `docs/about_github_pages.md`.
- **nvm-windows:** Node version management. See `docs/about_setup_web.md`.

## Examples & References

- See `web/package.json` for all scripts and dependencies.
- See `docs/about_*` for detailed setup and conventions.
- For MUI questions, always check `docs/about_mui.md` and `.github/instructions/mui.instructions.md` first.
- For React questions, always check `docs/about_react.md` and `.github/instructions/react.instructions.md` first.
- For Vitest/testing questions, always check `docs/about_vitest.md` and `.github/instructions/vitest.instructions.md` first.
- Use context7 MCP server when looking for documentations of used libraries or frameworks.

---
For any unclear or missing conventions, check the `docs/` directory or ask for clarification.
