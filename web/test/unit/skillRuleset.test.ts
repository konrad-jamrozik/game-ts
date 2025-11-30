import { describe, expect, test } from 'vitest'
import { agV } from '../../src/lib/model/agents/AgentView'
import { getAgentSkillBasedValue } from '../../src/lib/model/ruleset/skillRuleset'
import { toF6 } from '../../src/lib/primitives/fixed6'
import { agFix } from '../fixtures/agentFixture'

describe(getAgentSkillBasedValue, () => {
  // prettier-ignore
  test.each<[number, number]>([
    // Basic cases - exact divisions
    [  0,  0  ],       //   0 / 100 * 5 = 0
    [100,  5  ],       // 100 / 100 * 5 = 1   * 5 =  5
    [200, 10  ],       // 200 / 100 * 5 = 2   * 5 = 10
    [ 50,  2.5],       //  50 / 100 * 5 = 0.5 * 5 =  2.5

    // Cases with repeating decimals that could cause floating point issues
    // 33.333333 / 100 = 0.33333333, which in binary is repeating
    // Uses regular JS division/multiplication, then rounds with toF6
    [33.333_333, 1.666_667],  // 33.333333 / 100 * 5 = 0.33333333 * 5 = 1.66666665 -> rounded to 1.666667
    [66.666_666, 3.333_333],  // 66.666666 / 100 * 5 = 0.66666666 * 5 = 3.3333333  -> rounded to 3.333333
    [16.666_666, 0.833_333],  // 16.666666 / 100 * 5 = 0.16666666 * 5 = 0.8333333  -> rounded to 0.833333

    // Cases with values that don't divide evenly by 100
    [  1, 0.05],       //   1 / 100 * 5 = 0.01 * 5 = 0.05
    [ 13, 0.65],       //  13 / 100 * 5 = 0.13 * 5 = 0.65
    [ 37, 1.85],       //  37 / 100 * 5 = 0.37 * 5 = 1.85
    [ 57, 2.85],       //  57 / 100 * 5 = 0.57 * 5 = 2.85
    [ 83, 4.15],       //  83 / 100 * 5 = 0.83 * 5 = 4.15
    [ 97, 4.85],       //  97 / 100 * 5 = 0.97 * 5 = 4.85

    // Cases with values that have many decimal places
    // Uses regular JS division/multiplication, then rounds with toF6
    [12.345_678, 0.617_284],  // 12.345678 / 100 * 5 = 0.12345678 * 5 = 0.6172839  -> rounded to 0.617284
    [45.678_901, 2.283_945],  // 45.678901 / 100 * 5 = 0.45678901 * 5 = 2.28394505 -> rounded to 2.283945
    [98.765_432, 4.938_272],  // 98.765432 / 100 * 5 = 0.98765432 * 5 = 4.9382716  -> rounded to 4.938272

    // Edge cases with very small values
    [0.1, 0.005],       //  0.1   / 100 * 5 = 0.001   * 5 = 0.005
    [0.01, 0.0005],     //  0.01  / 100 * 5 = 0.0001  * 5 = 0.0005
    [0.001, 0.000_05],  //  0.001 / 100 * 5 = 0.00001 * 5 = 0.00005

    // Cases that might cause precision issues when dividing by 100
    // These are values where the division result has many decimal places
    [1.234_567, 0.061_728],  //  1.234567 / 100 * 5 = 0.01234567 * 5 = 0.06172835 -> rounded to 0.061728
    [9.876_543, 0.493_827],  //  9.876543 / 100 * 5 = 0.09876543 * 5 = 0.49382715 -> rounded to 0.493827

    // Values that result in numbers close to integer boundaries after multiplication
    // Uses regular JS division/multiplication, then rounds with toF6
    [19.999_999,  1.0],  //  19.999999 / 100 * 5 = 0.19999999 * 5 = 0.99999995 -> rounded to 1.0
    [20.000_001,  1.0],  //  20.000001 / 100 * 5 = 0.20000001 * 5 = 1.00000005 -> rounded to 1.0
    [99.999_999,  5.0],  //  99.999999 / 100 * 5 = 0.99999999 * 5 = 4.99999995 -> rounded to 5.0
    [100.000_001, 5.0],  // 100.000001 / 100 * 5 = 1.00000001 * 5 = 5.00000005 -> rounded to 5.0

    // Common problematic floating point values
    [0.3, 0.015],  //  0.3 / 100 * 5 = 0.003 * 5 = 0.015
    [0.7, 0.035],  //  0.7 / 100 * 5 = 0.007 * 5 = 0.035
    [1.1, 0.055],  //  1.1 / 100 * 5 = 0.011 * 5 = 0.055
    [1.7, 0.085],  //  1.7 / 100 * 5 = 0.017 * 5 = 0.085
  ])('should calculate skill-based value correctly for effectiveSkill %s', (effectiveSkill, expected) => {
    const expectedF6 = toF6(expected)
    // Create agent with skill set to effectiveSkill, no exhaustion, full hit points
    // so that effectiveSkill(agent) = skill
    const agent = agFix.new({
      skill: toF6(effectiveSkill),
      exhaustion: 0,
      hitPoints: 30,
      maxHitPoints: 30,
    })
    const agentView = agV(agent)
    const multiplier = 5 // Using AGENT_ESPIONAGE_INTEL as a realistic multiplier
    const result = getAgentSkillBasedValue(agentView, multiplier)
    expect(result).toStrictEqual(expectedF6)
  })
})
