import { describe, expect, test, beforeEach } from 'vitest'
import { ActionCreators } from 'redux-undo'
import { getStore } from '../../src/redux/store'
import { reset } from '../../src/redux/slices/gameStateSlice'
import { clearEvents } from '../../src/redux/slices/eventsSlice'
import { getPlayTurnApi } from '../../src/redux/playTurnApi'
import { createInitialAiState } from '../../src/redux/slices/aiStateSlice'
import { findNextDesiredUpgrade, areAllDesiredCountsMet, computeNextBuyPriority, spendMoney } from '../../src/ai/intellects/basic/purchasing'
import { st } from '../fixtures/stateFixture'
import { bldInitialState } from '../../src/lib/factories/gameStateFactory'
import type { GameState } from '../../src/lib/model/gameStateModel'

describe('Purchasing Resilience', () => {
  beforeEach(() => {
    const store = getStore()
    store.dispatch(ActionCreators.clearHistory())
    store.dispatch(reset())
    store.dispatch(clearEvents())
  })

  describe('findNextDesiredUpgrade', () => {
    test('returns upgrade name when exactly one desired > actual', () => {
      const aiState = {
        ...createInitialAiState(),
        desiredTransportCapUpgrades: 1,
        actualTransportCapUpgrades: 0,
      }

      const result = findNextDesiredUpgrade(aiState)

      expect(result).toBe('Transport cap')
    })

    test('returns undefined when all desired === actual', () => {
      const aiState = {
        ...createInitialAiState(),
        desiredAgentCapUpgrades: 0,
        actualAgentCapUpgrades: 0,
        desiredTransportCapUpgrades: 0,
        actualTransportCapUpgrades: 0,
        desiredTrainingCapUpgrades: 0,
        actualTrainingCapUpgrades: 0,
        desiredWeaponDamageUpgrades: 0,
        actualWeaponDamageUpgrades: 0,
        desiredTrainingSkillGainUpgrades: 0,
        actualTrainingSkillGainUpgrades: 0,
        desiredExhaustionRecoveryUpgrades: 0,
        actualExhaustionRecoveryUpgrades: 0,
        desiredHitPointsRecoveryUpgrades: 0,
        actualHitPointsRecoveryUpgrades: 0,
        desiredHitPointsUpgrades: 0,
        actualHitPointsUpgrades: 0,
      }

      const result = findNextDesiredUpgrade(aiState)

      expect(result).toBeUndefined()
    })

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

    test('returns undefined when only desiredAgentCount > actual (not an upgrade)', () => {
      const aiState = {
        ...createInitialAiState(),
        desiredAgentCount: 5,
        // All upgrades have desired === actual
        desiredAgentCapUpgrades: 0,
        actualAgentCapUpgrades: 0,
        desiredTransportCapUpgrades: 0,
        actualTransportCapUpgrades: 0,
        desiredTrainingCapUpgrades: 0,
        actualTrainingCapUpgrades: 0,
        desiredWeaponDamageUpgrades: 0,
        actualWeaponDamageUpgrades: 0,
        desiredTrainingSkillGainUpgrades: 0,
        actualTrainingSkillGainUpgrades: 0,
        desiredExhaustionRecoveryUpgrades: 0,
        actualExhaustionRecoveryUpgrades: 0,
        desiredHitPointsRecoveryUpgrades: 0,
        actualHitPointsRecoveryUpgrades: 0,
        desiredHitPointsUpgrades: 0,
        actualHitPointsUpgrades: 0,
      }

      const result = findNextDesiredUpgrade(aiState)

      expect(result).toBeUndefined()
    })
  })

  describe('areAllDesiredCountsMet', () => {
    test('returns true when agents.length >= desiredAgentCount and all upgrade desired === actual', () => {
      const gameState: GameState = {
        ...bldInitialState(),
        agents: st.bldAgents({ count: 5 }),
      }
      const aiState = {
        ...createInitialAiState(),
        desiredAgentCount: 5,
        desiredAgentCapUpgrades: 0,
        actualAgentCapUpgrades: 0,
        desiredTransportCapUpgrades: 0,
        actualTransportCapUpgrades: 0,
        desiredTrainingCapUpgrades: 0,
        actualTrainingCapUpgrades: 0,
        desiredWeaponDamageUpgrades: 0,
        actualWeaponDamageUpgrades: 0,
        desiredTrainingSkillGainUpgrades: 0,
        actualTrainingSkillGainUpgrades: 0,
        desiredExhaustionRecoveryUpgrades: 0,
        actualExhaustionRecoveryUpgrades: 0,
        desiredHitPointsRecoveryUpgrades: 0,
        actualHitPointsRecoveryUpgrades: 0,
        desiredHitPointsUpgrades: 0,
        actualHitPointsUpgrades: 0,
      }

      const result = areAllDesiredCountsMet(gameState, aiState)

      expect(result).toBe(true)
    })

    test('returns false when agents.length < desiredAgentCount', () => {
      const gameState: GameState = {
        ...bldInitialState(),
        agents: st.bldAgents({ count: 3 }),
      }
      const aiState = {
        ...createInitialAiState(),
        desiredAgentCount: 5,
      }

      const result = areAllDesiredCountsMet(gameState, aiState)

      expect(result).toBe(false)
    })

    test('returns false when any upgrade desired > actual', () => {
      const gameState: GameState = {
        ...bldInitialState(),
        agents: st.bldAgents({ count: 5 }),
      }
      const aiState = {
        ...createInitialAiState(),
        desiredAgentCount: 5,
        desiredTransportCapUpgrades: 1,
        actualTransportCapUpgrades: 0,
      }

      const result = areAllDesiredCountsMet(gameState, aiState)

      expect(result).toBe(false)
    })
  })

  describe('computeNextBuyPriority - after human interference', () => {
    test('when human hires agent satisfying agent count goal, re-establishes new goal', () => {
      st.arrangeGameState({ agents: st.bldAgents({ count: 5 }), money: 100_000 })
      st.arrangeAiState({ desiredAgentCount: 5 /* already met */ })

      const store = getStore()
      const api = getPlayTurnApi(store)

      // Should not crash, should return an upgrade priority
      const priority = computeNextBuyPriority(api)

      expect(priority).toBeDefined()
      expect(priority).not.toBe('newAgent')
      // Should have established new goals
      expect(st.aiState.desiredAgentCount).toBeGreaterThanOrEqual(5)
    })

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

    test('does not crash when desired > actual by more than 1', () => {
      st.arrangeGameState({ agents: st.bldAgents({ count: 5 }), money: 100_000 })
      st.arrangeAiState({
        desiredAgentCount: 5,
        desiredTransportCapUpgrades: 3,
        actualTransportCapUpgrades: 0, // Gap > 1
      })

      const store = getStore()
      const api = getPlayTurnApi(store)

      // Should not crash
      const priority = computeNextBuyPriority(api)

      expect(priority).toBeDefined()
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
