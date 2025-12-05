import { describe, expect, test } from 'vitest'
import { getRecoveryTurns } from '../../src/lib/ruleset/recoveryRuleset'
import { toF6 } from '../../src/lib/primitives/fixed6'

describe(getRecoveryTurns, () => {
  // prettier-ignore
  test.each<[string, number, number, number, number]>([
    // Columns: testName, maxHitPoints, damage, hitPointsRecoveryPct, expected

    // Boundary cases
    ['  1/ 30 hp left -> 96.66% damage -> 49 turns ', 30, 29, 2, 49],
    ['  2/ 30 hp left -> 93.33% damage -> 47 turns ', 30, 28, 2, 47],
    [' 14/ 30 hp left -> 53.33% damage -> 27 turns ', 30, 16, 2, 27],
    [' 15/ 30 hp left -> 50.00% damage -> 25 turns ', 30, 15, 2, 25],
    [' 16/ 30 hp left -> 46.66% damage -> 24 turns ', 30, 14, 2, 24],
    [' 28/ 30 hp left ->  6.66% damage ->  4 turns ', 30,  2, 2,  4],
    [' 29/ 30 hp left ->  3.33% damage ->  2 turns ', 30,  1, 2,  2],

    // Exact divisions
    [' 10/100 hp left -> 90.00% damage -> 45 turns ', 100,  90, 2,  45],
    [' 20/100 hp left -> 80.00% damage -> 40 turns ', 100,  80, 2,  40],
    [' 50/100 hp left -> 50.00% damage -> 25 turns ', 100,  50, 2,  25],
    [' 90/100 hp left -> 10.00% damage ->  5 turns ', 100,  10, 2,   5],

    // Recovery of 3% instead of 2%
    [' 10/100 hp left -> 90.00% damage -> 30 turns @ 3% ', 100,  90, 3,  30],
    [' 20/100 hp left -> 80.00% damage -> 27 turns @ 3% ', 100,  80, 3,  27],
    [' 50/100 hp left -> 50.00% damage -> 17 turns @ 3% ', 100,  50, 3,  17],
    [' 90/100 hp left -> 10.00% damage ->  4 turns @ 3% ', 100,  10, 3,   4],

    // New test cases with fractional recovery percentages
    [' Total HP = 30, current hp = 20, recovery % = 2 -> 17 turns ', 30, 10, 2, 17],
    [' Total HP = 30, current hp = 20, recovery % = 2.2 -> 16 turns ', 30, 10, 2.2, 16],
    [' Total HP = 31, current hp = 10, recovery % = 2 -> 34 turns ', 31, 21, 2, 34],
    [' Total HP = 31, current hp = 10, recovery % = 2.2 -> 31 turns ', 31, 21, 2.2, 31],
    [' Total HP = 31, current hp = 10, recovery % = 2.4 -> 29 turns ', 31, 21, 2.4, 29],
  ])(
    '%s: maxHitPoints=%s, damage=%s, hitPointsRecoveryPct=%s -> %s',
    (_testName, maxHitPoints, damage, hitPointsRecoveryPct, expected) => {
      const damageF6 = toF6(damage)
      const result = getRecoveryTurns(maxHitPoints, damageF6, toF6(hitPointsRecoveryPct))
      expect(result).toBe(expected)
    }
  )
})
