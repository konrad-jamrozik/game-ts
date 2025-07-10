/**
 * See docs/about_eslint.md for context on this file.
 */
import eslintReact from "@eslint-react/eslint-plugin"
import js from '@eslint/js'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { globalIgnores } from 'eslint/config'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // [eslint configs]
      // --------------------
      // Package at [@eslint/js]; source at [js-eslint all src]
      js.configs.all,

      // [ts-eslint] configs
      // --------------------
      // Configured to strictest per [ts-eslint recommended configs].
      // See also [linting with type information].
      // Note: not using the [all] [all src] config due to warning on conflicts plus
      // my read of the source code suggests it disables many baseline eslint rules
      // (probably overridden by ts-eslint rules).
      ...tseslint.configs.strictTypeChecked,
      ...tseslint.configs.stylisticTypeChecked,

      // React configs
      // --------------------
      // Came with [create-vite react-ts] template.
      // Explained at [eslint-plugin-react-hooks about].
      // Source at [eslint-plugin-react-hooks src].
      reactHooks.configs['recommended-latest'],
      // Came with [create-vite react-ts] template.
      // Package at [eslint-plugin-react-refresh pkg].
      reactRefresh.configs.vite,
      // From [eslint-react], [eslint-react pkg], originally based on the subsets proposed
      // by [create-vite react-ts] template README, which were:
      // [eslint-plugin-react-x pkg] and [eslint-plugin-react-dom pkg]
      //
      // The "recommended-type-checked" is mentioned in [eslint-react pkg] and in [eslint-react presets].
      //
      // Note: Per the [eslint-react FAQ], it subsumes [eslint-plugin-react pkg].
      eslintReact.configs["recommended-type-checked"],
    ],
    languageOptions: {
      ecmaVersion: 2024,
      globals: globals.browser,
      // "parser" from the doc of [eslint-react].
      parser: tseslint.parser,
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        // Explained at [typed-linting].
        projectService: true,
        // Came with [create-vite react-ts] template. Explained at [typed-linting].
        // The "import.meta" value is explained in [import.meta].
        tsconfigRootDir: import.meta.dirname
      },      
    },
  },
])

// [@eslint/js]: https://www.npmjs.com/package/@eslint/js
// [@types/node]: https://www.npmjs.com/package/@types/node?activeTab=readme
// [all src]: https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/eslint-plugin/src/configs/eslintrc/all.ts
// [all]: https://typescript-eslint.io/users/configs/#all
// [create-vite react-ts]: https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts
// [eslint configs]: https://eslint.org/docs/latest/use/configure/configuration-files#using-predefined-configurations
// [import.meta]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import.meta
// [js-eslint all src]: https://github.com/eslint/eslint/blob/35cf44c22e36b1554486e7a75c870e86c10b83f8/packages/js/src/configs/eslint-all.js
// [linting with type information]: https://typescript-eslint.io/getting-started/typed-linting/#shared-configurations
// [strictTypeChecked]: https://typescript-eslint.io/users/configs/#recommended-configurations
// [stylisticTypeChecked]: https://typescript-eslint.io/users/configs/#recommended-configurations
// [ts-eslint recommended configs]: https://typescript-eslint.io/users/configs/#recommended-configurations
// [ts-eslint]: https://ts-eslint.io/users/configs/
// [typed-linting]: https://typescript-eslint.io/getting-started/typed-linting/
// [eslint-plugin-react-hooks about]: https://react.dev/learn/editor-setup#linting
// [eslint-plugin-react-hooks src]: https://github.com/facebook/react/tree/main/packages/eslint-plugin-react-hooks
// [eslint-plugin-react-refresh pkg]: https://www.npmjs.com/package/eslint-plugin-react-refresh/v/0.1.0
// [eslint-react]: https://eslint-react.xyz/
// [eslint-react pkg]: https://www.npmjs.com/package/@eslint-react/eslint-plugin
// [eslint-react presets]: https://eslint-react.xyz/docs/presets
// [eslint-react faq]: https://eslint-react.xyz/docs/faq
// [eslint-plugin-react-x pkg]: https://www.npmjs.com/package/eslint-plugin-react-x
// [eslint-plugin-react-dom pkg]: https://www.npmjs.com/package/eslint-plugin-react-dom
// [eslint-plugin-react pkg]: https://www.npmjs.com/package/eslint-plugin-react

// 🚧KJA install e.g.
// npm install --save-dev typescript-eslint @eslint-react/eslint-plugin
// from https://www.npmjs.com/package/@eslint-react/eslint-plugin
