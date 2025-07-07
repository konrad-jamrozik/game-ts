
# About the web project setup

- [About the web project setup](#about-the-web-project-setup)
- [Web project setup](#web-project-setup)
- [npm \& Node.js configuration](#npm--nodejs-configuration)
- [TypeScript configuration](#typescript-configuration)
- [Vite](#vite)
  - [Vite setup](#vite-setup)
  - [Vite setup commands](#vite-setup-commands)
  - [Vite configuration](#vite-configuration)
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

1. Installed `node.js` and `npm` using `nvm-windows`, per
[Using a Node installer to install Node.js and npm][npm-use-nvm].  
As of 2026-06-24 the newest `node.js` is `24.2` with `npm v11`. See [releases][node-releases] and [blog post][node-24.0-blog].
`nvm-windows` development stopped at `v1.2.2`.

1. Executed [Vite setup commands](#vite-setup-commands) to scaffold the initial React + TypeScript + Vite project.


- 🚧TODO🚧 Added and configured:
  - Typescript - tsconfig.js,
  - ESLint - TODO
  - Prettier - TODO

# npm & Node.js configuration

🚧TODO🚧

# TypeScript configuration

🚧TODO🚧

# Vite

## Vite setup

The initial React + TypeScript + Vite project scaffolding is done with Vite template.
The instructions are at: [Vite Scaffolding Your First Vite Project][vite-scaffold]
and the template to use is [template-react-ts].

Per [template-react-ts], either [Babel] or [SWC] can be used for Fast Refresh.
The SWC version requires `--template react-swc-ts` but we use the Babel version, i.e. `--template react-ts`.

For more on tsc vs Babel vs SWC, see [babel vs tsc] and [Vite react-ts vs react-swc-ts][soq-vite-swc].

## Vite setup commands

```powershell
npm create vite@latest web -- --template react-ts
cd web
npm install
npm run dev # To locally verify that things work
# git add, commit and push
```


## Vite configuration

🚧TODO🚧

# Vitest configuration

🚧TODO🚧

# ESLint configuration

🚧TODO🚧

# Prettier configuration

🚧TODO🚧

# References

- [Chat about React + TS + Vite]
- https://github.com/konrad-jamrozik/game/blob/main/docs/web_frontend_setup.md
- https://github.com/konrad-jamrozik/game-python/blob/main/web/README.md
- https://github.com/konrad-jamrozik/game-python/blob/main/web/README_web.md

[babel vs tsc]: https://www.typescriptlang.org/docs/handbook/babel-with-typescript.html
[Chat about React + TS + Vite]: https://chatgpt.com/c/684e85cf-dc74-8011-ae8b-18e5d8a16be4
[node-24.0-blog]: https://nodejs.org/en/blog/release/v24.0.0
[node-releases]: https://nodejs.org/en/about/previous-releases
[npm-use-nvm]: https://docs.npmjs.com/downloading-and-installing-node-js-and-npm#using-a-node-version-manager-to-install-nodejs-and-npm
[soq-vite-swc]: https://stackoverflow.com/questions/79111563/what-is-the-difference-of-typescript-vs-typescript-swc-when-creating-a-vite-pr
[template-react-ts]: https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts
[vite-scaffold]: https://vite.dev/guide/#scaffolding-your-first-vite-project
[Babel]: https://babeljs.io/docs/
[SWC]: https://swc.rs/
