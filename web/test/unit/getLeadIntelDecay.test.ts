import { describe, expect, test } from 'vitest'
import { getLeadIntelDecay } from '../../src/lib/ruleset/leadRuleset'

describe(getLeadIntelDecay, () => {
  // prettier-ignore
  test.each([
      [0, 0],       // getLeadIntelDecay(   0) = ceil(   0 *  0.1%) = ceil(   0    ) =    0
      [1, 1],       // getLeadIntelDecay(   1) = ceil(   1 *  0.1%) = ceil(   0.001) =    1
      [5, 1],       // getLeadIntelDecay(   5) = ceil(   5 *  0.5%) = ceil(   0.025) =    1
      [10, 1],      // getLeadIntelDecay(  10) = ceil(  10 *  1  %) = ceil(   0.1  ) =    1
      [50, 3],      // getLeadIntelDecay(  50) = ceil(  50 *  5  %) = ceil(   2.5  ) =    3
      [99,  10],    // getLeadIntelDecay(  99) = ceil(  99 * 10  %) = ceil(   9.9  ) =   10
      [100, 10],    // getLeadIntelDecay( 100) = ceil( 100 * 10  %) = ceil(  10    ) =   10
      [101, 11],    // getLeadIntelDecay( 101) = ceil( 101 * 10  %) = ceil(  10.1  ) =   11
      [200, 40],    // getLeadIntelDecay( 200) = ceil( 200 * 20  %) = ceil(  40    ) =   40
      [250, 63],    // getLeadIntelDecay( 250) = ceil( 250 * 25  %) = ceil(  62.5  ) =   63
      [300, 90],    // getLeadIntelDecay( 300) = ceil( 300 * 30  %) = ceil(  90    ) =   90
      [500, 250],   // getLeadIntelDecay( 500) = ceil( 500 * 50  %) = ceil( 250    ) =  250
      [600, 300],   // getLeadIntelDecay( 600) = ceil( 600 * 50  %) = ceil( 300    ) =  300
      [1000, 500],  // getLeadIntelDecay(1000) = ceil(1000 * 50  %) = ceil( 500    ) =  500
      [2000, 1000], // getLeadIntelDecay(2000) = ceil(2000 * 50  %) = ceil(1000    ) = 1000
      [5000, 2500], // getLeadIntelDecay(5000) = ceil(5000 * 50  %) = ceil(2500    ) = 2500
    ])('should return correct decay for %d intel (from comment examples)', (accumulatedIntel, expectedDecay) => {
      expect(getLeadIntelDecay(accumulatedIntel)).toBe(expectedDecay)
    })
})
