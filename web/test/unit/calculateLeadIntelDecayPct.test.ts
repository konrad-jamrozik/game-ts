import { describe, expect, test } from 'vitest'
import { calculateLeadIntelDecayPct } from '../../src/lib/model/ruleset/leadRuleset'

describe(calculateLeadIntelDecayPct, () => {
  // prettier-ignore
  test.each([
    [1, 10],     // intelDecayPct(  1) =   1 * 0.1% = 0.1% = 10 bps
    [5, 50],     // intelDecayPct(  5) =   5 * 0.1% = 0.5% = 50 bps
    [10, 100],   // intelDecayPct( 10) =  10 * 0.1% = 1% = 100 bps
    [40, 400],   // intelDecayPct( 40) =  40 * 0.1% = 4% = 400 bps
    [100, 1000], // intelDecayPct(100) = 100 * 0.1% = 10% = 1000 bps
    [250, 2500], // intelDecayPct(250) = 250 * 0.1% = 25% = 2500 bps
    [300, 3000], // intelDecayPct(300) = 300 * 0.1% = 30% = 3000 bps
    [500, 5000], // intelDecayPct(500) = 500 * 0.1% = 50% = 5000 bps
    [600, 5000], // intelDecayPct(600) = 600 * 0.1% = 50% not 60%, because of min(... , 50%) = 5000 bps
  ])('should return correct decay percentage for %d intel', (accumulatedIntel, expectedBps) => {
    const result = calculateLeadIntelDecayPct(accumulatedIntel)
    expect(result.value).toBe(expectedBps)
  })
})
