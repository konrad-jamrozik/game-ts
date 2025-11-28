import { describe, expect, test } from 'vitest'
import { calculateLeadIntelDecayAbsRounded } from '../../src/lib/model/ruleset/leadRuleset'

describe(calculateLeadIntelDecayAbsRounded, () => {
  // prettier-ignore
  test.each([
      [0, 0],       // decayAbs(   0) = ceil(   0 *  0.1%) = ceil(   0    ) =    0
      [1, 1],       // decayAbs(   1) = ceil(   1 *  0.1%) = ceil(   0.001) =    1
      [5, 1],       // decayAbs(   5) = ceil(   5 *  0.5%) = ceil(   0.025) =    1
      [10, 1],      // decayAbs(  10) = ceil(  10 *  1  %) = ceil(   0.1  ) =    1
      [50, 3],      // decayAbs(  50) = ceil(  50 *  5  %) = ceil(   2.5  ) =    3
      [99,  10],    // decayAbs(  99) = ceil(  99 * 10  %) = ceil(   9.9  ) =   10
      [100, 10],    // decayAbs( 100) = ceil( 100 * 10  %) = ceil(  10    ) =   10
      [101, 11],    // decayAbs( 101) = ceil( 101 * 10  %) = ceil(  10.1  ) =   11
      [200, 40],    // decayAbs( 200) = ceil( 200 * 20  %) = ceil(  40    ) =   40
      [250, 63],    // decayAbs( 250) = ceil( 250 * 25  %) = ceil(  62.5  ) =   63
      [300, 90],    // decayAbs( 300) = ceil( 300 * 30  %) = ceil(  90    ) =   90
      [500, 250],   // decayAbs( 500) = ceil( 500 * 50  %) = ceil( 250    ) =  250
      [600, 300],   // decayAbs( 600) = ceil( 600 * 50  %) = ceil( 300    ) =  300
      [1000, 500],  // decayAbs(1000) = ceil(1000 * 50  %) = ceil( 500    ) =  500
      [2000, 1000], // decayAbs(2000) = ceil(2000 * 50  %) = ceil(1000    ) = 1000
      [5000, 2500], // decayAbs(5000) = ceil(5000 * 50  %) = ceil(2500    ) = 2500
    ])('should return correct decay for %d intel (from comment examples)', (accumulatedIntel, expectedDecay) => {
      expect(calculateLeadIntelDecayAbsRounded(accumulatedIntel)).toBe(expectedDecay)
    })
})
