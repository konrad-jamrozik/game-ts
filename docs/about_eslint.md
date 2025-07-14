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
(see [about-vite.md](about_vite.md)), and then adjusted by me to fit the needs of the project.

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
https://github.com/vitest-dev/eslint-plugin-vitest
npm install --save-dev @vitest/eslint-plugin 

```

Note: a lot of the packages were already installed by the [create-vite react-ts] template.

# ESLint and other tools

Do not run formatter rules, like Prettier, as ESLint rules.
Read more on that in [About Prettier - Prettier and other tools](about_prettier.md#prettier-and-other-tools).

# Linting more files

Read https://typescript-eslint.io/blog/project-service#additional-files

[create-vite react-ts]: https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts
[eslint]: https://eslint.org/
