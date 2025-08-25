const runAllTests =
  typeof process.env['RUN_ALL_TESTS'] === 'string' &&
  (process.env['RUN_ALL_TESTS'].toLowerCase() === 'true' || process.env['RUN_ALL_TESTS'] === '1')
const includeSlowTest =
  typeof process.env['INCLUDE_SLOW_TESTS'] === 'string' &&
  (process.env['INCLUDE_SLOW_TESTS'].toLowerCase() === 'true' || process.env['INCLUDE_SLOW_TESTS'] === '1')

/**
 * Check if the current process is VSCode or a fork like Cursor.
 * This is required e.g. to ensure no tests are filtered out by the IDE, and hence the built-in IDE test runner
 * can discover them.
 */
const isVSCodeLike =
  Boolean(process.env['VSCODE_PID']) ||
  Boolean(process.env['VSCODE_CWD']) ||
  Boolean(process.env['VSCODE_IPC_HOOK_CLI'])

/**
 * Helper function to determine if slow tests should be included.
 * Returns true if either RUN_ALL_TESTS or INCLUDE_SLOW_TESTS environment variable is set.
 *
 * ⚠️ CURRENTLY UNUSED, KEEPING HERE FOR REFERENCE
 */
// Usage in vitest.config.ts:
// ...
//   exclude: includeSlow ? [] : ['test/**/App.test.tsx', 'test/**/*E2E.test.tsx'],
// ...
//
// Usage in web_gh_pages_CICD.yml:
// ...
// - name: Run tests
//   # --pool=forks adds test isolation. --retry=1 accommodates for flaky tests.
//   run: |
//     RUN_ALL_TESTS=1 npm run test -- --pool=forks --retry=1
// ...
export const includeSlow = runAllTests || includeSlowTest || isVSCodeLike
