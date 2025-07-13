/**
 * See docs/about_eslint.md for context on this file.
 */
import plugReact from '@eslint-react/eslint-plugin'
import js from '@eslint/js'
import { createTypeScriptImportResolver } from 'eslint-import-resolver-typescript'
import plugImportX from 'eslint-plugin-import-x'
import plugReactHooks from 'eslint-plugin-react-hooks'
import plugReactRefresh from 'eslint-plugin-react-refresh'
import plugTsdoc from 'eslint-plugin-tsdoc'
import plugUnicorn from 'eslint-plugin-unicorn'
import { globalIgnores } from 'eslint/config'
import globals from 'globals'
import plugTypescriptEslint from 'typescript-eslint'

export default plugTypescriptEslint.config([
  globalIgnores(['dist']),
  {
    name: 'cfg',
    files: ['**/*.{ts,tsx}'],
    plugins: {
      // Note: the plugin [eslint-plugin-tsdoc] must be imported as a plugin,
      // not via extends, because of its definition.
      tsdoc: plugTsdoc,
    },
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
      ...plugTypescriptEslint.configs.strictTypeChecked,
      ...plugTypescriptEslint.configs.stylisticTypeChecked,

      // React configs
      // --------------------
      // Came with [create-vite react-ts] template.
      // Explained at [eslint-plugin-react-hooks about].
      // Source at [eslint-plugin-react-hooks src].
      plugReactHooks.configs['recommended-latest'],
      // Came with [create-vite react-ts] template.
      // Package at [eslint-plugin-react-refresh pkg].
      plugReactRefresh.configs.vite,
      // From [eslint-react], [eslint-react pkg], originally based on the subsets proposed
      // by [create-vite react-ts] template README, which were:
      // [eslint-plugin-react-x pkg] and [eslint-plugin-react-dom pkg]
      //
      // The "recommended-type-checked" is mentioned in [eslint-react pkg] and in [eslint-react presets].
      //
      // Note: Per the [eslint-react FAQ], it subsumes [eslint-plugin-react pkg].
      // Note: [eslint-react type info] clarifies that the two rules of:
      // - @eslint-react/no-leaked-conditional-rendering
      // - @eslint-react/prefer-read-only-props
      // require type information. Curiously, both of them are mentioned in recommended-type-checked,
      // but only one is enabled. See [recommended-type-checked src].
      plugReact.configs['recommended-type-checked'],

      // Imports
      // --------------------
      // See [eslint-plugin-import-x] for details.
      // Notably, [eslint-plugin-import] is obsolete.
      // See also comment on rule "'sort-imports': 'off'"
      // Configs src:
      // https://github.com/import-js/eslint-plugin-import/tree/main/config
      // Note on performance:
      // https://typescript-eslint.io/troubleshooting/typed-linting/performance#eslint-plugin-import
      plugImportX.flatConfigs.recommended,
      plugImportX.flatConfigs.typescript,
      plugImportX.flatConfigs.react,

      // Formatting
      // --------------------
      // In case of issues with formatting / Prettier, see docs/about_prettier.md,
      // which explains how to use https://github.com/prettier/eslint-config-prettier
      // to disable eslint formatting rules that conflict with Prettier.

      // Miscellaneous
      // --------------------
      plugUnicorn.configs.all, // [eslint-plugin-unicorn]

      // 🚧KJA eslint: maybe sonarjs, github, awesome, https://github.com/dustinspecker/awesome-eslint
    ],
    languageOptions: {
      ecmaVersion: 2024,
      globals: globals.browser,
      // "parser" from the doc of [eslint-react].
      parser: plugTypescriptEslint.parser,
      parserOptions: {
        // This line, coming from [create-vite react-ts] template, has been commented out by me:
        // This is because it is subsumed by projectService below.
        // // project: ['./tsconfig.node.json', './tsconfig.app.json'],
        //
        // Explained at [typed-linting] as well as in
        // https://typescript-eslint.io/blog/project-service
        projectService: true,
        // Came with [create-vite react-ts] template. Explained at [typed-linting].
        // The "import.meta" value is explained in [import.meta].
        tsconfigRootDir: import.meta.dirname,
      },
    },
    settings: {
      // Based on [eslint-plugin-import-x resolver] and [eslint-import-resolver-typescript].
      'import-x/resolver-next': [
        createTypeScriptImportResolver({
          alwaysTryTypes: true, // Always try to resolve types under `<root>@types` directory even if it doesn't contain any source code, like `@types/unist`
          projectService: true,
          // This was figured out by myself.
          // It ensures that the [vite public directory]
          // can be correctly resolved by [eslint-plugin-import-x].
          // As a result, a line like this:
          //   import viteLogo from '/vite.svg'
          // will no longer trigger:
          // https://github.com/un-ts/eslint-plugin-import-x/blob/master/docs/rules/no-unresolved.md
          roots: ['public'],
        }),
      ],
    },
    rules: {
      // [eslint configs]
      // --------------------

      // https://eslint.org/docs/latest/rules/sort-imports
      // Turned off. Using 'import/order' instead.
      // 'import/order' sorts by semantics, while sort-imports sorts by import syntax used, then alphabetically.
      // Another rejected solution: https://github.com/lydell/eslint-plugin-simple-import-sort
      // It uses this sort order:
      // https://github.com/lydell/eslint-plugin-simple-import-sort#sort-order
      'sort-imports': 'off',
      // console is used for debugging
      // https://eslint.org/docs/latest/rules/no-console
      'no-console': 'off',
      // https://eslint.org/docs/latest/rules/func-style
      'func-style': [
        'error',
        'declaration', // I like declaration more than the default 'expression'
      ],
      // See @typescript-eslint/no-magic-numbers
      'no-magic-numbers': 'off',
      // I don't care about comment capitalization
      // https://eslint.org/docs/latest/rules/capitalized-comments
      'capitalized-comments': 'off',
      // https://eslint.org/docs/latest/rules/no-inline-comments
      'no-inline-comments': 'off',

      // [ts-eslint] configs
      // --------------------

      // https://typescript-eslint.io/rules/no-magic-numbers/
      // https://eslint.org/docs/latest/rules/no-magic-numbers#options
      '@typescript-eslint/no-magic-numbers': 'off',
      // https://typescript-eslint.io/rules/no-confusing-void-expression
      '@typescript-eslint/no-confusing-void-expression': [
        'error',
        {
          // If this would not be ignored, React JSX code like this:
          //   onClick={() => setCount((count) => count + 2)}
          // would have to be written out as:
          //   onClick={() => {
          //     setCount((count) => count + 2)
          //   }}
          // https://typescript-eslint.io/rules/no-confusing-void-expression/#ignorevoidreturningfunctions
          ignoreVoidReturningFunctions: true,
        },
      ],

      // Imports
      // --------------------

      // https://github.com/un-ts/eslint-plugin-import-x/blob/master/docs/rules/order.md
      'import-x/order': [
        'error',
        {
          // options: https://github.com/un-ts/eslint-plugin-import-x/blob/master/docs/rules/order.md#options
          warnOnUnassignedImports: true,
          'newlines-between': 'never',
          alphabetize: { order: 'asc', orderImportKind: 'asc' },
        },
      ],
      // Note: per the performance note of typescript-eslint:
      // https://typescript-eslint.io/troubleshooting/typed-linting/performance/#eslint-plugin-import
      // Following rules should also be disabled, if performance suffers:
      // import/named - already disabled by import-x/typescript
      // import/namespace
      // import/default
      // import/no-named-as-default-member
      // import/no-unresolved
      //
      // And these rules should be used only in CI:
      // import/no-named-as-default
      // import/no-cycle
      // import/no-unused-modules
      // import/no-deprecated
      //
      // import/extensions - a bit unclear
      //
      // Use the ESLint config inspector to verify these rules usage (see docs/about_eslint.md).

      // Formatting
      // --------------------
      // Empty so far.

      // Miscellaneous - TSDoc
      // --------------------
      'tsdoc/syntax': 'error', // [eslint-plugin-tsdoc]

      // Miscellaneous - Unicorn
      // --------------------
      // https://github.com/sindresorhus/eslint-plugin-unicorn/blob/main/docs/rules/filename-case.md
      'unicorn/filename-case': [
        'error',
        {
          cases: {
            camelCase: true, // for files primarily exporting a function
            pascalCase: true, // allow PascalCase for React components, as they require it
          },
          ignore: ['vite-env.d.ts', '^AI.*'], // vite-env.d.ts is a file name provided by Vite by default
        },
      ],
      // https://github.com/sindresorhus/eslint-plugin-unicorn/blob/main/docs/rules/no-empty-file.md
      // Sometimes I need empty files while figuring out how to make things work
      'unicorn/no-empty-file': 'off',
      // https://github.com/sindresorhus/eslint-plugin-unicorn/blob/main/docs/rules/no-nested-ternary.md
      // Conflicts with prettier: it removes the parentheses
      'unicorn/no-nested-ternary': 'off',
      // https://github.com/sindresorhus/eslint-plugin-unicorn/blob/main/docs/rules/no-negated-condition.md
      'unicorn/no-negated-condition': 'off',
      // https://github.com/sindresorhus/eslint-plugin-unicorn/blob/main/docs/rules/no-keyword-prefix.md
      'unicorn/no-keyword-prefix': 'off',
    },
  },
])

