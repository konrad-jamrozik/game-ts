/* eslint-disable vitest/no-commented-out-tests */
import { describe, expect, test } from 'vitest'
import type { RollResultNew } from '../../src/lib/turn_advancement/rolls'
import { buildRollResultStr } from '../../src/lib/utils/fmtAttackLog'

describe(buildRollResultStr, () => {
  //   [0,      0,      false ], // { probability: 0      , roll: 0,     , success: false }
  //   [0,      0.9999, false ], // { probability: 0      , roll: 0.9999 , success: false }
  //   [0.0001, 0.9998, false ], // { probability: 0.0001 , roll: 0.9998 , success: false }
  //   [0.0001, 0.9999, true  ], // { probability: 0.0001 , roll: 0.9999 , success: true  }
  //   [0.0001, 1,      true  ], // { probability: 0.0001 , roll: 1      , success: true  }
  // prettier-ignore
  test.each<[number, number, boolean, string]>([
      [0,      0,      false, '❌ roll   0.00% is <= 100.00% threshold'],
      [0,      0.9999, false, '❌ roll 100.00% is <= 100.00% threshold'],
      [0.0001, 0.9998, false, '❌ roll  99.99% is <=  99.99% threshold'],
      [0.0001, 0.9999, true,  '✅ roll 100.00% is >   99.99% threshold'],
      [0.5,    0.4999, false, '❌ roll  50.00% is <=  50.00% threshold'],
      [0.5,    0.5,    true,  '✅ roll  50.01% is >   50.00% threshold'],
      [1,      0,      false, '✅ roll   0.01% is >    0.00% threshold'],
      [0.0001, 1,      true,  '✅ roll 100.00% is >   99.99% threshold'],
  ])('successProb: %f, roll: %f, success: %s -> expected format', (successProb, roll, success, expectedFormat) => {
    const rollResult: RollResultNew = {
      successProb,
      roll,
      success,
    }
    const result = buildRollResultStr(rollResult)
    expect(result).toContain(expectedFormat)
  })
})
