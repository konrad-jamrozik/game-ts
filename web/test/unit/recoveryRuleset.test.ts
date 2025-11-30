import { describe, expect, test } from 'vitest'
import { getRecoveryTurns } from '../../src/lib/model/ruleset/recoveryRuleset'

describe(getRecoveryTurns, () => {
  // prettier-ignore
  // All inputs must be whole integers (no fractional parts)
  // Float precision issues are tested via intermediate calculations (hitPointsLostPct)
  test.each<[number, number, number, number]>([
    // Columns: hitPoints, damage, hitPointsRecoveryPct, expected

    // Exact case from comment: hitPointsLostPct = 0.8, recoverPct = 2
    // 0.8 / 2 = 0.4, but may have float precision issues
    // Using damage=80, hitPoints=100 to get hpLost%=80
    [100, 80, 2, 40],  // hitPoints=100, damage=80, recv%=2 -> hpLost%=80, recvTurns=40

    // Cases where ceil is needed (fractional recovery turns)
    [100, 31, 10, 4],    // hitPoints=100, damage=31, recv%=10 -> hpLost%=31, recvTurns=ceil(3.1)=4
    [100, 57, 10, 6],    // hitPoints=100, damage=57, recv%=10 -> hpLost%=57, recvTurns=ceil(5.7)=6
    [100, 99, 10, 10],   // hitPoints=100, damage=99, recv%=10 -> hpLost%=99, recvTurns=ceil(9.9)=10

    // Cases that should result in exact integer divisions (no ceil needed)
    [100, 1, 1, 1],    // hitPoints=100, damage=1, recv%=1 -> hpLost%=1, recvTurns=1
    [100, 2, 1, 2],    // hitPoints=100, damage=2, recv%=1 -> hpLost%=2, recvTurns=2
    [100, 5, 1, 5],    // hitPoints=100, damage=5, recv%=1 -> hpLost%=5, recvTurns=5
    [100, 10, 1, 10],  // hitPoints=100, damage=10, recv%=1 -> hpLost%=10, recvTurns=10

    // Cases with different recovery percentages that may cause float precision issues
    [100, 8, 2, 4],   // hitPoints=100, damage=8, recv%=2 -> hpLost%=8, recvTurns=4
    [100, 4, 2, 2],   // hitPoints=100, damage=4, recv%=2 -> hpLost%=4, recvTurns=2
    [100, 2, 2, 1],   // hitPoints=100, damage=2, recv%=2 -> hpLost%=2, recvTurns=1
    [100, 1, 2, 1],   // hitPoints=100, damage=1, recv%=2 -> hpLost%=1, recvTurns=ceil(0.5)=1

    // Cases with recovery percentages that result in repeating decimals
    [100, 1, 3, 1],  // hitPoints=100, damage=1, recv%=3 -> hpLost%=1, recvTurns=ceil(0.333...)=1
    [100, 2, 3, 1],  // hitPoints=100, damage=2, recv%=3 -> hpLost%=2, recvTurns=ceil(0.666...)=1
    [100, 4, 3, 2],  // hitPoints=100, damage=4, recv%=3 -> hpLost%=4, recvTurns=ceil(1.333...)=2

    // Cases with different hitPoints values (testing the division damage/hitPoints)
    [1000, 8, 2, 1], // hitPoints=1000, damage=8, recv%=2 -> hpLost%=0.8, recvTurns=ceil(0.4)=1
    [1000, 80, 2, 4], // hitPoints=1000, damage=80, recv%=2 -> hpLost%=8, recvTurns=4
    [50, 4, 2, 4],   // hitPoints=50, damage=4, recv%=2 -> hpLost%=8, recvTurns=4

    // Edge cases
    [100, 0, 2, 0],   // No damage -> 0 recovery turns
    [100, 100, 2, 50], // Full damage -> hpLost%=100 (capped), recvTurns=50
    [100, 200, 2, 50], // Over-damage -> hpLost%=100 (capped), recvTurns=50

    // Cases with larger recovery percentages
    [100, 10, 5, 2],    // hitPoints=100, damage=10, recv%=5 -> hpLost%=10, recvTurns=2
    [100, 25, 5, 5],    // hitPoints=100, damage=25, recv%=5 -> hpLost%=25, recvTurns=5
    [100, 50, 5, 10],   // hitPoints=100, damage=50, recv%=5 -> hpLost%=50, recvTurns=10

    // Cases that test the Math.min cap at 100%
    [100, 150, 2, 50], // Over-damage -> hpLost%=100 (capped), recvTurns=50
    [100, 1000, 2, 50], // Extreme over-damage -> hpLost%=100 (capped), recvTurns=50

    // Cases with actual constant value (AGENT_RECOVERY_TURNS_FACTOR = 2)
    [30, 6, 2, 10],   // hitPoints=30, damage=6, recv%=2 -> hpLost%=20, recvTurns=10
    [30, 7, 2, 12],   // hitPoints=30, damage=7, recv%=2 -> hpLost%=23.333..., recvTurns=ceil(11.666...)=12
    [30, 15, 2, 25],  // hitPoints=30, damage=15, recv%=2 -> hpLost%=50, recvTurns=25
    [30, 30, 2, 50],  // hitPoints=30, damage=30, recv%=2 -> hpLost%=100 (capped), recvTurns=50

    // Cases that test float precision issues in intermediate calculations
    // These use whole integer inputs but result in fractional hitPointsLostPct values
    [1000, 16, 2, 1],  // hitPoints=1000, damage=16, recv%=2 -> hpLost%=1.6, recvTurns=ceil(0.8)=1
    [1000, 32, 2, 2],  // hitPoints=1000, damage=32, recv%=2 -> hpLost%=3.2, recvTurns=ceil(1.6)=2
    [1000, 64, 2, 4],  // hitPoints=1000, damage=64, recv%=2 -> hpLost%=6.4, recvTurns=ceil(3.2)=4

    // Cases where float precision might cause issues with values just below/above integer boundaries
    // Using damage values that result in hitPointsLostPct values near integer boundaries
    [100_000, 799, 2, 1],  // hitPoints=100000, damage=799, recv%=2 -> hpLost%=0.799, recvTurns=ceil(0.3995)=1
    [100_000, 801, 2, 1],  // hitPoints=100000, damage=801, recv%=2 -> hpLost%=0.801, recvTurns=ceil(0.4005)=1
    [100_000, 1599, 2, 1], // hitPoints=100000, damage=1599, recv%=2 -> hpLost%=1.599, recvTurns=ceil(0.7995)=1
    [100_000, 1601, 2, 1], // hitPoints=100000, damage=1601, recv%=2 -> hpLost%=1.601, recvTurns=ceil(0.8005)=1
  ])(
    'should calculate recovery turns correctly: hitPoints=%s, damage=%s, hitPointsRecoveryPct=%s -> %s',
    (hitPoints, damage, hitPointsRecoveryPct, expected) => {
      const result = getRecoveryTurns(hitPoints, damage, hitPointsRecoveryPct)
      expect(result).toBe(expected)
    }
  )
})
