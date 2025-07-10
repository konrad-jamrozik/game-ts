# About eslint

- [About eslint](#about-eslint)
- [How to run eslint](#how-to-run-eslint)
  - [Integrate eslint with VS Code](#integrate-eslint-with-vs-code)
  - [Run eslint from command line](#run-eslint-from-command-line)
- [Initial eslint config setup](#initial-eslint-config-setup)
  - [eslint adjustments I made](#eslint-adjustments-i-made)
  - [Commands I executed to install the required eslint packages](#commands-i-executed-to-install-the-required-eslint-packages)

[eslint] is a code linter for TypeScript and JavaScript projects.

# How to run eslint

## Integrate eslint with VS Code

https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint

## Run eslint from command line

`npm run lint`

Doc: https://eslint.org/docs/latest/use/command-line-interface

Flags used:

- https://eslint.org/docs/latest/use/command-line-interface#--report-unused-disable-directives
- https://eslint.org/docs/latest/use/command-line-interface#--max-warnings

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
# https://github.com/import-js/eslint-plugin-import/tree/main?tab=readme-ov-file#installation
npm install eslint-plugin-import --save-dev
```

Note: a lot of the packages were already installed by the [create-vite react-ts] template.

🚧KJA

[eslint]: https://eslint.org/
[create-vite react-ts]: https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts
