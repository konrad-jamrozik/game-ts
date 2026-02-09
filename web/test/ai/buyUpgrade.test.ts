import { describe, expect, test, beforeEach } from 'vitest'
import { ActionCreators } from 'redux-undo'
import { getStore } from '../../src/redux/store'
import { reset } from '../../src/redux/slices/gameStateSlice'
import { st } from '../fixtures/stateFixture'

describe('buyUpgrade', () => {
  beforeEach(() => {
    // KJA should this be in setupAITests.ts?
    const store = getStore()
    store.dispatch(ActionCreators.clearHistory())
    store.dispatch(reset())
  })

  test('human buyUpgrade atomically increments aiState.actual*', () => {
    st.arrangeGameState({ money: 100_000 })

    // Act
    st.api.buyUpgrade('Transport cap')

    // extraReducers should have incremented actual* in the same dispatch
    expect(st.aiState.actualTransportCapUpgrades).toBe(1)
  })

  test('undo after purchase reverts both gameState and aiState.actual*', () => {
    st.arrangeGameState({ agents: st.bldAgents({ count: 5 }), money: 100_000 })
    st.arrangeAiState({})

    const moneyBefore = st.gameState.money

    // Act
    st.api.buyUpgrade('Transport cap')

    expect(st.gameState.money).toBeLessThan(moneyBefore)
    expect(st.aiState.actualTransportCapUpgrades).toBe(1)

    st.undo()

    expect(st.gameState.money).toBe(moneyBefore)
    expect(st.aiState.actualTransportCapUpgrades).toBe(0)
  })
})
