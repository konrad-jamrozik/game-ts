import { describe, expect, test } from 'vitest'
import type { AgentView } from '../../src/lib/model/agents/AgentView'
import { getAgentSkillBasedValue } from '../../src/lib/model/ruleset/skillRuleset'
import { toF6, type Fixed6 } from '../../src/lib/model/fixed6'

function createMockAgentView(effectiveSkill: Fixed6): AgentView {
  return {
    isTerminated: () => false,
    isInTransit: () => false,
    isDeployedOnMissionSite: () => false,
    effectiveSkill: () => effectiveSkill,
    isAvailable: () => false,
    isOnAssignment: () => false,
    isOnContractingAssignment: () => false,
    isOnEspionageAssignment: () => false,
    isOnTrainingAssignment: () => false,
    validateInvariants: (): void => {
      // Mock implementation - no validation needed for tests
    },
    agent: (): never => {
      throw new Error('Not implemented in mock')
    },
  }
}

describe(getAgentSkillBasedValue, () => {
  // prettier-ignore
  test.each<[Fixed6, Fixed6]>([
    // Basic cases - exact divisions
    [toF6(  0), toF6( 0  )],       //   0 / 100 * 5 = 0
    [toF6(100), toF6( 5  )],       // 100 / 100 * 5 = 1   * 5 =  5
    [toF6(200), toF6(10  )],       // 200 / 100 * 5 = 2   * 5 = 10
    [toF6( 50), toF6( 2.5)],       //  50 / 100 * 5 = 0.5 * 5 =  2.5

    // Cases with repeating decimals that could cause floating point issues
    // 33.333333 / 100 = 0.33333333, which in binary is repeating
    // f6div floors, f6mult rounds, so: floor(33.333333/100) * 5 then round
    [toF6(33.333_333), toF6(1.666_665)],  // 33.333333 / 100 * 5 = 0.33333333 * 5 = 1.66666665 -> rounded to 1.666665
    [toF6(66.666_666), toF6(3.333_330)],  // 66.666666 / 100 * 5 = floor(0.66666666) * 5 -> rounded to 3.333330
    [toF6(16.666_666), toF6(0.833_330)],  // 16.666666 / 100 * 5 = floor(0.16666666) * 5 -> rounded to 0.833330

    // Cases with values that don't divide evenly by 100
    [toF6(1), toF6(0.05)],                 // 1 / 100 * 5 = 0.01 * 5 = 0.05
    [toF6(3), toF6(0.15)],                 // 3 / 100 * 5 = 0.03 * 5 = 0.15
    [toF6(7), toF6(0.35)],                 // 7 / 100 * 5 = 0.07 * 5 = 0.35
    [toF6(13), toF6(0.65)],                // 13 / 100 * 5 = 0.13 * 5 = 0.65
    [toF6(17), toF6(0.85)],                // 17 / 100 * 5 = 0.17 * 5 = 0.85
    [toF6(23), toF6(1.15)],                // 23 / 100 * 5 = 0.23 * 5 = 1.15
    [toF6(27), toF6(1.35)],                // 27 / 100 * 5 = 0.27 * 5 = 1.35
    [toF6(37), toF6(1.85)],                // 37 / 100 * 5 = 0.37 * 5 = 1.85
    [toF6(43), toF6(2.15)],                // 43 / 100 * 5 = 0.43 * 5 = 2.15
    [toF6(47), toF6(2.35)],                // 47 / 100 * 5 = 0.47 * 5 = 2.35
    [toF6(53), toF6(2.65)],                // 53 / 100 * 5 = 0.53 * 5 = 2.65
    [toF6(57), toF6(2.85)],                // 57 / 100 * 5 = 0.57 * 5 = 2.85
    [toF6(63), toF6(3.15)],                // 63 / 100 * 5 = 0.63 * 5 = 3.15
    [toF6(67), toF6(3.35)],                // 67 / 100 * 5 = 0.67 * 5 = 3.35
    [toF6(73), toF6(3.65)],                // 73 / 100 * 5 = 0.73 * 5 = 3.65
    [toF6(77), toF6(3.85)],                // 77 / 100 * 5 = 0.77 * 5 = 3.85
    [toF6(83), toF6(4.15)],                // 83 / 100 * 5 = 0.83 * 5 = 4.15
    [toF6(87), toF6(4.35)],                // 87 / 100 * 5 = 0.87 * 5 = 4.35
    [toF6(93), toF6(4.65)],                // 93 / 100 * 5 = 0.93 * 5 = 4.65
    [toF6(97), toF6(4.85)],                // 97 / 100 * 5 = 0.97 * 5 = 4.85

    // Cases with values that have many decimal places
    // f6div floors the division result, which can cause slight differences from expected
    [toF6(12.345_678), toF6(0.617_280)],   // 12.345678 / 100 * 5 = floor(0.12345678) * 5 -> rounded to 0.617280
    [toF6(45.678_901), toF6(2.283_945)],   // 45.678901 / 100 * 5 = 0.45678901 * 5 = 2.28394505 -> rounded to 2.283945
    [toF6(98.765_432), toF6(4.938_270)],   // 98.765432 / 100 * 5 = floor(0.98765432) * 5 -> rounded to 4.938270

    // Edge cases with very small values
    [toF6(0.1), toF6(0.005)],              // 0.1 / 100 * 5 = 0.001 * 5 = 0.005
    [toF6(0.01), toF6(0.0005)],            // 0.01 / 100 * 5 = 0.0001 * 5 = 0.0005
    [toF6(0.001), toF6(0.000_05)],         // 0.001 / 100 * 5 = 0.00001 * 5 = 0.00005

    // Cases that might cause precision issues when dividing by 100
    // These are values where the division result has many decimal places
    [toF6(1.234_567), toF6(0.061_725)],    // 1.234567 / 100 * 5 = floor(0.01234567) * 5 -> rounded to 0.061725
    [toF6(9.876_543), toF6(0.493_825)],    // 9.876543 / 100 * 5 = floor(0.09876543) * 5 -> rounded to 0.493825

    // Values that result in numbers close to integer boundaries after multiplication
    // f6div floors first, so 19.999999/100 floors to slightly less than 0.2, resulting in < 1.0 after multiplication
    [toF6(19.999_999), toF6(0.999_995)],  // 19.999999 / 100 * 5 = floor(0.19999999) * 5 = 0.19999999 * 5 = 0.99999995 -> rounded to 0.999995
    [toF6(20.000_001), toF6(1.0)],         // 20.000001 / 100 * 5 = floor(0.20000001) * 5 = 0.20000001 * 5 = 1.00000005 -> rounded to 1.0
    [toF6(99.999_999), toF6(4.999_995)],  // 99.999999 / 100 * 5 = floor(0.99999999) * 5 = 0.99999999 * 5 = 4.99999995 -> rounded to 4.999995
    [toF6(100.000_001), toF6(5.0)],       // 100.000001 / 100 * 5 = floor(1.00000001) * 5 = 1.00000001 * 5 = 5.00000005 -> rounded to 5.0

    // Common problematic floating point values
    [toF6(0.3), toF6(0.015)],             // 0.3 / 100 * 5 = 0.003 * 5 = 0.015
    [toF6(0.7), toF6(0.035)],             // 0.7 / 100 * 5 = 0.007 * 5 = 0.035
    [toF6(1.1), toF6(0.055)],             // 1.1 / 100 * 5 = 0.011 * 5 = 0.055
    [toF6(1.7), toF6(0.085)],             // 1.7 / 100 * 5 = 0.017 * 5 = 0.085
  ])('should calculate skill-based value correctly for effectiveSkill %s', (effectiveSkill, expected) => {
    const agent = createMockAgentView(effectiveSkill)
    const multiplier = 5 // Using AGENT_ESPIONAGE_INTEL as a realistic multiplier
    const result = getAgentSkillBasedValue(agent, multiplier)
    expect(result).toStrictEqual(expected)
  })
})
