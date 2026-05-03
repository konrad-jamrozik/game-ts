import { describe, expect, test } from 'vitest'
import { getLeadProgressLoss } from '../../src/lib/ruleset/leadRuleset'

describe(getLeadProgressLoss, () => {
  // prettier-ignore
  test.each([
    [80, 200, 50, 60],
    [50, 150, 50, 33.333_333_333_333],
    [0, 200, 50, 0],
    [15, 0, 0, 0],
    [90, 200, 200, 0],
    [80, 200, 0, 80],
    [50, 200, 100, 25],
  ])(
    'returns correct loss for %d progress when skill sum %d is reduced to %d',
    (progress, oldSkillSum, newSkillSum, expectedLoss) => {
      expect(getLeadProgressLoss(progress, oldSkillSum, newSkillSum)).toBeCloseTo(expectedLoss, 10)
    },
  )
})