/*
[@eslint/js]: https://www.npmjs.com/package/@eslint/js
[@types/node]: https://www.npmjs.com/package/@types/node?activeTab=readme
[all src]: https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/eslint-plugin/src/configs/eslintrc/all.ts
[all]: https://typescript-eslint.io/users/configs/#all
[create-vite react-ts]: https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts
[eslint configs]: https://eslint.org/docs/latest/use/configure/configuration-files#using-predefined-configurations
[eslint-import-resolver-typescript]: https://github.com/import-js/eslint-import-resolver-typescript#eslintconfigjs
[eslint-plugin-import order]: https://github.com/import-js/eslint-plugin-import/blob/main/docs/rules/order.md
[eslint-plugin-import-x resolver]: https://github.com/un-ts/eslint-plugin-import-x#import-xresolver-next
[eslint-plugin-import-x]: https://github.com/un-ts/eslint-plugin-import-x
[eslint-plugin-import]: https://github.com/import-js/eslint-plugin-import
[eslint-plugin-import]: https://github.com/import-js/eslint-plugin-import/tree/main
[eslint-plugin-react pkg]: https://www.npmjs.com/package/eslint-plugin-react
[eslint-plugin-react-dom pkg]: https://www.npmjs.com/package/eslint-plugin-react-dom
[eslint-plugin-react-hooks about]: https://react.dev/learn/editor-setup#linting
[eslint-plugin-react-hooks src]: https://github.com/facebook/react/tree/main/packages/eslint-plugin-react-hooks
[eslint-plugin-react-refresh pkg]: https://www.npmjs.com/package/eslint-plugin-react-refresh/v/0.1.0
[eslint-plugin-react-x pkg]: https://www.npmjs.com/package/eslint-plugin-react-x
[eslint-plugin-tsdoc]: https://tsdoc.org/pages/packages/eslint-plugin-tsdoc/
[eslint-plugin-unicorn]: https://github.com/sindresorhus/eslint-plugin-unicorn
[eslint-react faq]: https://eslint-react.xyz/docs/faq
[eslint-react pkg]: https://www.npmjs.com/package/@eslint-react/eslint-plugin
[eslint-react presets]: https://eslint-react.xyz/docs/presets
[eslint-react type info]: https://eslint-react.xyz/docs/configuration/configure-project-config#type-information
[eslint-react]: https://eslint-react.xyz/
[import.meta]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import.meta
[js-eslint all src]: https://github.com/eslint/eslint/blob/35cf44c22e36b1554486e7a75c870e86c10b83f8/packages/js/src/configs/eslint-all.js
[linting with type information]: https://typescript-eslint.io/getting-started/typed-linting/#shared-configurations
[recommended-type-checked-src]: https://github.com/Rel1cx/eslint-react/blob/f10515104f223bf548e67e611cfb9f3ec6a68ef9/packages/plugins/eslint-plugin/src/configs/recommended-type-checked.ts#L7-L11
[strictTypeChecked]: https://typescript-eslint.io/users/configs/#recommended-configurations
[stylisticTypeChecked]: https://typescript-eslint.io/users/configs/#recommended-configurations
[ts resolver]: https://github.com/import-js/eslint-import-resolver-typescript
[ts-eslint recommended configs]: https://typescript-eslint.io/users/configs/#recommended-configurations
[ts-eslint]: https://ts-eslint.io/users/configs/
[typed-linting]: https://typescript-eslint.io/getting-started/typed-linting/
[vite public directory]: https://vite.dev/guide/assets.html#the-public-directory
*/
// 🚧KJA add eslint for vitest
