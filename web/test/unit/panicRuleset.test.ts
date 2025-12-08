/* eslint-disable vitest/no-conditional-expect */
// oxlint-disable no-conditional-in-test
import { describe, test, expect } from 'vitest'
import { toF6 } from '../../src/lib/primitives/fixed6'
import { decaySuppression } from '../../src/lib/ruleset/panicRuleset'

describe('panicRuleset', () => {
  describe(decaySuppression, () => {
    test('suppression decays to zero correctly', () => {
      // We test here that this will decay correctly after few decays of 10%.
      let suppression = toF6(0.005) // 0.5%

      for (let idx = 0; idx < 26; idx += 1) {
        const { decayedSuppression } = decaySuppression(suppression)
        suppression = decayedSuppression

        if (idx === 23) {
          // After 24 calls (idx 0-23), suppression should be 0.000_127
          // i.e. 0.27%
          expect(suppression).toStrictEqual(toF6(0.000_127))
        } else if (idx === 24) {
          // After 25 calls (idx 0-24), suppression should be 0.000_000
          expect(suppression).toStrictEqual(toF6(0))
        }
      }
    })
  })
})
