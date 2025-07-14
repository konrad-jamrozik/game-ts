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

- Follow linting and formatting rules (see `docs/about_eslint.md` and `docs/about_prettier.md`).
- All React code should follow modern best practices (function components, hooks, strict typing).
- Always verify any changes to React .tsx files by running appropriate Vitest tests.
- Prefer named exports for components and hooks.
- Use `useState`, `useEffect`, and other React hooks for state and side effects.
- Keep components small and focused. Extract logic to custom hooks when reusable.
- For guidance how to type React components, refer to `docs/about_react.md`.
- Use `props` and TypeScript interfaces for component contracts.
- For styles, prefer CSS modules or MUI's styling solutions. Avoid global styles except in `index.css`.

## Testing & Verification

- For testing, use Vitest and React Testing Library (see `docs/about_vitest.md`).
The test file name is typically ${fileBasenameNoExtension}.test.tsx.
- Use `.tsx` for components with JSX, `.ts` for logic-only files.

## Documentation & References

- See `docs/about_react.md` for project-specific React conventions.
- For unclear patterns, check the `docs/` directory or ask for clarification.
