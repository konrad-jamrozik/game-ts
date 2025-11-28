
# Common dev tasks

All these commands to be run from the `web/` directory:

# Fast commands

- To check for code formatting issues, run `npm run format`.
- To fix code formatting issues, run `npm run format:fix`.
- To check for code style issues, run `npm run oxlint`.

# Slow commands

- To do thorough linting check, run `npm run eslint:cached`.
- To fix code style issues, run `npm run eslint:fix`.
- To check if the project types and builds, run `npm run build`.
- To verify that unit tests pass, run `npm run test`
- To do relatively quick verification of the project, run `npm run qcheck`.
  - It runs `oxlint`, `tsc` and `test` commands.

# Very slow commands

- To verify e2e tests pass, run `npm run test:e2e`
- To do thorough check of all validations, run `npm run check`.
  - It runs `format`, `oxlint`, `eslint:cached`, `build` and `test:all` commands.

# Misc. commands

- To run the development server, run `npm run dev`.
- To install dependencies, run `npm install`.
