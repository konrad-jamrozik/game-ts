import { describe, test } from 'vitest'
import { toF6 } from '../../src/lib/model/fixed6'
import { decaySuppression } from '../../src/lib/model/ruleset/panicRuleset'

describe('panicRuleset', () => {
  describe(decaySuppression, () => {
    test('should throw assertion error after multiple suppression decays', () => {
      // Start with suppression at 0.1% (0.001)
      // We test here that this will decay correctly after few decays of 10%.
      let suppression = toF6(0.001) // 0.1%

      // Apply suppression decay multiple times to trigger the assertion failure
      // The assertion failure occurs in f6mult -> toF6 -> assertMax6Dec
      // when precision loss would occur (more than 6 decimal places)
      // KJA most likely will crap out on precision loss

      for (let idx = 0; idx < 10; idx += 1) {
        console.log(`Applying suppression decay ${idx + 1}`)
        const { decayedSuppression } = decaySuppression(suppression)
        suppression = decayedSuppression
      }
    })
  })
})
