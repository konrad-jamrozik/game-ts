/* eslint-disable vitest/no-commented-out-tests */
import { describe, expect, test } from 'vitest'
import type { RollResultNew } from '../../src/lib/turn_advancement/rolls'
import { buildRollResultStr } from '../../src/lib/utils/fmtAttackLog'

describe(buildRollResultStr, () => {
  // Test cases addressing the concerns:
  // 1. Roll of 0 should display as 0.01% not 0.00%
  // 2. Roll of 0.(9) should display as 100% not 99.99%
  // 3. Same concerns with successProb
  // 4. Equality checks: should it be > or >= ?

  test('case 1', () => {
    const rollResult: RollResultNew = {
      successProb: 1,
      roll: 0,
      success: false,
    }
    const result = buildRollResultStr(rollResult)
    expect(result).toContain('✅ roll   0.01% is >    0.00% threshold')
  })

  test('case 2', () => {
    const rollResult: RollResultNew = {
      successProb: 0,
      roll: 0.9999,
      success: false,
    }
    const result = buildRollResultStr(rollResult)
    expect(result).toContain('❌ roll 100.00% is <= 100.00% threshold')
  })

  //   [0.0001, 0.9998, false ], // { probability: 0.0001 , roll: 0.9998 , success: false }
  //   [0.0001, 0.9999, true  ], // { probability: 0.0001 , roll: 0.9999 , success: true  }
  test('case 3', () => {
    const rollResult: RollResultNew = {
      roll: 0.9998,
      successProb: 0.0001,
      success: false,
    }
    const result = buildRollResultStr(rollResult)
    expect(result).toContain('❌ roll  99.99% is <=  99.99% threshold')
  })

  test('case 4', () => {
    const rollResult: RollResultNew = {
      roll: 0.9999,
      successProb: 0.0001,
      success: true,
    }
    const result = buildRollResultStr(rollResult)
    expect(result).toContain('✅ roll 100.00% is >   99.99% threshold')
  })

  //   test('successProb of 0 should display correctly', () => {
  //     const rollResult: RollResultNew = {
  //       roll: 0.5,
  //       successProb: 0,
  //       success: true,
  //     }
  //     const result = buildRollResultStr(rollResult)
  //     // successProb of 0 should display as 0.01% not 0.00%
  //     expect(result).toContain('0.01%')
  //     expect(result).not.toContain('0.00%')
  //   })

  //   test('successProb approaching 1 should display as 100%', () => {
  //     const rollResult: RollResultNew = {
  //       roll: 0.5,
  //       successProb: 0.9999,
  //       success: false,
  //     }
  //     const result = buildRollResultStr(rollResult)
  //     // successProb of 0.9999 should display as 100.00% not 99.99%
  //     expect(result).toContain('100.00%')
  //     expect(result).not.toContain('99.99%')
  //   })

  //   test('equality check: roll exactly equal to threshold should use correct operator', () => {
  //     // When roll == failureProb, success = roll >= failureProb = true
  //     // So the relation should be '> ' (success case)
  //     const rollResult: RollResultNew = {
  //       roll: 0.5,
  //       successProb: 0.5,
  //       success: true, // roll >= failureProb (0.5 >= 0.5) = true
  //     }
  //     const result = buildRollResultStr(rollResult)
  //     // Should show '> ' not '<='
  //     expect(result).toContain('> ')
  //     expect(result).not.toContain('<=')
  //   })

  //   test('equality check: roll just below threshold should use <=', () => {
  //     const rollResult: RollResultNew = {
  //       roll: 0.4999,
  //       successProb: 0.5,
  //       success: false, // roll < failureProb (0.4999 < 0.5) = false
  //     }
  //     const result = buildRollResultStr(rollResult)
  //     // Should show '<=' not '> '
  //     expect(result).toContain('<=')
  //     expect(result).not.toContain('> ')
  //   })

  //   test('edge case: roll of 0.0001 should display as 0.01%', () => {
  //     const rollResult: RollResultNew = {
  //       roll: 0.0001,
  //       successProb: 0.5,
  //       success: false,
  //     }
  //     const result = buildRollResultStr(rollResult)
  //     expect(result).toContain('0.01%')
  //   })

  //   test('edge case: roll of 0.999 should display correctly', () => {
  //     const rollResult: RollResultNew = {
  //       roll: 0.999,
  //       successProb: 0.5,
  //       success: true,
  //     }
  //     const result = buildRollResultStr(rollResult)
  //     // 0.999 * 100 = 99.9, which floors to 99.90%
  //     expect(result).toContain('99.90%')
  //   })

  //   test('edge case: successProb of 0.0001 should display as 0.01%', () => {
  //     const rollResult: RollResultNew = {
  //       roll: 0.5,
  //       successProb: 0.0001,
  //       success: true,
  //     }
  //     const result = buildRollResultStr(rollResult)
  //     expect(result).toContain('0.01%')
  //   })
})
