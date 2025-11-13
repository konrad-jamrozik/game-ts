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

# Linting setup

- GH CI uses both and `npm run oxlint` and `npm run eslint:ci`. The latter is a full battery of ESLint rules.
- For local dev I rely on VSCode ESLint and oxc extensions.
- AI agents use `npm run oxlint` which is powered by the very fast `oxlint`.

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
npm install --save-dev tsgolint
npm install --save-dev oxlint-tsgolint
```

Then added `.oxlintrc.json` by migrating with:

```powershell
npx @oxlint/migrate --type-aware
```

Then added `oxlint.configs['flat/all']` to the ESLint config.

# Performance investigation & measurements

https://stackoverflow.com/questions/78186272/how-can-i-find-out-why-eslint-performance-is-slow
https://typescript-eslint.io/troubleshooting/typed-linting/performance/
https://typescript-eslint.io/getting-started/typed-linting

As of 2025-11-12:

Set `$env:TIMING=20` and run `npm run lint:debug` to produce logs.

For analysis, refer to [/web/logs/about_logs.md](/web/logs/about_logs.md) and
 to `/web/logs/eslint_log_analysis.xlsx`.

Bottom line, all lines with >= 1000 ms are:

``` text
   ms   log
99577   eslint:config-loader Config file URL is file:///C:/Users/spawa/repos/game-ts/web/eslint.config.js
 2564   eslint:rules Loading rule 'no-warning-comments' (remaining=290)
44240   eslint:languages:js Parsing: C:\Users\spawa\repos\game-ts\web\src\app\App.tsx
 1130   eslint:languages:js Scope analysis successful: C:\Users\spawa\repos\game-ts\web\src\app\App.tsx
 3099   eslint:languages:js Scope analysis successful: C:\Users\spawa\repos\game-ts\web\src\components\AgentsDataGrid\AgentsToolbar.tsx
 3262   eslint:languages:js Scope analysis successful: C:\Users\spawa\repos\game-ts\web\src\components\MissionCard.tsx
 2000   eslint:languages:js Scope analysis successful: C:\Users\spawa\repos\game-ts\web\src\styling\theme.tsx
 1743   eslint:languages:js Parsing: C:\Users\spawa\repos\game-ts\web\vitest.config.ts
```

And:

``` text
173  Sum s
158  Sum for >=1 s
15   Sum for < 1s
```

So loading config takes 99.5 seconds out of entire 173 s runtime.

However, in CI, the config loading takes only 2.5:

``` text
2025-11-13T04:05:29.572Z eslint:config-loader Config file URL is file:///home/runner/work/game-ts/game-ts/web/eslint.config.js
2025-11-13T04:05:31.108Z eslint:rules Loading rule 'no-warning-comments' (remaining=290)
```

I triggered this by adding to `.github/workflows/web_gh_pages_CICD.yml`:

``` yaml
      - name: Run lint:debug:ci
        run: |
            npm run lint:debug:ci
```

Even running ESLint with caching doesn't help: the config load sometimes takes 90+ seconds, sometimes 2, sometimes 30+.
See [/web/logs/about_logs.md](/web/logs/about_logs.md) for details.

[create-vite react-ts]: https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts
[eslint]: https://eslint.org/
