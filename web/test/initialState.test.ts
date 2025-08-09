import { describe, test, expect } from 'vitest'
import { makeInitialState } from '../src/ruleset/initialState'

describe(makeInitialState, () => {
  test('debug initial state passes agent invariant validation', () => {
    // Should not throw
    const state = makeInitialState({ debug: true })

    expect(state.agents.length).toBeGreaterThan(0)
  })
})
