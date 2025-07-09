
# About the web project setup

- [About the web project setup](#about-the-web-project-setup)
- [Web project setup](#web-project-setup)
- [nvm-windows, Node.js and npm configuration](#nvm-windows-nodejs-and-npm-configuration)
  - [Install nvm-windows, and Node.js \& npm using it](#install-nvm-windows-and-nodejs--npm-using-it)
  - [Commands to update to latest nvm, Node.js and npm version](#commands-to-update-to-latest-nvm-nodejs-and-npm-version)
- [TypeScript configuration](#typescript-configuration)
- [Vitest configuration](#vitest-configuration)
- [ESLint configuration](#eslint-configuration)
- [Prettier configuration](#prettier-configuration)
- [References](#references)

This doc describes how the web project as set up, which is a substep of the overall [repository setup](./about_setup_repo.md).

# Web project setup

The web project is using following core technologies, alphabetically:

- Node.js
- npm
- React
- TypeScript
- Vite
- Vitest

I set it up as follows:

1. I followed the process to [install nvm-windows, and Node.js & npm using it](#install-nvm-windows-and-nodejs--npm-using-it).
1. To scaffold the initial React + TypeScript + Vite project, I executed [Vite setup commands](about_vite.md#vite-setup-commands).
1. I updated the `tsconfig.*.json` files. See [About tsconfig.json](about_tsconfig.md).
1. I configured [eslint] code linting rules. See [About ESLint](about_eslint.md).

- 🚧KJA Added and configured:
  - Typescript - tsconfig.js,
  - ESLint - TODO
  - Prettier - TODO

# nvm-windows, Node.js and npm configuration

## Install nvm-windows, and Node.js & npm using it

First install `nvm-for-windows`, by following: [Using a Node installer to install Node.js and npm][npm-use-nvm]

Then follow the [commands below](#commands-to-update-to-latest-nvm-nodejs-and-npm-version).

## Commands to update to latest nvm, Node.js and npm version

```powershell
# First, we ensure we are on latest nvm, which should be `1.2.2` as of 2025-07-07 and never go above that.
nvm upgrade

# Now we install and switch to latest Node.js and npm version.
nvm install latest
nvm use <the_version_displayed_by_nvm>

# List versions
nvm --version # 1.2.2 as of 2025-07-07. Should never change.
nvm current # v24.3.0 as of 2025-07-07
npm --version # 11.4.2 as of 2025-07-07
```

See also:

- [nvm-windows]: `nvm-windows` development stopped at `v1.2.2`.
- [node-releases]
- [Node 24.0 blog post][node-24.0-blog]

🚧KJA

# TypeScript configuration

🚧KJA

# Vitest configuration

🚧KJA

# ESLint configuration

🚧KJA

# Prettier configuration

🚧KJA

# References

- [Chat about React + TS + Vite]
- https://github.com/konrad-jamrozik/game/blob/main/docs/web_frontend_setup.md
- https://github.com/konrad-jamrozik/game-python/blob/main/web/README.md
- https://github.com/konrad-jamrozik/game-python/blob/main/web/README_web.md

[Chat about React + TS + Vite]: https://chatgpt.com/c/684e85cf-dc74-8011-ae8b-18e5d8a16be4
[eslint]: https://eslint.org/
[node-24.0-blog]: https://nodejs.org/en/blog/release/v24.0.0
[node-releases]: https://nodejs.org/en/about/previous-releases
[npm-use-nvm]: https://docs.npmjs.com/downloading-and-installing-node-js-and-npm#using-a-node-version-manager-to-install-nodejs-and-npm
[nvm-windows]: https://github.com/coreybutler/nvm-windows
