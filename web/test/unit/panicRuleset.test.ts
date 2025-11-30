import { describe, test } from 'vitest'
import { toF6 } from '../../src/lib/model/fixed6'
import { decaySuppression } from '../../src/lib/model/ruleset/panicRuleset'

describe('panicRuleset', () => {
  describe(decaySuppression, () => {
    test('suppression decays to zero correctly', () => {
      // We test here that this will decay correctly after few decays of 10%.
      let suppression = toF6(0.005) // 0.5%

      for (let idx = 0; idx < 26; idx += 1) {
        console.log(`Applying suppression decay ${idx + 1}`)
        const { decayedSuppression } = decaySuppression(suppression)
        suppression = decayedSuppression

        if (idx === 24) {
          // After 25 calls (idx 0-24), suppression should be 0.000027
          expect(suppression).toStrictEqual(toF6(0.000027))
        } else if (idx === 25) {
          // After 26 calls (idx 0-25), suppression should be 0
          expect(suppression).toStrictEqual(toF6(0))
        }
      }
    })
  })
})
