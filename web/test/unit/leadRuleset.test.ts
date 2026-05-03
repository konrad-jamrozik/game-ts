import { describe, expect, test } from 'vitest'
import {
  getActualLeadDifficulty,
  getLeadCumulativeSuccessChance,
  getLeadProgressFromAgents,
  getLeadTeamPower,
  getLeadTurnSuccessChance,
  getLeadTurnSuccessChanceRange,
} from '../../src/lib/ruleset/leadRuleset'
import { agFix } from '../fixtures/agentFixture'

describe('leadRuleset', () => {
  describe(getActualLeadDifficulty, () => {
    test.each([
      [10, 0, 10],
      [10, 0.5, 12.5],
      [10, 1, 15],
    ])('maps visible difficulty %d and random factor %d to actual difficulty %d', (difficulty, randomFactor, expected) => {
      expect(getActualLeadDifficulty(difficulty, randomFactor)).toBeCloseTo(expected, 10)
    })
  })

  describe(getLeadCumulativeSuccessChance, () => {
    test.each([
      [0, 10, 0],
      [2, 10, 0.008],
      [5, 10, 0.125],
      [10, 10, 1],
      [15, 10, 1],
    ])('returns cubic cumulative chance for progress=%d, actualDifficulty=%d', (progress, actualDifficulty, expected) => {
      expect(getLeadCumulativeSuccessChance(progress, actualDifficulty)).toBeCloseTo(expected, 10)
    })
  })

  describe(getLeadTurnSuccessChance, () => {
    test.each([
      [0, 1, 10, 0.001],
      [1, 2, 10, 0.007_007_007_007],
      [7, 8, 10, 0.257_229_832_572],
      [9, 10, 10, 1],
      [10, 11, 10, 1],
    ])(
      'returns conditional turn chance for progress %d -> %d against actual difficulty %d',
      (previousProgress, currentProgress, actualDifficulty, expected) => {
        expect(getLeadTurnSuccessChance(previousProgress, currentProgress, actualDifficulty)).toBeCloseTo(expected, 10)
      },
    )
  })

  describe(getLeadTurnSuccessChanceRange, () => {
    test('returns lower and upper chance from the hidden difficulty range', () => {
      const range = getLeadTurnSuccessChanceRange(7, 8, 10)

      expect(range.lower).toBeCloseTo(0.055_738_786_28, 10)
      expect(range.upper).toBeCloseTo(0.257_229_832_572, 10)
    })
  })

  describe(getLeadProgressFromAgents, () => {
    test('one default agent produces 1 progress per turn', () => {
      agFix.resetIdCounter()
      const agents = [agFix.default()]
      const gain = getLeadProgressFromAgents(agents)
      expect(gain).toBeCloseTo(1, 10)
    })

    test('two default agents have diminishing returns vs linear scaling', () => {
      agFix.resetIdCounter()
      const agents = [agFix.default(), agFix.default()]
      const gain = getLeadProgressFromAgents(agents)
      expect(gain).toBeGreaterThan(1)
      expect(gain).toBeLessThan(2)
      expect(gain).toBeCloseTo(2 ** 0.8, 10)
    })
  })

  describe(getLeadTeamPower, () => {
    test('returns zero when no agents are assigned', () => {
      expect(getLeadTeamPower([])).toBe(0)
    })
  })
})
