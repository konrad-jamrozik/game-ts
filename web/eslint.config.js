/**
 * See docs/about_eslint.md for context on this file.
 * Future work: add more plugins from https://github.com/dustinspecker/awesome-eslint
 * Candidates:
 * - sonarjs,
 * - github
 * - perfectionist: https://perfectionist.dev/
 *   found it in deprecation notice in a rule I disabled in my previous game eslint config:
 *     https://typescript-eslint.io/rules/sort-type-constituents/
 */
import plugReact from '@eslint-react/eslint-plugin'
import js from '@eslint/js'
import plugVitest from '@vitest/eslint-plugin'
import { createTypeScriptImportResolver } from 'eslint-import-resolver-typescript'
import plugImportX from 'eslint-plugin-import-x'
import plugJestDom from 'eslint-plugin-jest-dom'
import plugReactCompiler from 'eslint-plugin-react-compiler'
import plugReactHooks from 'eslint-plugin-react-hooks'
import plugReactRefresh from 'eslint-plugin-react-refresh'
import plugReactTestLib from 'eslint-plugin-testing-library'
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
      // Configured to [all] [all src] config, ins spite of  warning on conflicts.
      // This is because it is missing the strictest configs, as recommended by [ts-eslint recommended configs],
      // are missing some critical rules, like explicit-function-return-type.
      // See also [linting with type information].
      ...plugTypescriptEslint.configs.all,
      // ...plugTypescriptEslint.configs.strictTypeChecked,
      // ...plugTypescriptEslint.configs.stylisticTypeChecked,

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
      // [eslint-plugin-react-compiler]
      // See also: docs/about_react.md#initial-react-19-compiler-setup
      plugReactCompiler.configs.recommended,

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
      // https://eslint.org/docs/latest/rules/max-statements
      'max-statements': ['error', { max: 20 }],
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
      // https://eslint.org/docs/latest/rules/max-lines-per-function
      'max-lines-per-function': ['error', { max: 150, skipBlankLines: true, skipComments: true }],
      // I don't care about variable initialization rules that much.
      // https://eslint.org/docs/latest/rules/one-var
      'one-var': ['error', 'never'],
      // Needed e.g. when initializing React contexts.
      // https://eslint.org/docs/latest/rules/no-undefined
      'no-undefined': 'off',
      // Too cumbersome to always fix, plus sometimes I prefer semantic sorting.
      // https://eslint.org/docs/latest/rules/sort-keys
      'sort-keys': 'off',
      // I like ternaries
      // https://eslint.org/docs/latest/rules/no-ternary
      'no-ternary': 'off',

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
      // https://typescript-eslint.io/rules/naming-convention
      '@typescript-eslint/naming-convention': [
        'error',
        {
          selector: 'function',
          format: [
            'camelCase', // default value
            'PascalCase', // allow PascalCase for React components, as they require it
          ],
        },
      ],
      // Turned off as causing too many false positives. But see the commented out snippet
      // at the bottom of this file.
      // https://typescript-eslint.io/rules/prefer-readonly-parameter-types/
      '@typescript-eslint/prefer-readonly-parameter-types': 'off',
      // I prefer types over interfaces
      // See also relevant section in docs/about_react.md
      // https://typescript-eslint.io/rules/consistent-type-definitions/
      '@typescript-eslint/consistent-type-definitions': ['error', 'type'],

      // React configs
      // --------------------
      // See the dedicated config for 'react-refresh/only-export-components' below.

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
      // https://redux.js.org/usage/usage-with-typescript#use-typed-hooks-in-components
      '@typescript-eslint/no-restricted-imports': [
        'error',
        {
          name: 'react-redux',
          importNames: ['useSelector', 'useDispatch'],
          message: 'Use typed hooks `useAppDispatch` and `useAppSelector` instead.',
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
      // Sometimes I need empty files while figuring out how to make things work
      // https://github.com/sindresorhus/eslint-plugin-unicorn/blob/main/docs/rules/no-empty-file.md
      'unicorn/no-empty-file': 'off',
      // https://github.com/sindresorhus/eslint-plugin-unicorn/blob/main/docs/rules/no-nested-ternary.md
      // Conflicts with prettier: it removes the parentheses
      'unicorn/no-nested-ternary': 'off',
      // https://github.com/sindresorhus/eslint-plugin-unicorn/blob/main/docs/rules/no-negated-condition.md
      'unicorn/no-negated-condition': 'off',
      // https://github.com/sindresorhus/eslint-plugin-unicorn/blob/main/docs/rules/no-keyword-prefix.md
      'unicorn/no-keyword-prefix': 'off',
      // I like abbreviations
      // https://github.com/sindresorhus/eslint-plugin-unicorn/blob/main/docs/rules/prevent-abbreviations.md
      'unicorn/prevent-abbreviations': 'off',
    },
  },
  {
    files: ['**/*ContextProvider*.{ts,tsx,js,jsx}'],
    rules: {
      // Used to initialize context like:
      //   export const GameStateContext = createContext<GameState>(undefined!)
      // Without it it would have to be
      //   export const GameStateContext = createContext<GameState | undefined>(undefined)
      // But any context is effectively always not undefined, because it should always be accessed
      // by its Provider which initializes it with a value.
      // https://typescript-eslint.io/rules/no-non-null-assertion/
      '@typescript-eslint/no-non-null-assertion': 'off',

      // Vite uses
      // https://github.com/vitejs/vite-plugin-react/tree/main/packages/plugin-react#consistent-components-exports
      // Per
      // https://vite.dev/guide/features.html#hot-module-replacement
      // https://github.com/ArnaudBarre/eslint-plugin-react-refresh
      // BUG: the allowConstantExport option does not appear to work correctly.
      // I verified that:
      // - the config plugReactRefresh.configs.vite, is used which should enable it.
      // - it is enabled here
      // - eslint config inspector shows it is enabled.
      // And yet it flags on this line:
      //   export const GameStateContext = createContext<GameState>(undefined!)
      // which is "export const" so it should be allowed.
      'react-refresh/only-export-components': 'off',
    },
  },
  {
    // Vitest config for tests in web/test dir
    files: ['test/**/*.{ts,tsx,js,jsx}'],
    plugins: { vitest: plugVitest, reactTestLib: plugReactTestLib, jestDom: plugJestDom },
    languageOptions: {
      globals: {
        ...plugVitest.environments.env.globals,
      },
    },
    settings: {
      vitest: {
        typecheck: true,
      },
    },
    extends: [
      // https://github.com/vitest-dev/eslint-plugin-vitest/tree/main?tab=readme-ov-file#all
      plugVitest.configs.all,
      plugReactTestLib.configs['flat/react'],
      plugJestDom.configs['flat/all'],
    ],
    rules: {
      // Name tests "test" and put them within "describe" blocks.
      // https://github.com/veritem/eslint-plugin-vitest/blob/main/docs/rules/consistent-test-it.md
      'vitest/consistent-test-it': ['error', { fn: 'test', withinDescribe: 'test' }],

      // Force async test to declare in first line they expect to have assertions in them.
      // (yes, it is a meta-defensive code measure)
      // https://github.com/veritem/eslint-plugin-vitest/blob/main/docs/rules/prefer-expect-assertions.md
      'vitest/prefer-expect-assertions': ['error', { onlyFunctionsWithAsyncKeyword: true }],

      // Tests titles can start from capital letters.
      // https://github.com/veritem/eslint-plugin-vitest/blob/main/docs/rules/prefer-lowercase-title.md
      'vitest/prefer-lowercase-title': 'off',

      // Hooks are OK, plus required for manual cleanup. See rule for 'testing-library/no-manual-cleanup'.
      // https://github.com/veritem/eslint-plugin-vitest/blob/main/docs/rules/no-hooks.md
      'vitest/no-hooks': 'off',

      // vitest doesn't hook up to the cleanup function, so manual cleanup is necessary.
      // Details here: https://stackoverflow.com/a/78494069/986533
      // https://github.com/testing-library/eslint-plugin-testing-library/blob/main/docs/rules/no-manual-cleanup.md
      'testing-library/no-manual-cleanup': 'off',

      // Describe blocks in tests can be long and contain many test cases
      // https://eslint.org/docs/latest/rules/max-lines-per-function
      'max-lines-per-function': 'off',
    },
  },
])

/*

// Snippet below is not used, but may be useful in the future
      // ReactNode is the type of "children" prop, often passed as input to React components.
      // https://typescript-eslint.io/rules/prefer-readonly-parameter-types/
      '@typescript-eslint/prefer-readonly-parameter-types': [
        'error',
        {
          allow: [
            {
              from: 'package',
              name: ['ReactNode'],
              package: 'react',
            },
          ],
        },
      ],
      
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
[eslint-plugin-react-compiler]: https://www.npmjs.com/package/eslint-plugin-react-compiler
[eslint-plugin-react-redux]: https://github.com/DianaSuvorova/eslint-plugin-react-redux#usage
*/
