const runAllTests =
  typeof process.env['RUN_ALL_TESTS'] === 'string' &&
  (process.env['RUN_ALL_TESTS'].toLowerCase() === 'true' || process.env['RUN_ALL_TESTS'] === '1')
const includeSlowTest =
  typeof process.env['INCLUDE_SLOW_TESTS'] === 'string' &&
  (process.env['INCLUDE_SLOW_TESTS'].toLowerCase() === 'true' || process.env['INCLUDE_SLOW_TESTS'] === '1')
/**
 * Helper function to determine if slow tests should be included.
 * Returns true if either RUN_ALL_TESTS or INCLUDE_SLOW_TESTS environment variable is set.
 */
export const includeSlow = runAllTests || includeSlowTest
