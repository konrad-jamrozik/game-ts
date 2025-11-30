import { describe, expect, test } from 'vitest'
import {
  fmtRollResultFloat,
  fmtRollResultQuantized,
  rollAgainstProbabilityFloat,
  rollAgainstProbabilityQuantized,
} from '../../src/lib/turn_advancement/rolls'
import { rand } from '../../src/lib/utils/rand'

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
describe('fmtRollResult - aligned display', () => {
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
      [0.5555,   0.4445,   true,  '✅ roll  44.46% is >   44.45% threshold'],
      [1,        0,        true,  '✅ roll   0.01% is >    0.00% threshold'],
      [0.0001,   1,        true,  '✅ roll 100.00% is >   99.99% threshold'],
      // Test cases for values more fine grained than display precision (which is 123.45%)
      // - successProb = 0.000_09 -> 00.001%
      // - roll        = 0.999_92 -> 99.992% -> round up   to display as 100.00%
      // - failureProb = 0.999_91 -> 99.991% -> round down to display as  99.99%
      [0.000_09, 0.999_92, true,  '✅ roll 100.00% is >   99.99% threshold'],
      [0.000_07, 0.999_93, true,  '✅ roll 100.00% is >   99.99% threshold'],
      [0.555_55, 0.444_45, true,  '✅ roll  44.45% is >   44.44% threshold'],
      // Test case proving that when actualSuccess is true, displayed roll is always >= displayed threshold
      // even with fine-grained values, so no special handling is needed:
      // - successProb   = 0.444_45, so failureProb = 0.555_55
      // - roll          = 0.555_551 (just barely succeeds: 0.555551 >= 0.55555)
      // - roll displayed as 55.56%
      // - threshold     = 0.555_55  -> displays as 55.55%
      // - Result: displayed roll (55.56%) > threshold (55.55%)
      [0.444_45, 0.555_551, true, '✅ roll  55.56% is >   55.55% threshold'],
  ])('successProb: %f, roll: %f, success: %s -> expected format', (successProb, roll, success, expectedFormat) => {
    rand.set('injected_roll_result', roll)
    const rollResultFloat = rollAgainstProbabilityFloat(successProb, 'injected_roll_result')
    expect(rollResultFloat.success).toBe(success)
    const resultFloat = fmtRollResultFloat(rollResultFloat)
    expect(resultFloat).toContain(expectedFormat)
    const rollResultQuantized = rollAgainstProbabilityQuantized(successProb, 'injected_roll_result')
    expect(rollResultQuantized.success).toBe(success)
    const resultQuantized = fmtRollResultQuantized(rollResultQuantized)
    expect(resultQuantized).toContain(expectedFormat)
  })
})

describe('fmtRollResult - float-specific', () => {
  // prettier-ignore
  test.each<[number, number, boolean, string]>([
    // ⚠️ Observe the result difference between float and quantized
      [0.000_01, 0.999_99, true,  '✅ roll 100.00% is >   99.99% threshold'],
      // - successProb = 0.000_01 -> 00.001%
      // - roll        = 0.999_98 -> 99.998% -> round up   to display as 100.00%
      // - failureProb = 0.999_99 -> 99.999% -> round down to display as  99.99%
      // ⚠️ Observe wrong inequality displayed
      [0.000_01, 0.999_98, false, '❌ roll 100.00% is <=  99.99% threshold]'],
      // - successProb = 0.000_07 -> 00.007%
      // - roll        = 0.999_92 -> 99.992% -> round up   to display as 100.00%
      // - failureProb = 0.999_93 -> 99.993% -> round down to display as  99.99%
      // ⚠️ Observe the result difference between float and quantized
      // ⚠️ Observe wrong inequality displayed
      [0.000_07, 0.999_92, false,  '❌ roll 100.00% is <=  99.99% threshold'],
      // ⚠️ Observe the result difference between float and quantized
      // ⚠️ Observe wrong inequality displayed
      [0.555_55, 0.444_44, false,  '❌ roll  44.45% is <=  44.44% threshold'],

])('successProb: %f, roll: %f, success: %s -> expected format', (successProb, roll, success, expectedFormat) => {
  rand.set('injected_roll_result', roll)
  const rollResultFloat = rollAgainstProbabilityFloat(successProb, 'injected_roll_result')
  expect(rollResultFloat.success).toBe(success)
  const resultFloat = fmtRollResultFloat(rollResultFloat)
  expect(resultFloat).toContain(expectedFormat)
})
})

describe('fmtRollResult - quantized-specific', () => {
  // prettier-ignore
  test.each<[number, number, boolean, string]>([
      // ⚠️ Observe the result difference between float and quantized
      [0.000_01, 0.999_99, false, '❌ roll 100.00% is <= 100.00% threshold'],
      [0.000_01, 0.999_98, false, '❌ roll 100.00% is <= 100.00% threshold'],
      // ⚠️ Observe the result difference between float and quantized
      [0.000_07, 0.999_92, true,  '✅ roll 100.00% is >   99.99% threshold'],
      // ⚠️ Observe the result difference between float and quantized
      [0.555_55, 0.444_44, true,  '✅ roll  44.45% is >   44.44% threshold'],      
])('successProb: %f, roll: %f, success: %s -> expected format', (successProb, roll, success, expectedFormat) => {
  rand.set('injected_roll_result', roll)
  const rollResultQuantized = rollAgainstProbabilityQuantized(successProb, 'injected_roll_result')
  expect(rollResultQuantized.success).toBe(success)
  const resultQuantized = fmtRollResultQuantized(rollResultQuantized)
  expect(resultQuantized).toContain(expectedFormat)
})
})
