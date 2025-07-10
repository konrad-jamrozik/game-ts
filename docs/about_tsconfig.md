# About tsconfig.json

- [About tsconfig.json](#about-tsconfigjson)
- [Initial tsconfig\*.json files setup](#initial-tsconfigjson-files-setup)
- [tsconfig\*.json adjustments I made](#tsconfigjson-adjustments-i-made)
  - [Deduplicated values](#deduplicated-values)
  - [Updated settings based on existing documentation](#updated-settings-based-on-existing-documentation)
  - [Targeted newest ECMAScript version](#targeted-newest-ecmascript-version)

Per [tsconfig doc], a TSConfig file in a directory indicates that the directory is the root
of a TypeScript or JavaScript project. It configures the `tsc` compiler and TypeScript in general.
See [Compiling TypeScript] and [tsc CLI options].

# Initial tsconfig*.json files setup

This section describes how I initially set up values of the `tsconfig*.json` files in the `web` project.

The `tsconfig*.json` files in the `web` project were initially generated with a Vite template
(see [about-vite.md](about_vite.md)), and then adjusted by me to fit the needs of the project.

The vite-generated tsconfig files were structured as follows upon generation by Vite:

`web/tsconfig.json` - pertains to no files (`"files": []`), only references `./tsconfig.app.json` and `./tsconfig.node.json`.

`web/tsconfig.app.json` - pertains to the app code: `"include": ["src"]`.

`web/tsconfig.node.json` - pertains to Node vite config: `"include": ["vite.config.ts"]`.

Where there was a lot of duplication of config values between the `tsconfig.app.json` and `tsconfig.node.json` files.

# tsconfig*.json adjustments I made

## Deduplicated values

I deduplicated the common logic to `tsconfig.json` by moving duplicated config values there and using
the `"extends": "./tsconfig.json"` entries in the `tsconfig.app.json` and `tsconfig.node.json` files.
This matches the official guidance: [ts project references guidance].

## Updated settings based on existing documentation

I updated the `tsconfig` settings based on the following:

- What was initially provided by the Vite template [create-vite react-ts].
- What is recommended by the [vite-react] config base from the official [tsconfig bases].
- What is recommended by the [strictest] config base from the official [tsconfig bases].
- What Vite doc says about `tsconfig` options like:
  - [vite-pre-bundle] mentioning `esbuild` an hence requiring `isolatedModules` per [vite-isolatedmodules]
  - Explanation [why `skipLibCheck` is used by the template][vite-skiplibcheck].
  - Notes on options to [reduce resolve operations][vite-reduce-resolve].
- What the [tsconfig reference doc][tsconfig doc] says.
- The recommendation from [this blog post][ts 5.9 tsconfig].

## Targeted newest ECMAScript version

I targeted the newest ECMAScript version, which is currently ES2024, as of TypeScript 5.9.
See [version history] for the latest ECMAScript version.

[Compiling TypeScript]: https://code.visualstudio.com/docs/typescript/typescript-compiling
[create-vite react-ts]: https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts
[strictest]: https://www.npmjs.com/package/@tsconfig/strictest
[ts 5.9 tsconfig]: https://devblogs.microsoft.com/typescript/announcing-typescript-5-9-beta/
[ts project references guidance]: https://www.typescriptlang.org/docs/handbook/project-references.html#guidance
[tsc CLI options]: https://www.typescriptlang.org/docs/handbook/compiler-options.html
[tsconfig bases]: https://www.typescriptlang.org/docs/handbook/tsconfig-json.html#tsconfig-bases
[tsconfig doc]: https://www.typescriptlang.org/tsconfig
[version history]: https://en.wikipedia.org/wiki/ECMAScript_version_history
[vite-isolatedmodules]: https://vite.dev/guide/features.html#isolatedmodules
[vite-pre-bundle]: https://vite.dev/guide/why.html#slow-server-start
[vite-react]: https://www.npmjs.com/package/@tsconfig/vite-react
[vite-reduce-resolve]: https://vite.dev/guide/performance.html#reduce-resolve-operations
[vite-skiplibcheck]: https://vite.dev/guide/features.html#other-compiler-options-affecting-the-build-result
