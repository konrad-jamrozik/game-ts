# Copilot and Cursor Instructions for game-ts

## Project Overview

This repository is a personal game prototype by Konrad Jamrozik.

The game is a purely client-side web app, using:

- TypeScript as the language
- PowerShell as the shell / terminal
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

# Important coding guidelines

- Never memoize values with `React.useMemo`. The project uses React Compiler.
- Never memoize values with `React.useCallback`. The project uses React Compiler.
- Helper functions should be always defined below the caller function.

## Key aspects and conventions of the project

**Sources**: The main web app sources is in `web/`. See Tech Stack below for details.

**Shell**: PowerShell is used throughout the project. Use it for all shell / terminal commands.

**Language**: TypeScript is used throughout the project. Uses project references and modern ES2024 features.

**CI/CD**:  CI/CD is set up to deploy to GitHub Pages on every push to `main`.
  All pushes to `main` trigger lint, format, test, build, and deploy to GitHub Pages.

## Verification of work and build tasks

To verify your changes are correct, rely on the built-in IDE typescript compiler and linter
errors.

**Important**: Every time any significant changes are made, correctness must be verified by running
`npm run qcheck` from the `web/` directory.

If the changes are minor, you can instead only run `npm run oxlint` from the `web/` directory.

Do not run tests, do not run `tsc`, do not run `build`. Only run `qcheck`.

## Task completion and communication

**Important**: Every time you finish a task, include a short commit message in your response. The commit message should:
- Be concise and descriptive
- Summarize the main changes made
- Use imperative mood (e.g., "Add feature" not "Added feature")
- Optionally include a brief bullet list of key changes if the task was complex

Example:

```text
Reorganize components into logical subdirectories

Group related components and move utility functions to component-specific files
```

## Tech stack

This project uses following technologies:

- GitHub pages
- PowerShell
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
- `web/.oxlintrc.json`: oxlint linter config.
- `web/eslint.config.js`: ESLint linter config.
- `web/prettier.config.js`: "Prettier" formatter config.
- `web/vitest.config.ts`: Vitest config for unit tests. Test setup in `src/utils/setupReactTests.ts`.
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

## Coding conventions

- Follow ESLint rules from `web/.eslintrc.js`
- Follow oxlint rules from `web/.oxlintrc.json`
- Follow Prettier rules from `web/prettier.config.js`.
- Always use TypeScript types, never interfaces, unless it won't compile otherwise.
- Always use function declarations instead of function expressions if possible.
- Tests go into `web/test/` dir and should follow the naming convention `${fileBasenameNoExtension}.test.tsx`.
- Prefer `<Fragment>` over `<>`.

## MCP servers

- Use `mui-mcp` MCP server for MUI questions.
- Use `context7` MCP server for documentation of used libraries or frameworks.

### Use the mui-mcp server to answer any MUI questions

1. call the "useMuiDocs" tool to fetch the docs of the package relevant in the question
2. call the "fetchDocs" tool to fetch any additional docs if needed using ONLY the URLs
   present in the returned content.
3. repeat steps 1-2 until you have fetched all relevant docs for the given question
4. use the fetched content to answer the question

## React development conventions

### Project React Usage

- This project uses React (with TypeScript) for all UI in `web/src/`.
- This project uses React Compiler, so never use `React.useMemo` nor `React.useCallback`.
- Use `web/src/App.tsx` as the main entry point for the app.

### React Feature implementation & Code Completeness

- Every time you add a new reducer that has `meta: { playerAction: true }` in `prepare`, for example to
  `web/src/model/gameStateSlice.ts`, also add relevant event to  `web/src/app/eventsMiddleware.ts`.
- Every time you add a new player action, ensure it will show up in event log when executed.

## Shell substitutions

Because the project uses PowerShell, use the following shell substitutions:

- `cat` -> `Write-Output`
- `ls` -> `Get-ChildItem`
- `pwd` -> `Get-Location`
- `cd` -> `Set-Location`
- `mkdir` -> `New-Item`
- `rm` -> `Remove-Item`
- `cp` -> `Copy-Item`

Note that piping into `cat` like `| cat` is not going to work. You must use `Write-Output` instead of `cat`.

---
For any unclear or missing conventions, check the `docs/` directory or ask for clarification.
