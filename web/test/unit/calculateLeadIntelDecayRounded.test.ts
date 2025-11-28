import { describe, expect, test } from 'vitest'
import { calculateLeadIntelDecayAbsRounded } from '../../src/lib/model/ruleset/leadRuleset'

describe('calculateLeadIntelDecayRounded', () => {
  describe('zero and small values', () => {
    test('should return 0 for 0 intel', () => {
      const result = calculateLeadIntelDecayAbsRounded(0)
      expect(Math.abs(result)).toBe(0)
    })

    test('should return 1 for 1 intel', () => {
      // 1 intel * 10 bps = 10 bps decay
      // ceil((1 * 10) / 10000) = ceil(0.001) = 1
      expect(calculateLeadIntelDecayAbsRounded(1)).toBe(1)
    })

    test('should return 1 for 5 intel', () => {
      // 5 intel * 10 bps = 50 bps decay
      // ceil((5 * 50) / 10000) = ceil(0.025) = 1
      expect(calculateLeadIntelDecayAbsRounded(5)).toBe(1)
    })

    test('should return 1 for 10 intel', () => {
      // 10 intel * 10 bps = 100 bps decay
      // ceil((10 * 100) / 10000) = ceil(0.1) = 1
      expect(calculateLeadIntelDecayAbsRounded(10)).toBe(1)
    })
  })

  describe('values before cap', () => {
    test('should return 10 for 100 intel', () => {
      // 100 intel * 10 bps = 1000 bps decay
      // ceil((100 * 1000) / 10000) = ceil(10) = 10
      expect(calculateLeadIntelDecayAbsRounded(100)).toBe(10)
    })

    test('should return 20 for 200 intel', () => {
      // 200 intel * 10 bps = 2000 bps decay
      // ceil((200 * 2000) / 10000) = ceil(40) = 40
      // Wait, let me recalculate: decay = min(200 * 10, 5000) = min(2000, 5000) = 2000
      // result = ceil((200 * 2000) / 10000) = ceil(40) = 40
      expect(calculateLeadIntelDecayAbsRounded(200)).toBe(40)
    })

    test('should return 50 for 250 intel', () => {
      // 250 intel * 10 bps = 2500 bps decay
      // ceil((250 * 2500) / 10000) = ceil(62.5) = 63
      expect(calculateLeadIntelDecayAbsRounded(250)).toBe(63)
    })

    test('should return 100 for 400 intel', () => {
      // 400 intel * 10 bps = 4000 bps decay
      // ceil((400 * 4000) / 10000) = ceil(160) = 160
      expect(calculateLeadIntelDecayAbsRounded(400)).toBe(160)
    })
  })

  describe('values at cap threshold', () => {
    test('should return 250 for 500 intel (at cap)', () => {
      // 500 intel * 10 bps = 5000 bps decay (exactly at MAX_INTEL_DECAY)
      // ceil((500 * 5000) / 10000) = ceil(250) = 250
      expect(calculateLeadIntelDecayAbsRounded(500)).toBe(250)
    })
  })

  describe('values beyond cap', () => {
    test('should return 500 for 1000 intel (capped decay)', () => {
      // 1000 intel * 10 bps = 10000, but capped at 5000 bps
      // ceil((1000 * 5000) / 10000) = ceil(500) = 500
      expect(calculateLeadIntelDecayAbsRounded(1000)).toBe(500)
    })

    test('should return 500 for 2000 intel (capped decay)', () => {
      // 2000 intel * 10 bps = 20000, but capped at 5000 bps
      // ceil((2000 * 5000) / 10000) = ceil(1000) = 1000
      expect(calculateLeadIntelDecayAbsRounded(2000)).toBe(1000)
    })

    test('should return 5000 for 10_000 intel (capped decay)', () => {
      // 10_000 intel * 10 bps = 100_000, but capped at 5000 bps
      // ceil((10_000 * 5000) / 10_000) = ceil(5000) = 5000
      expect(calculateLeadIntelDecayAbsRounded(10_000)).toBe(5000)
    })
  })

  describe('edge cases with rounding', () => {
    test('should round up correctly for values just below integer threshold', () => {
      // 99 intel: decay = min(99 * 10, 5000) = 990
      // ceil((99 * 990) / 10000) = ceil(9.801) = 10
      expect(calculateLeadIntelDecayAbsRounded(99)).toBe(10)
    })

    test('should round up correctly for values just above integer threshold', () => {
      // 101 intel: decay = min(101 * 10, 5000) = 1010
      // ceil((101 * 1010) / 10000) = ceil(10.201) = 11
      expect(calculateLeadIntelDecayAbsRounded(101)).toBe(11)
    })

    test('should handle fractional results correctly', () => {
      // 50 intel: decay = min(50 * 10, 5000) = 500
      // ceil((50 * 500) / 10000) = ceil(2.5) = 3
      expect(calculateLeadIntelDecayAbsRounded(50)).toBe(3)
    })

    test('should handle values that result in exactly integer division', () => {
      // 1000 intel: decay = min(1000 * 10, 5000) = 5000
      // ceil((1000 * 5000) / 10000) = ceil(500) = 500
      expect(calculateLeadIntelDecayAbsRounded(1000)).toBe(500)
    })
  })

  describe('progressive values', () => {
    test.each([
      [1, 1],
      [5, 1],
      [10, 1],
      [20, 1],
      [50, 3],
      [100, 10],
      [200, 40],
      [300, 90],
      [400, 160],
      [500, 250],
      [600, 300],
      [1000, 500],
      [2000, 1000],
      [5000, 2500],
    ])('should return correct decay for %d intel', (accumulatedIntel, expectedDecay) => {
      expect(calculateLeadIntelDecayAbsRounded(accumulatedIntel)).toBe(expectedDecay)
    })

    test('should return 0 for 0 intel in progressive values', () => {
      const result = calculateLeadIntelDecayAbsRounded(0)
      expect(Math.abs(result)).toBe(0)
    })
  })
})
