import { describe, expect, test, beforeEach } from 'vitest'
import { ActionCreators } from 'redux-undo'
import { getStore } from '../../src/redux/store'
import { reset } from '../../src/redux/slices/gameStateSlice'
import { clearEvents } from '../../src/redux/slices/eventsSlice'
import { delegateTurnsToAIPlayer } from '../../src/ai/delegateTurnsToAIPlayer'
import { getPlayerActionsApi } from '../../src/redux/playerActionsApi'
import { getPlayTurnApi } from '../../src/redux/playTurnApi'
import { spendMoney } from '../../src/ai/intellects/basic/purchasing'
import { isGameWon } from '../../src/lib/game_utils/gameStateChecks'
import { getCurrentTurnStateFromStore } from '../../src/redux/storeUtils'
import { st } from '../fixtures/stateFixture'
import { setupCheatingGameState } from '../utils/aiTestSetup'
import { rand } from '../../src/lib/primitives/rand'

describe('AI resilience to human actions', () => {
  beforeEach(() => {
    const store = getStore()
    store.dispatch(ActionCreators.clearHistory())
    store.dispatch(reset())
    store.dispatch(clearEvents())
    rand.reset()
  })

  test('AI continues after human hires agents mid-game', () => {
    st.arrangeGameState({ money: 100_000 })

    // Run AI 5 turns
    delegateTurnsToAIPlayer('basic', 5)

    const agentCountAfterAI = st.gameState.agents.length

    // Human hires agents
    const store = getStore()
    const playerApi = getPlayerActionsApi(store.dispatch)
    const gameStateBeforeHuman = getCurrentTurnStateFromStore(store)
    playerApi.hireAgent(gameStateBeforeHuman)
    playerApi.hireAgent(getCurrentTurnStateFromStore(store))

    const agentCountAfterHuman = st.gameState.agents.length
    expect(agentCountAfterHuman).toBe(agentCountAfterAI + 2)

    // AI runs 5 more turns
    delegateTurnsToAIPlayer('basic', 5)

    // Should not crash, game should still be running
    const finalState = getCurrentTurnStateFromStore(store)
    expect(finalState.agents.length).toBeGreaterThanOrEqual(agentCountAfterHuman)
  })

  test('AI adapts when human hires enough agents to satisfy all AI agent goals', () => {
    st.arrangeGameState({ money: 100_000 })

    // Run AI 3 turns to establish goals
    delegateTurnsToAIPlayer('basic', 3)

    const desiredAgentCount = st.aiState.desiredAgentCount
    const currentAgentCount = st.gameState.agents.length

    // Human hires enough agents to meet desiredAgentCount
    const store = getStore()
    const playerApi = getPlayerActionsApi(store.dispatch)
    const agentsToHire = desiredAgentCount - currentAgentCount

    for (let i = 0; i < agentsToHire; i += 1) {
      const gameState = getCurrentTurnStateFromStore(store)
      playerApi.hireAgent(gameState)
    }

    expect(st.gameState.agents.length).toBeGreaterThanOrEqual(desiredAgentCount)

    // AI runs 5 more turns
    delegateTurnsToAIPlayer('basic', 5)

    // Should have established new upgrade goals
    const hasUpgradeGoal =
      st.aiState.desiredAgentCapUpgrades > st.aiState.actualAgentCapUpgrades ||
      st.aiState.desiredTransportCapUpgrades > st.aiState.actualTransportCapUpgrades ||
      st.aiState.desiredTrainingCapUpgrades > st.aiState.actualTrainingCapUpgrades ||
      st.aiState.desiredWeaponDamageUpgrades > st.aiState.actualWeaponDamageUpgrades ||
      st.aiState.desiredTrainingSkillGainUpgrades > st.aiState.actualTrainingSkillGainUpgrades ||
      st.aiState.desiredExhaustionRecoveryUpgrades > st.aiState.actualExhaustionRecoveryUpgrades ||
      st.aiState.desiredHitPointsRecoveryUpgrades > st.aiState.actualHitPointsRecoveryUpgrades ||
      st.aiState.desiredHitPointsUpgrades > st.aiState.actualHitPointsUpgrades

    expect(hasUpgradeGoal).toBe(true)
  })

  test('AI recognizes human-purchased upgrades and does not double-purchase', () => {
    st.arrangeGameState({ money: 100_000 })

    // Run AI 3 turns to establish goals
    delegateTurnsToAIPlayer('basic', 3)

    const initialTransportCapDesired = st.aiState.desiredTransportCapUpgrades
    const initialTransportCapActual = st.aiState.actualTransportCapUpgrades

    // Human buys upgrade
    const store = getStore()
    const playerApi = getPlayerActionsApi(store.dispatch)
    const gameState = getCurrentTurnStateFromStore(store)
    playerApi.buyUpgrade(gameState, 'Transport cap')

    // Verify aiState.actual* incremented atomically
    expect(st.aiState.actualTransportCapUpgrades).toBe(initialTransportCapActual + 1)

    // AI runs 5 more turns
    delegateTurnsToAIPlayer('basic', 5)

    // Should not have purchased Transport cap again (unless desired was increased)
    // The actual should be at least what human bought
    expect(st.aiState.actualTransportCapUpgrades).toBeGreaterThanOrEqual(initialTransportCapActual + 1)
    // If desired wasn't increased, actual should equal desired; otherwise actual should be <= desired
    const desiredUnchanged = st.aiState.desiredTransportCapUpgrades === initialTransportCapDesired
    const actualEqualsDesired = st.aiState.actualTransportCapUpgrades === st.aiState.desiredTransportCapUpgrades
    expect(desiredUnchanged ? actualEqualsDesired : true).toBe(true)
  })

  test('AI recovers from simulated post-undo state (all desired === actual)', () => {
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

    // AI runs 5 turns
    delegateTurnsToAIPlayer('basic', 5)

    // Should not crash, should have established new goals
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

  test('AI recovers from simulated post-undo state (desired > actual + 1)', () => {
    st.arrangeGameState({ agents: st.bldAgents({ count: 5 }), money: 100_000 })
    st.arrangeAiState({
      desiredAgentCount: 5,
      desiredTransportCapUpgrades: 3,
      actualTransportCapUpgrades: 0, // Gap > 1
    })

    const store = getStore()
    const api = getPlayTurnApi(store)

    // Should not crash
    spendMoney(api)

    // Should handle the gap and purchase Transport cap
    // After purchase, actual should be incremented
    expect(st.aiState.actualTransportCapUpgrades).toBeGreaterThanOrEqual(1)
  })

  test('AI wins game after human interference in early game', () => {
    setupCheatingGameState()

    // Run AI 3 turns
    delegateTurnsToAIPlayer('basic', 3)

    // Human hires 2 agents
    const store = getStore()
    const playerApi = getPlayerActionsApi(store.dispatch)
    const gameState1 = getCurrentTurnStateFromStore(store)
    playerApi.hireAgent(gameState1)
    const gameState2 = getCurrentTurnStateFromStore(store)
    playerApi.hireAgent(gameState2)

    // AI runs remaining 247 turns
    delegateTurnsToAIPlayer('basic', 247)

    // Verify game won
    const finalState = getCurrentTurnStateFromStore(store)
    expect(isGameWon(finalState)).toBe(true)
  })
})
