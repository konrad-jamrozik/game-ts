# Copilot Instructions for game-ts

## Project Overview

- This repository is a personal game prototype by Konrad Jamrozik.
- The main web app is in `web/` and uses React, TypeScript, Vite, MUI (Material UI), and Radash.
- CI/CD is set up to deploy to GitHub Pages on every push to `main`.

## Architecture & Key Files

- `web/src/`: Main React app source code.
- `web/vite.config.ts`: Vite config. Note the `base: '/game-ts/'` for GitHub Pages.
- `web/tsconfig.*.json`: TypeScript config. Uses project references and modern ES2024 features.
- `web/eslint.config.js` and `web/prettier.config.js`: Linting and formatting config. See docs for details.
- `web/vitest.config.ts`: Vitest config for unit tests. Test setup in `src/setupTests.ts`.
- `docs/`: Project-specific documentation for setup, linting, formatting, testing, MUI, and more.
- `.github/workflows/web_gh_pages_CICD.yml`: Main CI/CD workflow. Runs lint, format check, tests, build, and deploy.

## Developer Workflows

- **Install dependencies:** `npm clean-install` (see CI)
- **Run dev server:** `npm run dev` (from `web/`)
- **Build:** `npm run build`
- **Lint:** `npm run lint` (strict, type-aware)
- **Format:** `npm run format` (uses Prettier, standalone)
- **Test:** `npm run test` (Vitest, see `docs/about_vitest.md` for UI and coverage)
- **Test UI:** `npm run test:ui` (Vitest UI, port 6174)
- **Fix lint/format:** `npm run lint:fix`, `npm run format:fix`

## Project Conventions & Patterns

- **Linting:** ESLint is configured for strict, type-aware rules. See `docs/about_eslint.md`.
- **Formatting:** Prettier is used standalone, not via ESLint. See `docs/about_prettier.md`.
- **Testing:** Vitest is used for all tests. See `docs/about_vitest.md` for setup, UI, and port config.
- **MUI:** See `docs/about_mui.md` for setup and MCP server integration. Use the MCP server for MUI questions.
- **Documentation:** Project-specific docs are in `docs/` and referenced throughout config files.
- **TypeScript:** Uses project references and modern features. See `docs/about_tsconfig.md`.
- **CI/CD:** All pushes to `main` trigger lint, format, test, build, and deploy to GitHub Pages.

## Integration Points & External Dependencies

- **MUI (Material UI):** Used for UI components. MCP server is configured for AI assistance.
- **Radash:** Utility library, see `docs/about_radash_lodash.md`.
- **GitHub Pages:** Deployment target. See `docs/about_github_pages.md`.
- **nvm-windows:** Node version management. See `docs/about_setup_web.md`.

## Examples & References

- See `web/package.json` for all scripts and dependencies.
- See `docs/about_*` for detailed setup and conventions.
- For MUI or Vitest/testing questions, always check `docs/about_mui.md` and `docs/about_vitest.md` first.

---
For any unclear or missing conventions, check the `docs/` directory or ask for clarification.
