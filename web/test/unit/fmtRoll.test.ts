import { describe, expect, test } from 'vitest'
import { fmtRoll, type RollResultNew } from '../../src/lib/turn_advancement/rolls'

/**
 * See also related tests in rollAgainstProbability.test.ts
 */
describe(fmtRoll, () => {
  // prettier-ignore
  test.each<[number, number, boolean, string]>([
      [0,        0,        false, '❌ roll   0.01% is <= 100.00% threshold'],
      [0,        0.9999,   false, '❌ roll 100.00% is <= 100.00% threshold'],
      [0.0001,   0.9998,   false, '❌ roll  99.99% is <=  99.99% threshold'],
      [0.0001,   0.999_89, false, '❌ roll  99.99% is <=  99.99% threshold'],
      [0.0001,   0.9999,   true,  '✅ roll 100.00% is >   99.99% threshold'],
      [0.000_01, 0.999_99, true,  '✅ roll 100.00% is >   99.99% threshold'],
      [0.000_01, 0.999_98, false, '❌ roll 100.00% is <=  99.99% threshold'], // kja lol
      [0.5,      0.4999,   false, '❌ roll  50.00% is <=  50.00% threshold'],
      [0.5,      0.5,      true,  '✅ roll  50.01% is >   50.00% threshold'],
      [1,        0,        false, '✅ roll   0.01% is >    0.00% threshold'],
      [0.0001,   1,        true,  '✅ roll 100.00% is >   99.99% threshold'],
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
