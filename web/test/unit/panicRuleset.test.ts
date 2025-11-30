import { describe,  test } from 'vitest'
import { store } from '../../src/app/store'
import { makeInitialState } from '../../src/lib/model/ruleset/initialState'
import { advanceTurn, reset } from '../../src/lib/slices/gameStateSlice'
import { toF6 } from '../../src/lib/model/fixed6'
import { getSuppressionDecay } from '../../src/lib/model/ruleset/panicRuleset'

describe('panicRuleset', () => {
  describe(getSuppressionDecay, () => {
    test('should throw assertion error after 5 turn advances with debug state', () => {
      // Create game in initial debug state
      const state = makeInitialState()

      // Set suppression for  all factions in customState
      // We test here that this will decay correctly after few decays of 10%.
      const customState = {
        ...state,
        factions: state.factions.map((faction) => ({
          ...faction,
          suppression: toF6(0.001), // 0.1%
        })),
      }

      store.dispatch(reset({ customState }))

      // Advance turn 5 times to trigger the assertion failure
      // The assertion failure occurs in f6mult -> toF6 -> assertMax6Dec
      // when precision loss would occur (more than 6 decimal places)
      // KJA most likely will crap out on precision loss
      for (let idx = 0; idx < 10; idx += 1) {
        console.log(`Advancing turn ${idx + 1}`)
        store.dispatch(advanceTurn())
      }
    })
  })
})
