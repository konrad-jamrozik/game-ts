---
applyTo: 'web/src/**/*.{js,jsx,ts,tsx}'
---
# Copilot Instructions for React in game-ts

## Project React Usage

- This project uses React (with TypeScript) for all UI in `web/src/`.
- Use `web/src/App.tsx` as the main entry point for the app.
- Refer to `.github/copilot-instructions.md` for general project setup, architecture, dependencies, and conventions.

## Feature implementation & Code Completeness

- Every time you add a new reducer that has `meta: { playerAction: true }` in `prepare`, for example to `web/src/model/gameStateSlice.ts`, also add relevant event to  `web/src/app/eventsMiddleware.ts`.
- Every time you add a new player action, ensure it will show up in event log when executed.

## Coding conventions

- Follow ESLint rules from `web/.eslintrc.js` 
- Follow Prettier rules from `web/prettier.config.js`.
- Always use TypeScript types, never interfaces, unless it won't compile otherwise.
- Always use function declarations instead of function expressions if possible.
- Tests go into `web/test/` dir and should follow the naming convention `${fileBasenameNoExtension}.test.tsx`.
- Prefer `<Fragment>` over `<>`.
