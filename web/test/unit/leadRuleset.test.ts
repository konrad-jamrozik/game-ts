import { describe, expect, test } from 'vitest'
import { getLeadAccumulatedIntel, getLeadResistance, getLeadSuccessChance } from '../../src/lib/ruleset/leadRuleset'
import { agFix } from '../fixtures/agentFixture'

describe('leadRuleset', () => {
  describe(getLeadSuccessChance, () => {
    test.each([
      [0, 5, 0],
      [5, 5, 0.01], // 5 / (5*100)
      [500, 5, 1],
      [1000, 5, 1],
    ])('returns correct success chance for intel=%d, difficulty=%d', (accumulatedIntel, difficulty, expected) => {
      expect(getLeadSuccessChance(accumulatedIntel, difficulty)).toBeCloseTo(expected, 10)
    })
  })

  describe(getLeadResistance, () => {
    test.each([
      [0, 5, 0],
      [125, 5, 0.5], // (125/500)^0.5
      [500, 5, 1],
      [2000, 5, 1],
    ])('returns correct resistance for intel=%d, difficulty=%d', (accumulatedIntel, difficulty, expected) => {
      expect(getLeadResistance(accumulatedIntel, difficulty)).toBeCloseTo(expected, 10)
    })
  })

  describe(getLeadAccumulatedIntel, () => {
    test('one default agent produces 10 intel/turn at zero resistance', () => {
      agFix.resetIdCounter()
      const agents = [agFix.default()]
      const gain = getLeadAccumulatedIntel(agents, 0, 10) // difficulty=10 => 1000 effective, so resistance ~= 0
      expect(gain).toBeCloseTo(10, 10)
    })

    test('two default agents have diminishing returns vs linear scaling', () => {
      agFix.resetIdCounter()
      const agents = [agFix.default(), agFix.default()]
      const gain = getLeadAccumulatedIntel(agents, 0, 10)
      expect(gain).toBeGreaterThan(10)
      expect(gain).toBeLessThan(20)
    })
  })
})
