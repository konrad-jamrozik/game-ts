import { describe, expect, test } from 'vitest'
import { getAgentSkillBasedValue } from '../../src/lib/ruleset/skillRuleset'
import { toF6 } from '../../src/lib/primitives/fixed6'
import { agFix } from '../fixtures/agentFixture'

describe(getAgentSkillBasedValue, () => {
  // prettier-ignore
  test.each<[number, number]>([
    // Basic cases - formula: (1 + (effectiveSkill - 100) / 500) * 5
    [  0,  4.0  ],       // (1 + (0 - 100) / 500) * 5 = (1 - 0.2) * 5 = 4.0
    [100,  5.0  ],       // (1 + (100 - 100) / 500) * 5 = (1 + 0) * 5 = 5.0
    [200,  6.0  ],       // (1 + (200 - 100) / 500) * 5 = (1 + 0.2) * 5 = 6.0
    [ 50,  4.5  ],       // (1 + (50 - 100) / 500) * 5 = (1 - 0.1) * 5 = 4.5

    // Cases with repeating decimals that could cause floating point issues
    [33.333_333, 4.333_333],  // (1 + (33.333333 - 100) / 500) * 5 = (1 - 0.133333334) * 5 = 4.3333333
    [66.666_666, 4.666_667],  // (1 + (66.666666 - 100) / 500) * 5 = (1 - 0.066666668) * 5 = 4.6666666 -> rounded to 4.666667
    [16.666_666, 4.166_667],  // (1 + (16.666666 - 100) / 500) * 5 = (1 - 0.166666668) * 5 = 4.1666666 -> rounded to 4.166667

    // Cases with values that don't divide evenly by 500
    [  1, 4.01],       // (1 + (1 - 100) / 500) * 5 = (1 - 0.198) * 5 = 4.01
    [ 13, 4.13],       // (1 + (13 - 100) / 500) * 5 = (1 - 0.174) * 5 = 4.13
    [ 37, 4.37],       // (1 + (37 - 100) / 500) * 5 = (1 - 0.126) * 5 = 4.37
    [ 57, 4.57],       // (1 + (57 - 100) / 500) * 5 = (1 - 0.086) * 5 = 4.57
    [ 83, 4.83],       // (1 + (83 - 100) / 500) * 5 = (1 - 0.034) * 5 = 4.83
    [ 97, 4.97],       // (1 + (97 - 100) / 500) * 5 = (1 - 0.006) * 5 = 4.97

    // Cases with values that have many decimal places
    [12.345_678, 4.123_457],  // (1 + (12.345678 - 100) / 500) * 5 = (1 - 0.175308644) * 5 = 4.12345678 -> rounded to 4.123457
    [45.678_901, 4.456_789],  // (1 + (45.678901 - 100) / 500) * 5 = (1 - 0.108642198) * 5 = 4.45678901
    [98.765_432, 4.987_654],  // (1 + (98.765432 - 100) / 500) * 5 = (1 - 0.002469136) * 5 = 4.98765432

    // Edge cases with very small values
    [0.1, 4.001],       // (1 + (0.1 - 100) / 500) * 5 = (1 - 0.1998) * 5 = 4.001
    [0.01, 4.0001],     // (1 + (0.01 - 100) / 500) * 5 = (1 - 0.19998) * 5 = 4.0001
    [0.001, 4.000_01],  // (1 + (0.001 - 100) / 500) * 5 = (1 - 0.199998) * 5 = 4.00001

    // Cases that might cause precision issues
    [1.234_567, 4.012_346],  // (1 + (1.234567 - 100) / 500) * 5 = (1 - 0.197530866) * 5 = 4.01234567
    [9.876_543, 4.098_765],  // (1 + (9.876543 - 100) / 500) * 5 = (1 - 0.180246914) * 5 = 4.09876543

    // Values that result in numbers close to integer boundaries after multiplication
    [19.999_999,  4.2],  // (1 + (19.999999 - 100) / 500) * 5 = (1 - 0.16) * 5 = 4.2
    [20.000_001,  4.2],  // (1 + (20.000001 - 100) / 500) * 5 = (1 - 0.16) * 5 = 4.2
    [99.999_999,  5.0],  // (1 + (99.999999 - 100) / 500) * 5 = (1 - 0.000000002) * 5 = 5.0
    [100.000_001, 5.0],  // (1 + (100.000001 - 100) / 500) * 5 = (1 + 0.000000002) * 5 = 5.0

    // Common problematic floating point values
    [0.3, 4.003],  // (1 + (0.3 - 100) / 500) * 5 = (1 - 0.1994) * 5 = 4.003
    [0.7, 4.007],  // (1 + (0.7 - 100) / 500) * 5 = (1 - 0.1986) * 5 = 4.007
    [1.1, 4.011],  // (1 + (1.1 - 100) / 500) * 5 = (1 - 0.1978) * 5 = 4.011
    [1.7, 4.017],  // (1 + (1.7 - 100) / 500) * 5 = (1 - 0.1966) * 5 = 4.017
  ])('should calculate skill-based value correctly for effectiveSkill %s', (effectiveSkill, expected) => {
    const expectedF6 = toF6(expected)
    // Create agent with skill set to effectiveSkill, no exhaustion, full hit points
    // so that effectiveSkill(agent) = skill
    const agent = agFix.new({
      skill: toF6(effectiveSkill),
      exhaustion: 0,
      hitPoints: toF6(30),
      maxHitPoints: 30,
    })
    const multiplier = 5 // Using AGENT_ESPIONAGE_INTEL as a realistic multiplier
    const result = getAgentSkillBasedValue(agent, multiplier)
    expect(result).toStrictEqual(expectedF6)
  })
})
