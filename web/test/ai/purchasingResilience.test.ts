import { describe, expect, test, beforeEach } from 'vitest'
import { ActionCreators } from 'redux-undo'
import { getStore } from '../../src/redux/store'
import { reset } from '../../src/redux/slices/gameStateSlice'
import { getPlayTurnApi } from '../../src/redux/playTurnApi'
import { getPlayerActionsApi } from '../../src/redux/playerActionsApi'
import { spendMoney } from '../../src/ai/intellects/basic/purchasing'
import { st } from '../fixtures/stateFixture'
import { assertAboveZero, assertEqual } from '../../src/lib/primitives/assertPrimitives'
import { AGENT_HIRE_COST } from '../../src/lib/data_tables/constants'

describe('Purchasing Resilience', () => {
  beforeEach(() => {
    const store = getStore()
    store.dispatch(ActionCreators.clearHistory())
    store.dispatch(reset())
  })

  describe('buyUpgrade atomicity via extraReducers', () => {
    test('human buyUpgrade atomically increments aiState.actual*', () => {
      st.arrangeGameState({ money: 100_000 })
      const store = getStore()
      const playerApi = getPlayerActionsApi(store.dispatch)

      // Act
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

      // Act
      api.buyUpgrade('Transport cap')

      expect(st.gameState.money).toBeLessThan(moneyBefore)
      expect(st.aiState.actualTransportCapUpgrades).toBe(1)

      store.dispatch(ActionCreators.undo())

      expect(st.gameState.money).toBe(moneyBefore)
      expect(st.aiState.actualTransportCapUpgrades).toBe(0)
    })

    test('redoing spendMoney after undo leads to the same purchase count', () => {
      st.arrangeGameState({ agents: st.bldAgents({ count: 0 }), money: AGENT_HIRE_COST * 8 })
      st.arrangeAiState({})

      const moneyBefore = st.gameState.money
      const store = getStore()
      const api = getPlayTurnApi(store)
      assertEqual(st.gameState.money, moneyBefore)

      // Act 1/2
      const purchaseCount1 = spendMoney(api)

      expect(st.gameState.money).toBeLessThan(moneyBefore)

      // Undo all purchases
      for (let i = 0; i < purchaseCount1; i += 1) {
        assertAboveZero(store.getState().undoable.past.length)
        store.dispatch(ActionCreators.undo())
      }

      expect(st.gameState.money).toBe(moneyBefore)
      api.updateCachedGameState()

      // Act 2/2
      const purchaseCount2 = spendMoney(api)

      expect(purchaseCount2).toBe(purchaseCount1)
    })
  })
})
