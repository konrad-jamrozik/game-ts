# About tsconfig.json

Per [tsconfig doc], a TSConfig file in a directory indicates that the directory is the root
of a TypeScript or JavaScript project.

# Initial tsconfig*.json files setup

The `tsconfig*.json` files in the `web` project were initially generated with a Vite template
(see [about-vite.md](about_vite.md)), and then adjusted by me to fit the needs of the project.

The vite-generated tsconfig files were structured as follows:

`web/tsconfig.json` - pertains to no files (`"files": []`), only references `./tsconfig.app.json` and `./tsconfig.node.json`.
`web/tsconfig.app.json` - pertains to the app code: `"include": ["src"]`.
`web/tsconfig.node.json` - pertains to Node vite config: `"include": ["vite.config.ts"]`.

Where there was a lot of duplication of config values between the `tsconfig.app.json` and `tsconfig.node.json` files.

# tsconfig*.json adjustments

- I deduplicated the common logic to `tsconfig.json` by moving duplicated config values there and using
the `"extends": "./tsconfig.json"` entries in the `tsconfig.app.json` and `tsconfig.node.json` files.

🚧KJA
This configuration is based on the vite-react-ts template [create-vite react-ts]

- Include settings from the vite-react and strictest [tsconfig bases] specifically [vite-react] and [strictest].
- Make root dedup configs code and have newest EST target.

[allowImportingTsExtensions]: https://chatgpt.com/share/67ef5b2e-5c98-8011-9be2-5b82258cc788
[create-vite react-ts]: https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts
[strictest]: https://www.npmjs.com/package/@tsconfig/strictest
[tsconfig bases]: https://github.com/tsconfig/bases#centralized-recommendations-for-tsconfig-bases from https://www.typescriptlang.org/tsconfig#target
[vite-react]: https://www.npmjs.com/package/@tsconfig/vite-react

[tsconfig doc]: https://www.typescriptlang.org/tsconfig
