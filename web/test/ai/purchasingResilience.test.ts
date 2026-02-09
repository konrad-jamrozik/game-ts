import { describe, expect, test, beforeEach } from 'vitest'
import { ActionCreators } from 'redux-undo'
import { getStore } from '../../src/redux/store'
import { reset } from '../../src/redux/slices/gameStateSlice'
import { getPlayTurnApi } from '../../src/redux/playTurnApi'
import { getPlayerActionsApi } from '../../src/redux/playerActionsApi'
import { spendMoney } from '../../src/ai/intellects/basic/purchasing'
import { st } from '../fixtures/stateFixture'
import { assertAboveZero } from '../../src/lib/primitives/assertPrimitives'

describe('Purchasing Resilience', () => {
  beforeEach(() => {
    // KJA should this be in setupAITests.ts?
    const store = getStore()
    store.dispatch(ActionCreators.clearHistory())
    store.dispatch(reset())
  })

  describe('buyUpgrade atomicity via extraReducers', () => {
    test('human buyUpgrade atomically increments aiState.actual*', () => {
      st.arrangeGameState({ money: 100_000 })
      const store = getStore()
      const playerApi = getPlayerActionsApi(store.dispatch)
      playerApi.buyUpgrade(st.gameState, 'Transport cap')

      // extraReducers should have incremented actual* in the same dispatch
      expect(st.aiState.actualTransportCapUpgrades).toBe(1)
    })
  })

  describe('undo consistency between gameState and aiState', () => {
    test('undo after purchase reverts both gameState and aiState.actual*', () => {
      st.arrangeGameState({ agents: st.bldAgents({ count: 5 }), money: 100_000 })
      st.arrangeAiState({})
      const moneyBefore = st.gameState.money
      const store = getStore()
      const api = getPlayTurnApi(store)
      api.buyUpgrade('Transport cap')
      expect(st.gameState.money).toBeLessThan(moneyBefore)
      expect(st.aiState.actualTransportCapUpgrades).toBe(1)

      store.dispatch(ActionCreators.undo())

      expect(st.gameState.money).toBe(moneyBefore)
      expect(st.aiState.actualTransportCapUpgrades).toBe(0)
    })

    // KJA the assertion doesn't reflect this, need to assert that 2nd result of spendMoney is the same as first.
    // Then move it to spendMoney test.
    test('redoing spendMoney after undo leads to the same result', () => {
      st.arrangeGameState({ agents: st.bldAgents({ count: 5 }), money: 100_000 })
      st.arrangeAiState({})
      const store = getStore()
      const api = getPlayTurnApi(store)
      expect(st.gameState.money).toBe(100_000)

      // Act
      spendMoney(api)

      expect(st.gameState.money).toBeLessThan(100_000)
      assertAboveZero(store.getState().undoable.past.length)
      store.dispatch(ActionCreators.undo())
      expect(st.gameState.money).toBe(100_000)

      // AI should be able to purchase again
      const api2 = getPlayTurnApi(store)
      spendMoney(api2)
      expect(st.gameState.money).toBeLessThan(100_000)
    })
  })
})
