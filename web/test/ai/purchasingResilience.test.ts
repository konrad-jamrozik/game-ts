import { describe, expect, test, beforeEach } from 'vitest'
import { ActionCreators } from 'redux-undo'
import { getStore } from '../../src/redux/store'
import { reset } from '../../src/redux/slices/gameStateSlice'
import { clearEvents } from '../../src/redux/slices/eventsSlice'
import { getPlayTurnApi } from '../../src/redux/playTurnApi'
import { getPlayerActionsApi } from '../../src/redux/playerActionsApi'
import { createInitialAiState } from '../../src/redux/slices/aiStateSlice'
import { findNextDesiredUpgrade, computeNextBuyPriority, spendMoney } from '../../src/ai/intellects/basic/purchasing'
import { st } from '../fixtures/stateFixture'

describe('Purchasing Resilience', () => {
  beforeEach(() => {
    const store = getStore()
    store.dispatch(ActionCreators.clearHistory())
    store.dispatch(reset())
    store.dispatch(clearEvents())
  })

  describe(findNextDesiredUpgrade, () => {
    test('handles desired > actual + 1 (gap > 1) without throwing', () => {
      const aiState = {
        ...createInitialAiState(),
        desiredTransportCapUpgrades: 3,
        actualTransportCapUpgrades: 0,
      }

      // Should not throw, should return the upgrade (even if gap > 1)
      const result = findNextDesiredUpgrade(aiState)

      expect(result).toBe('Transport cap')
    })

    test('when multiple desired > actual, returns first and does not throw', () => {
      const aiState = {
        ...createInitialAiState(),
        desiredTransportCapUpgrades: 1,
        actualTransportCapUpgrades: 0,
        desiredTrainingCapUpgrades: 1,
        actualTrainingCapUpgrades: 0,
      }

      // Should not throw, should return one of them
      const result = findNextDesiredUpgrade(aiState)

      expect(result).toBeDefined()
      expect(['Transport cap', 'Training cap']).toContain(result)
    })
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

    test('human buyUpgrade satisfying AI goal makes findNextDesiredUpgrade return undefined', () => {
      st.arrangeGameState({ money: 100_000 })
      st.arrangeAiState({ desiredTransportCapUpgrades: 1, actualTransportCapUpgrades: 0 })
      const store = getStore()
      const playerApi = getPlayerActionsApi(store.dispatch)
      playerApi.buyUpgrade(st.gameState, 'Transport cap')

      expect(findNextDesiredUpgrade(st.aiState)).toBeUndefined()
    })
  })

  describe('undo consistency between gameState and aiState', () => {
    test('undo after purchase reverts both gameState and aiState.actual*', () => {
      st.arrangeGameState({ agents: st.bldAgents({ count: 5 }), money: 100_000 })
      st.arrangeAiState({ desiredAgentCount: 5, desiredTransportCapUpgrades: 1, actualTransportCapUpgrades: 0 })
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

    test('spendMoney works after undo reverts all AI purchases', () => {
      st.arrangeGameState({ agents: st.bldAgents({ count: 5 }), money: 100_000 })
      st.arrangeAiState({ desiredAgentCount: 5 })
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

  describe('computeNextBuyPriority - after human interference', () => {
    test('when human fulfills all current goals, re-establishes via ensureDesiredGoalExists loop', () => {
      st.arrangeGameState({ agents: st.bldAgents({ count: 5 }), money: 100_000 })
      st.arrangeAiState({
        desiredAgentCount: 5,
        actualAgentCapUpgrades: 0,
        desiredAgentCapUpgrades: 0,
        actualTransportCapUpgrades: 0,
        desiredTransportCapUpgrades: 0,
        actualTrainingCapUpgrades: 0,
        desiredTrainingCapUpgrades: 0,
        actualWeaponDamageUpgrades: 0,
        desiredWeaponDamageUpgrades: 0,
        actualTrainingSkillGainUpgrades: 0,
        desiredTrainingSkillGainUpgrades: 0,
        actualExhaustionRecoveryUpgrades: 0,
        desiredExhaustionRecoveryUpgrades: 0,
        actualHitPointsRecoveryUpgrades: 0,
        desiredHitPointsRecoveryUpgrades: 0,
        actualHitPointsUpgrades: 0,
        desiredHitPointsUpgrades: 0,
      })

      const store = getStore()
      const api = getPlayTurnApi(store)

      // Should not crash, should establish new goals
      const priority = computeNextBuyPriority(api)

      expect(priority).toBeDefined()
      // Should have established at least one new desired count
      const hasNewGoal =
        st.aiState.desiredAgentCount > 5 ||
        st.aiState.desiredAgentCapUpgrades > 0 ||
        st.aiState.desiredTransportCapUpgrades > 0 ||
        st.aiState.desiredTrainingCapUpgrades > 0 ||
        st.aiState.desiredWeaponDamageUpgrades > 0 ||
        st.aiState.desiredTrainingSkillGainUpgrades > 0 ||
        st.aiState.desiredExhaustionRecoveryUpgrades > 0 ||
        st.aiState.desiredHitPointsRecoveryUpgrades > 0 ||
        st.aiState.desiredHitPointsUpgrades > 0
      expect(hasNewGoal).toBe(true)
    })
  })

  describe('spendMoney - full purchasing loop after human interference', () => {
    test('purchases normally when starting from state where human already met agent goal', () => {
      st.arrangeGameState({ agents: st.bldAgents({ count: 5 }), money: 100_000 })
      st.arrangeAiState({ desiredAgentCount: 5 /* already met */ })

      const store = getStore()
      const api = getPlayTurnApi(store)

      // Should not crash
      spendMoney(api)

      // Should have purchased something or established new goals
      const moneyAfter = st.gameState.money
      expect(moneyAfter).toBeLessThan(100_000)
    })

    test('establishes new goals and purchases when all desired counts met externally', () => {
      st.arrangeGameState({ agents: st.bldAgents({ count: 5 }), money: 100_000 })
      st.arrangeAiState({
        desiredAgentCount: 5,
        actualAgentCapUpgrades: 0,
        desiredAgentCapUpgrades: 0,
        actualTransportCapUpgrades: 0,
        desiredTransportCapUpgrades: 0,
        actualTrainingCapUpgrades: 0,
        desiredTrainingCapUpgrades: 0,
        actualWeaponDamageUpgrades: 0,
        desiredWeaponDamageUpgrades: 0,
        actualTrainingSkillGainUpgrades: 0,
        desiredTrainingSkillGainUpgrades: 0,
        actualExhaustionRecoveryUpgrades: 0,
        desiredExhaustionRecoveryUpgrades: 0,
        actualHitPointsRecoveryUpgrades: 0,
        desiredHitPointsRecoveryUpgrades: 0,
        actualHitPointsUpgrades: 0,
        desiredHitPointsUpgrades: 0,
      })

      const store = getStore()
      const api = getPlayTurnApi(store)

      // Should not crash
      spendMoney(api)

      // Should have established new desired counts
      const hasNewGoal =
        st.aiState.desiredAgentCount > 5 ||
        st.aiState.desiredAgentCapUpgrades > 0 ||
        st.aiState.desiredTransportCapUpgrades > 0 ||
        st.aiState.desiredTrainingCapUpgrades > 0 ||
        st.aiState.desiredWeaponDamageUpgrades > 0 ||
        st.aiState.desiredTrainingSkillGainUpgrades > 0 ||
        st.aiState.desiredExhaustionRecoveryUpgrades > 0 ||
        st.aiState.desiredHitPointsRecoveryUpgrades > 0 ||
        st.aiState.desiredHitPointsUpgrades > 0
      expect(hasNewGoal).toBe(true)
    })
  })
})
