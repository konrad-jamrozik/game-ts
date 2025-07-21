---
applyTo: 'web/src/**/*.{js,jsx,ts,tsx}'
---
# Copilot Instructions for React in game-ts

## Project React Usage

- This project uses React (with TypeScript) for all UI in `web/src/`.
- Use `web/src/App.tsx` as the main entry point for the app.

## Dependencies usage

- Use MUI for UI components (see `.github/instructions/mui.instructions.md` and `docs/about_mui.md`).
- Use Radash for utility functions (see `docs/about_radash_lodash.md`).

## Coding conventions

- Follow ESLint rules from `web/.eslintrc.js` and Prettier rules from `web/.prettierrc.js`.
- Always use TypeScript types, never interfaces, unless it won't compile otherwise.
- Always use function declarations instead of function expressions if possible.
- Follow linting and formatting rules (see `docs/about_eslint.md` and `docs/about_prettier.md`).
- Tests go into `web/test/` dir and should follow the naming convention `${fileBasenameNoExtension}.test.tsx`.
- Prefer `<Fragment>` over `<>`.
- All React code should follow modern best practices (function components, hooks, strict typing).
- Always verify any changes to React .tsx files by running appropriate Vitest tests.
- Prefer named exports for components and hooks.
- Keep components small and focused. Extract logic to custom hooks when reusable.
- For guidance how to type React components, refer to `docs/about_react.md`.
- Use `props` and TypeScript types for component contracts.
- For styles, prefer CSS modules or MUI's styling solutions. Avoid global styles except in `main.css`.

## Testing & Verification

- Always verify any changes to React .tsx files by running appropriate Vitest tests.
Their file name is typically ${fileBasenameNoExtension}.test.tsx.
- Use `.tsx` for components with JSX, `.ts` for logic-only files.

## Documentation & References

- See `docs/about_react.md` for project-specific React conventions.
- For unclear patterns, check the `docs/` directory or ask for clarification.
