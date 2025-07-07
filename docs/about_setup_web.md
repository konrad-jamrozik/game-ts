
# About the web project setup

- [About the web project setup](#about-the-web-project-setup)
- [Web project setup](#web-project-setup)
- [npm \& Node.js configuration](#npm--nodejs-configuration)
- [TypeScript configuration](#typescript-configuration)
- [Vite configuration](#vite-configuration)
- [Vitest configuration](#vitest-configuration)
- [ESLint configuration](#eslint-configuration)
- [Prettier configuration](#prettier-configuration)
- [Reference](#reference)

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

1. Installed `node.js` and `npm` using `nvm-windows`, per
[Using a Node installer to install Node.js and npm][npm-use-nvm].  
As of 2026-06-24 the newest `node.js` is `24.2` with `npm v11`. See [releases][node-releases] and [blog post][node-24.0-blog].
`nvm-windows` development stopped at `v1.2.2`.

- 🚧TODO🚧 Followed [Vite Scaffolding Your First Vite Project][vite-scaffold] with [template-react-ts] to scaffold the project.
- 🚧TODO🚧 Added and configured:
  - Typescript - tsconfig.js,
  - ESLint - TODO
  - Prettier - TODO

# npm & Node.js configuration

🚧TODO🚧

# TypeScript configuration

🚧TODO🚧

# Vite configuration

🚧TODO🚧

# Vitest configuration

🚧TODO🚧

# ESLint configuration

🚧TODO🚧

# Prettier configuration

🚧TODO🚧

# Reference

- [Chat about basic repo setup](https://chatgpt.com/c/684e85cf-dc74-8011-ae8b-18e5d8a16be4)

[npm-use-nvm]: https://docs.npmjs.com/downloading-and-installing-node-js-and-npm#using-a-node-version-manager-to-install-nodejs-and-npm
[vite-scaffold]: https://vite.dev/guide/#scaffolding-your-first-vite-project
[template-react-ts]: https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts
[node-24.0-blog]: https://nodejs.org/en/blog/release/v24.0.0
[node-releases]: https://nodejs.org/en/about/previous-releases
