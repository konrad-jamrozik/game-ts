/**
 * See docs/setup/about_eslint.md for context on this file.
 * Future work: add more plugins from https://github.com/dustinspecker/awesome-eslint
 * Candidates:
 * - sonarjs,
 * - github
 * - perfectionist: https://perfectionist.dev/
 *   found it in deprecation notice in a rule I disabled in my previous game eslint config:
 *     https://typescript-eslint.io/rules/sort-type-constituents/
 */
import { globalIgnores } from 'eslint/config'
import globals from 'globals'
import plugTypescriptEslint from 'typescript-eslint'

export default plugTypescriptEslint.config([
  globalIgnores(['dist', 'coverage', 'node_modules', 'logs']),
  {
    name: 'cfg',
    files: ['**/*.{ts,tsx}'],
    plugins: {},
    extends: [],
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
    settings: {},
  },
])
