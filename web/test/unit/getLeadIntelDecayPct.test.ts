import { describe, expect, test } from 'vitest'
import { getLeadIntelDecayPct } from '../../src/lib/model/ruleset/leadRuleset'

describe(getLeadIntelDecayPct, () => {
  // prettier-ignore
  test.each([
    [1,   0.001],     // getLeadIntelDecayPct(  1) =   1 * 0.1% = 0.1% = 0.001
    [5,   0.005],     // getLeadIntelDecayPct(  5) =   5 * 0.1% = 0.5% = 0.005
    [10,  0.01 ],     // getLeadIntelDecayPct( 10) =  10 * 0.1% = 1%   = 0.01
    [40,  0.04 ],     // getLeadIntelDecayPct( 40) =  40 * 0.1% = 4%   = 0.04
    [100, 0.1  ],     // getLeadIntelDecayPct(100) = 100 * 0.1% = 10%  = 0.1
    [250, 0.25 ],     // getLeadIntelDecayPct(250) = 250 * 0.1% = 25%  = 0.25
    [300, 0.3  ],     // getLeadIntelDecayPct(300) = 300 * 0.1% = 30%  = 0.3
    [500, 0.5  ],     // getLeadIntelDecayPct(500) = 500 * 0.1% = 50%  = 0.5
    [600, 0.5  ],     // getLeadIntelDecayPct(600) = 600 * 0.1% = 50%  = 0.5 # not 60%, because of min(... , 50%) = 0.5
  ])('should return correct decay percentage for %d intel', (accumulatedIntel, expectedPct) => {
    const result = getLeadIntelDecayPct(accumulatedIntel)
    expect(result).toBe(expectedPct)
  })
})
