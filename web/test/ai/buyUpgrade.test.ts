import { describe, expect, test } from 'vitest'
import { st } from '../fixtures/stateFixture'

describe('buyUpgrade', () => {
  test('human buyUpgrade atomically increments aiState.actual*', () => {
    st.arrangeGameState({ money: 100_000 })

    // Act
    st.api.buyUpgrade('Transport cap')

    // extraReducers should have incremented actual* in the same dispatch
    expect(st.aiState.actualTransportCapUpgrades).toBe(1)
  })

  test('undo after purchase reverts both gameState and aiState.actual*', () => {
    st.arrangeGameState({ agents: st.bldAgents({ count: 5 }), money: 100_000 })

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
