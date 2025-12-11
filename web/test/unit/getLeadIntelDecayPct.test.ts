import { describe, expect, test } from 'vitest'
import { getLeadIntelDecayPct } from '../../src/lib/ruleset/leadRuleset'

describe(getLeadIntelDecayPct, () => {
  // prettier-ignore
  test.each([
    // Example from about_lead_investigations.md:
    // Agent Alpha (Skill 150) and Agent Bravo (Skill 50). Total Skill: 200.
    // Agent Alpha (Skill 150) is removed, Skill 50 remains.
    // Loss% = 1 - (50/200) = 1 - 0.25 = 0.75 = 75%
    [200, 50, 0.75],
    
    // Another example: Skill 100 + Skill 50 = 150 total
    // Remove Skill 100 agent, Skill 50 remains
    // Loss% = 1 - (50/150) = 1 - 0.333... = 0.666... ≈ 66.67%
    [150, 50, 2 / 3],
    
    // Edge cases
    [0, 0, 0],        // No skill before, no loss
    [200, 200, 0],    // No skill removed, no loss
    [200, 0, 1],      // All skill removed, 100% loss
    [200, 100, 0.5],  // Half skill removed, 50% loss
    [100, 10, 0.9],   // 90% skill removed, 90% loss
  ])(
    'should return correct decay percentage when skill sum %d reduced to %d',
    (oldSkillSum, newSkillSum, expectedPct) => {
      const result = getLeadIntelDecayPct(oldSkillSum, newSkillSum)
      expect(result).toBeCloseTo(expectedPct, 10)
    },
  )
})
