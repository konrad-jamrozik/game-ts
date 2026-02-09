import { describe, expect, test, beforeEach } from 'vitest'
import { ActionCreators } from 'redux-undo'
import { getStore } from '../../src/redux/store'
import { reset } from '../../src/redux/slices/gameStateSlice'
import { clearEvents } from '../../src/redux/slices/eventsSlice'
import { getPlayTurnApi } from '../../src/redux/playTurnApi'
import { getPlayerActionsApi } from '../../src/redux/playerActionsApi'
import { spendMoney } from '../../src/ai/intellects/basic/purchasing'
import { st } from '../fixtures/stateFixture'

describe('Purchasing Resilience', () => {
  beforeEach(() => {
    const store = getStore()
    store.dispatch(ActionCreators.clearHistory())
    store.dispatch(reset())
    store.dispatch(clearEvents())
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
      // KJA here this should assert failure with "no undo possible, state missing"
      // because test setup in setupAITests.ts set it to 0
      store.dispatch(ActionCreators.undo())
      expect(st.gameState.money).toBe(moneyBefore)
      expect(st.aiState.actualTransportCapUpgrades).toBe(0)
    })

    test('spendMoney works after undo reverts all AI purchases', () => {
      st.arrangeGameState({ agents: st.bldAgents({ count: 5 }), money: 100_000 })
      st.arrangeAiState({})
      const store = getStore()
      const api = getPlayTurnApi(store)
      spendMoney(api)
      expect(st.gameState.money).toBeLessThan(100_000)
      // Undo all purchases
      while (store.getState().undoable.past.length > 0) {
        store.dispatch(ActionCreators.undo())
      }
      expect(st.gameState.money).toBe(100_000)
      // AI should be able to purchase again
      const api2 = getPlayTurnApi(store)
      spendMoney(api2)
      expect(st.gameState.money).toBeLessThan(100_000)
    })
  })
})
