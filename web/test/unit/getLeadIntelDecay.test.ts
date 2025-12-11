import { describe, expect, test } from 'vitest'
import { getLeadIntelDecay } from '../../src/lib/ruleset/leadRuleset'

describe(getLeadIntelDecay, () => {
  // prettier-ignore
  test.each([
    // Example from about_lead_investigations.md:
    // 700 Intel, Agent Alpha (Skill 150) and Agent Bravo (Skill 50). Total Skill: 200.
    // Agent Alpha (Skill 150) is removed.
    // I_new = 700 × (50/200) = 175 Intel
    // Loss = 700 - 175 = 525 Intel
    [700, 200, 50, 525],
    
    // Another example: 500 Intel, Skill 100 + Skill 50 = 150 total
    // Remove Skill 100 agent, Skill 50 remains
    // I_new = 500 × (50/150) = 166.67 Intel
    // Loss = floor(500 × (1 - 50/150)) = floor(500 × 0.666...) = floor(333.33) = 333 Intel
    [500, 150, 50, 333],
    
    // Edge cases
    [0, 200, 50, 0],        // No intel, no loss
    [100, 0, 0, 0],         // No skill before, no loss
    [100, 200, 200, 0],     // No skill removed, no loss
    [100, 200, 0, 100],     // All skill removed, lose all intel
    [200, 200, 100, 100],   // Half skill removed, lose half intel
  ])(
    'should return correct decay for %d intel when skill sum %d reduced to %d',
    (accumulatedIntel, oldSkillSum, newSkillSum, expectedDecay) => {
      expect(getLeadIntelDecay(accumulatedIntel, oldSkillSum, newSkillSum)).toBe(expectedDecay)
    },
  )
})
