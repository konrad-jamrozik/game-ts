---
applyTo: 'web/src/**/*.{js,jsx,ts,tsx}'
---
# Copilot Instructions for React in game-ts

## Project React Usage

- This project uses React (with TypeScript) for all UI in `web/src/`.
- Use `web/src/App.tsx` as the main entry point for the app.
- Refer to `.github/copilot-instructions.md` for general project setup, architecture, dependencies, and conventions.

## Coding conventions

- Follow ESLint rules from `web/.eslintrc.js` 
- Follow Prettier rules from `web/prettier.config.js`.
- Always use TypeScript types, never interfaces, unless it won't compile otherwise.
- Always use function declarations instead of function expressions if possible.
- Tests go into `web/test/` dir and should follow the naming convention `${fileBasenameNoExtension}.test.tsx`.
- Every time a new reducer is added to `web/src/model/gameStateSlice.ts`, remember to add appropriate handler to `web/src/app/eventsMiddleware.ts`.
- Prefer `<Fragment>` over `<>`.
