# About eslint

- [About eslint](#about-eslint)
- [How to run eslint](#how-to-run-eslint)
  - [Integrate eslint with VS Code](#integrate-eslint-with-vs-code)
  - [Run eslint from command line](#run-eslint-from-command-line)
- [How to inspect eslint config with config inspector](#how-to-inspect-eslint-config-with-config-inspector)
- [How to prevent VS Code eslint extension from trying to lint unrelated files](#how-to-prevent-vs-code-eslint-extension-from-trying-to-lint-unrelated-files)
- [Initial eslint config setup](#initial-eslint-config-setup)
  - [eslint adjustments I made](#eslint-adjustments-i-made)
  - [Commands I executed to install the required eslint packages](#commands-i-executed-to-install-the-required-eslint-packages)
- [ESLint and other tools](#eslint-and-other-tools)
- [Linting more files](#linting-more-files)

[eslint] is a code linter for TypeScript and JavaScript projects.

# How to run eslint

## Integrate eslint with VS Code

https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint

Add to `.vscode/settings.json`:

``` json
    "eslint.useFlatConfig": true,
    "eslint.workingDirectories": [
        "web"
    ],
    "eslint.validate": [
        "javascript",
        "javascriptreact",
        "typescript",
        "typescriptreact"
    ]      
```

## Run eslint from command line

`npm run lint`

Doc: https://eslint.org/docs/latest/use/command-line-interface

Flags used:

- https://eslint.org/docs/latest/use/command-line-interface#--report-unused-disable-directives
- https://eslint.org/docs/latest/use/command-line-interface#--max-warnings

# How to inspect eslint config with config inspector

Use the config inspector:
`npx @eslint/config-inspector@latest`

Docs:

- https://eslint.org/blog/2024/04/eslint-config-inspector/
- https://github.com/eslint/config-inspector

# How to prevent VS Code eslint extension from trying to lint unrelated files

Set `eslint.workingDirectories: web` in `.vscode/settings.json` file.
Otherwise you will in VS Code Output / ESLint errors like:

``` text
[Error - 1:17:56 AM] Calculating config file for file:///.../game-ts/.vscode/settings.json) failed.
Error: Could not find config file.
    at assertConfigurationExists (C:\...\game-ts\node_modules\eslint\lib\config\config-loader.js:80:17)
```

# Initial eslint config setup

This section describes how I initially configured `eslint` in the `web` project.

The `eslint.config.js` file in the `web` project was  initially generated with a Vite template
(see [about_vite.md](about_vite.md)), and then adjusted by me to fit the needs of the project.

Note that the README generated with the [create-vite react-ts] template
mentions instructions how to update the config, which I took into account when
[making my adjustments](#eslint-adjustments-i-made).

## eslint adjustments I made

1. I updated the config to target latest ECMA script standard.
1. I made it extend few strict base configs I found in my research.
1. I updated the `web/package.json/scripts` commands for eslint.
1. I tweaked each rule to my specific needs. This is ongoing process.

For the details of the configs I decided to extend, refer to the comments
in the config file itself [eslint.config.js](../web/eslint.config.js).

## Commands I executed to install the required eslint packages

```powershell
# https://eslint-react.xyz/docs/getting-started/typescript
npm install --save-dev typescript-eslint @eslint-react/eslint-plugin
# https://github.com/un-ts/eslint-plugin-import-x#installation
# OBSOLETE/SUBSUMED BY eslint-plugin-import-x: https://github.com/import-js/eslint-plugin-import/tree/main?tab=readme-ov-file#installation
npm install --save-dev eslint-plugin-import-x
# https://github.com/import-js/eslint-import-resolver-typescript#eslint-plugin-import-x
npm install --save-dev eslint-import-resolver-typescript
# https://github.com/sindresorhus/eslint-plugin-unicorn
npm install --save-dev eslint eslint-plugin-unicorn
# https://tsdoc.org/pages/packages/eslint-plugin-tsdoc/
npm install --save-dev eslint-plugin-tsdoc
# https://github.com/vitest-dev/eslint-plugin-vitest
npm install --save-dev @vitest/eslint-plugin
# https://github.com/testing-library/eslint-plugin-testing-library#installation
npm install --save-dev eslint-plugin-testing-library
# https://github.com/testing-library/eslint-plugin-jest-dom#installation
npm install --save-dev eslint-plugin-jest-dom
# See also about_react.md#setup-react-19-compiler
# https://www.npmjs.com/package/eslint-plugin-react-compiler
npm install --save-dev eslint-plugin-react-compiler
```

Note: a lot of the packages were already installed by the [create-vite react-ts] template.

# ESLint and other tools

Do not run formatter rules, like Prettier, as ESLint rules.
Read more on that in [About Prettier - Prettier and other tools](about_prettier.md#prettier-and-other-tools).

# Linting more files

Read https://typescript-eslint.io/blog/project-service#additional-files

# Oxlint setup

https://oxc.rs/docs/guide/usage/linter.html

Installed with:

``` bash
npm install --save-dev oxlint
npm install --save-dev eslint-plugin-oxlint
```

Then added `.oxlintrc.json` by migrating with:

```powershell
npx @oxlint/migrate --type-aware
```

Then added `oxlint.configs['flat/all']` to the ESLint config.

# Performance investigation

https://stackoverflow.com/questions/78186272/how-can-i-find-out-why-eslint-performance-is-slow
https://typescript-eslint.io/troubleshooting/typed-linting/performance/
https://typescript-eslint.io/getting-started/typed-linting

I created an empty ESLint config that still runs for 10+ seconds, possibly minutes, when TS parser is enabled.
But this is needed to parse TypeScript correctly.

``` javascript
export default plugTypescriptEslint.config([
  globalIgnores(['dist', 'coverage']),
  {
    name: 'cfg',
    files: ['**/*.{ts,tsx}'],
    plugins: {},
    extends: [],
    languageOptions: {
      ecmaVersion: 2024,
      globals: globals.browser,
      // ====> THIS IS THE CULPRIT <====
      // BUT REQUIRED FOR TYPESCRIPT SYNTAX PARSING
      parser: plugTypescriptEslint.parser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
```

# Performance measurements

As of 2025-11-11:

```powershell
measure-Command { npm run lint }

# Before I added oxlint.configs['flat/all'] to the ESLint config

TotalHours        : 0.0581391343611111
TotalMinutes      : 3.48834806166667
TotalSeconds      : 209.3008837

# After I added oxlint.configs['flat/all'] to the ESLint config

TotalHours        : 0.0565549312777778
TotalMinutes      : 3.39329587666667
TotalSeconds      : 203.5977526

$env:TIMING=20; npm run lint

> web@0.0.0 lint
> eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0

Rule                                            | Time (ms) | Relative
:-----------------------------------------------|----------:|--------:
@typescript-eslint/no-deprecated                |  3950.912 |    40.8%
@typescript-eslint/no-misused-promises          |  2154.413 |    22.2%
import-x/namespace                              |  1080.965 |    11.2%
react-compiler/react-compiler                   |   684.500 |     7.1%
@typescript-eslint/no-unsafe-assignment         |   282.774 |     2.9%
unicorn/no-unnecessary-polyfills                |   146.228 |     1.5%
@typescript-eslint/no-floating-promises         |    85.799 |     0.9%
@typescript-eslint/naming-convention            |    80.818 |     0.8%
@typescript-eslint/promise-function-async       |    72.911 |     0.8%
import-x/no-unresolved                          |    45.718 |     0.5%
@typescript-eslint/no-redeclare                 |    41.130 |     0.4%
@typescript-eslint/no-unsafe-return             |    39.543 |     0.4%
@typescript-eslint/no-unsafe-argument           |    29.553 |     0.3%
@typescript-eslint/no-unnecessary-condition     |    28.224 |     0.3%
unicorn/expiring-todo-comments                  |    27.523 |     0.3%
import-x/no-named-as-default                    |    26.279 |     0.3%
unicorn/no-thenable                             |    22.403 |     0.2%
@typescript-eslint/unbound-method               |    22.211 |     0.2%
camelcase                                       |    22.205 |     0.2%
@typescript-eslint/no-confusing-void-expression |    16.937 |     0.2%
```

## Slow config load on eslint.config.js

``` powershell
measure-command { npm run lint:debug }
# which resolves to:
eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0 --debug > lint.debug.txt 2>&1

Output in lint.debug.txt
2025-11-13T00:18:02.506Z eslint:cli CLI args: [ '.', '--ext', 'ts,tsx', '--report-unused-disable-directives', '--max-warnings', '0', '--debug' ]
2025-11-13T00:18:02.507Z eslint:cli Using flat config? true
2025-11-13T00:18:02.512Z eslint:cli Running on files
2025-11-13T00:18:02.513Z eslint:eslint Using config loader LegacyConfigLoader
2025-11-13T00:18:02.514Z eslint:eslint Using file patterns: .
2025-11-13T00:18:02.514Z eslint:eslint Deleting cache file at C:\Users\spawa\repos\game-ts\web\.eslintcache
2025-11-13T00:18:02.820Z eslint:config-loader Calculating config for file C:\Users\spawa\repos\game-ts\web\.gitignore
2025-11-13T00:18:02.820Z eslint:config-loader Searching for eslint.config.js
2025-11-13T00:18:02.822Z eslint:config-loader [Legacy]: Calculating config for C:\Users\spawa\repos\game-ts\web\.gitignore
2025-11-13T00:18:02.822Z eslint:config-loader [Legacy]: Using config file C:\Users\spawa\repos\game-ts\web\eslint.config.js and base path C:\Users\spawa\repos\game-ts\web
2025-11-13T00:18:02.822Z eslint:config-loader Calculating config array from config file C:\Users\spawa\repos\game-ts\web\eslint.config.js and base path C:\Users\spawa\repos\game-ts\web
2025-11-13T00:18:02.824Z eslint:config-loader Loading config file C:\Users\spawa\repos\game-ts\web\eslint.config.js
2025-11-13T00:18:02.824Z eslint:config-loader Loading config from C:\Users\spawa\repos\game-ts\web\eslint.config.js
2025-11-13T00:18:02.824Z eslint:config-loader Config file URL is file:///C:/Users/spawa/repos/game-ts/web/eslint.config.js
2025-11-13T00:19:35.901Z eslint:rules Loading rule 'no-warning-comments' (remaining=290)
2025-11-13T00:19:42.602Z eslint:rules Loading rule 'consistent-return' (remaining=289)
```

In the log above, observe the big jump timestamp jump after "Config file URL":
``` powershell
2025-11-13T00:18:02.824Z eslint:config-loader Loading config file C:\Users\spawa\repos\game-ts\web\eslint.config.js
2025-11-13T00:18:02.824Z eslint:config-loader Loading config from C:\Users\spawa\repos\game-ts\web\eslint.config.js
2025-11-13T00:18:02.824Z eslint:config-loader Config file URL is file:///C:/Users/spawa/repos/game-ts/web/eslint.config.js
2025-11-13T00:19:35.901Z eslint:rules Loading rule 'no-warning-comments' (remaining=290)
2025-11-13T00:19:42.602Z eslint:rules Loading rule 'consistent-return' (remaining=289)

```
which is 1m 33s.

[create-vite react-ts]: https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts
[eslint]: https://eslint.org/
