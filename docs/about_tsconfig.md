# About tsconfig.json

- [About tsconfig.json](#about-tsconfigjson)
- [Initial tsconfig\*.json files setup](#initial-tsconfigjson-files-setup)
- [tsconfig\*.json adjustments I made](#tsconfigjson-adjustments-i-made)
  - [Deduplicated values](#deduplicated-values)
  - [Added settings from well-known tsconfig bases](#added-settings-from-well-known-tsconfig-bases)
  - [Targeted newest ECMAScript version](#targeted-newest-ecmascript-version)

Per [tsconfig doc], a TSConfig file in a directory indicates that the directory is the root
of a TypeScript or JavaScript project. It configures the `tsc` compiler and TypeScript in general.
See [Compiling TypeScript] and [tsc CLI options].

# Initial tsconfig*.json files setup

This section describes how I initially set up values of the `tsconfig*.json` files in the `web` project.

The `tsconfig*.json` files in the `web` project were initially generated with a Vite template
(see [about-vite.md](about_vite.md)), and then adjusted by me to fit the needs of the project.

The vite-generated tsconfig files were structured as follows upon generation:

`web/tsconfig.json` - pertains to no files (`"files": []`), only references `./tsconfig.app.json` and `./tsconfig.node.json`.
`web/tsconfig.app.json` - pertains to the app code: `"include": ["src"]`.
`web/tsconfig.node.json` - pertains to Node vite config: `"include": ["vite.config.ts"]`.

Where there was a lot of duplication of config values between the `tsconfig.app.json` and `tsconfig.node.json` files.

# tsconfig*.json adjustments I made

## Deduplicated values

🚧KJA I deduplicated the common logic to `tsconfig.json` by moving duplicated config values there and using
the `"extends": "./tsconfig.json"` entries in the `tsconfig.app.json` and `tsconfig.node.json` files.

## Added settings from well-known tsconfig bases

🚧KJA Include settings from the vite-react and strictest [tsconfig bases] specifically [vite-react] and [strictest].
[tsconfig bases]

## Targeted newest ECMAScript version

🚧KJA Make root dedup configs code and have newest EST target.

[allowImportingTsExtensions]: https://chatgpt.com/share/67ef5b2e-5c98-8011-9be2-5b82258cc788
[create-vite react-ts]: https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts
[strictest]: https://www.npmjs.com/package/@tsconfig/strictest
[vite-react]: https://www.npmjs.com/package/@tsconfig/vite-react

[tsconfig doc]: https://www.typescriptlang.org/tsconfig
[Compiling TypeScript]: https://code.visualstudio.com/docs/typescript/typescript-compiling
[tsc CLI options]: https://www.typescriptlang.org/docs/handbook/compiler-options.html
[tsconfig bases]: https://www.typescriptlang.org/docs/handbook/tsconfig-json.html#tsconfig-bases . Also mentioned at https://www.typescriptlang.org/tsconfig#target
