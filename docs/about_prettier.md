# About prettier

[prettier] is the formatter of choice for TypeScript and JavaScript projects.

Prettier is recommended by react: [doc][react prettier].

# Initial prettier config setup

Ran:

`npm install --save-dev --save-exact prettier`

Then added `prettier.config.js` with right config as well as corresponding formatter settings
to `.vscode/settings.json`.

# Prettier and other tools

Bottom line: run Prettier as a standalone formatter, do not incorporate it into a linter like ESLint.

Specifically:

- DO NOT use [eslint-plugin-prettier], as it runs Prettier as an ESLint rule, which is not recommended.
- IF NECESSARY then use [eslint-config-prettier] to disable ESLint rules that conflict with Prettier.

Prettier talks about this in [ESLint (and other linters)].  
ESLint talks about this in [Suggested usage - Prettier] and [Performance - eslint-plugin-prettier].

# Troubleshooting

If Prettier doesn't want final new line but VS Code is inserting it while formatting on save, add to `settings.json`:
`"files.trimFinalNewlines": true,`

[prettier]: https://prettier.io/
[react prettier]: https://react.dev/learn/editor-setup#formatting
[eslint-plugin-prettier]: https://www.npmjs.com/package/eslint-plugin-prettier
[eslint-config-prettier]: https://www.npmjs.com/package/eslint-config-prettier
[ESLint (and other linters)]: https://prettier.io/docs/install#eslint-and-other-linters
[Suggested usage - Prettier]: https://typescript-eslint.io/users/what-about-formatting/#suggested-usage---prettier
[Performance - eslint-plugin-prettier]: https://typescript-eslint.io/troubleshooting/typed-linting/performance#eslint-plugin-prettier
