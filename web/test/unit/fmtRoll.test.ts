import { describe, expect, test } from 'vitest'
import { fmtRoll, type RollResultNew } from '../../src/lib/turn_advancement/rolls'

/**
 * See also related tests in rollAgainstProbability.test.ts
 *
 * Note:
 * - Actual roll values are rounded up to nearest basis point (0.01%).
 *   As such, roll of 0 displays as 0.01% not 0.00%.
 * - The threshold is "failure probability" meaning roll must be higher than it.
 *   Threshold is (1 - successProb) rounded down to nearest basis point (0.01%).
 *   So e.g.:
 *   - A success probability of 0.3 means threshold is 0.7, which displays as 70.00%.
 *   - A success probability of 0.000_01 means threshold is 0.999_99, which displays as 100.00%.
 */
describe(fmtRoll, () => {
  // prettier-ignore
  test.each<[number, number, boolean, string]>([
      [0,        0,        false, '❌ roll   0.01% is <= 100.00% threshold'],
      [0,        0.9999,   false, '❌ roll 100.00% is <= 100.00% threshold'],
      [0.0001,   0.9998,   false, '❌ roll  99.99% is <=  99.99% threshold'],
      [0.0001,   0.999_89, false, '❌ roll  99.99% is <=  99.99% threshold'],
      [0.0001,   0.9999,   true,  '✅ roll 100.00% is >   99.99% threshold'],
      [0.3,      0.7,      true,  '✅ roll  70.01% is >   70.00% threshold'],
      [0.5,      0.4999,   false, '❌ roll  50.00% is <=  50.00% threshold'],
      [0.5,      0.5,      true,  '✅ roll  50.01% is >   50.00% threshold'],
      [1,        0,        false, '✅ roll   0.01% is >    0.00% threshold'],
      [0.0001,   1,        true,  '✅ roll 100.00% is >   99.99% threshold'],
      // Test cases for values more fine grained than display precision (which is 123.45%)
      [0.000_01, 0.999_99, true,  '✅ roll 100.00% is >   99.99% threshold'],
      // Here: 
      // - successProb = 0.000_01
      // - failureProb = 0.999_99 -> 99.999% -> display as  99.00%
      // - roll        = 0.999_98 -> 99.998% -> display as 100.00%
      [0.000_01, 0.999_98, false, '❌ roll 100.00% is <=  99.99% threshold'], // kja lol      
  ])('successProb: %f, roll: %f, success: %s -> expected format', (successProb, roll, success, expectedFormat) => {
    const rollResult: RollResultNew = {
      successProb,
      roll,
      success,
    }
    const result = fmtRoll(rollResult)
    expect(result).toContain(expectedFormat)
  })
})
