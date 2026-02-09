import { describe, expect, test, beforeEach } from 'vitest'
import { ActionCreators } from 'redux-undo'
import { getStore } from '../../src/redux/store'
import { reset } from '../../src/redux/slices/gameStateSlice'
import { getPlayTurnApi } from '../../src/redux/playTurnApi'
import { spendMoney } from '../../src/ai/intellects/basic/purchasing'
import { st } from '../fixtures/stateFixture'

describe(spendMoney, () => {
  beforeEach(() => {
    const store = getStore()
    store.dispatch(ActionCreators.clearHistory())
    store.dispatch(reset())
  })

  /**
   * Algorithm trace for 1,000 money (expected results)
   *
   * Starting from default initial state (4 agents, agentCap=20, transportCap=6, trainingCap=0, all upgrades=0),
   * with money overridden to 1,000:
   *
   * - minSavings = agents x AGENT_UPKEEP_COST(10) x REQUIRED_TURNS_OF_SAVINGS(5)
   * - targetAgentCount = min(8 + 4 x 0, 1000) = 8
   *
   * | Round | Priority     | Cost | Money after | minSavings     | Affordable?        | State after              |
   * | ----- | ------------ | ---- | ----------- | -------------- | ------------------ | ------------------------ |
   * | 1     | newAgent     | 50   | 950         | 200 (4 agents) | Yes                | agents=5, money=950      |
   * | 2     | newAgent     | 50   | 900         | 250            | Yes                | agents=6, money=900      |
   * | 3     | newAgent     | 50   | 850         | 300            | Yes                | agents=7, money=850      |
   * | 4     | newAgent     | 50   | 800         | 350            | Yes                | agents=8, money=800      |
   * | 5     | Training cap | 200  | 600         | 400 (8 agents) | Yes                | trainingCap=4, money=600 |
   * | 6     | Hit points   | 500  | 100         | 400            | **No** (100 < 400) | STOP                     |
   *
   * Expected final state:
   * - money: 600
   * - agents: 8 (4 hired from initial 4)
   * - Training cap upgrades: 1
   * - All other cap upgrades: 0
   * - All stat upgrades: 0
   * - Total spent: 400 (4 x 50 + 1 x 200)
   */
  test('Correctly spends 1_000 money in initial game state', () => {
    // Arrange
    st.arrangeGameState({ money: 1000 })
    const store = getStore()
    const api = getPlayTurnApi(store)

    // Act
    spendMoney(api)

    // Assert - agents
    expect(st.gameState.agents).toHaveLength(8) // 4 initial + 4 hired

    // Assert - cap upgrades
    expect(st.aiState.actualTrainingCapUpgrades).toBe(1)
    expect(st.aiState.actualAgentCapUpgrades).toBe(0)
    expect(st.aiState.actualTransportCapUpgrades).toBe(0)

    // Assert - stat upgrades
    expect(st.aiState.actualWeaponDamageUpgrades).toBe(0)
    expect(st.aiState.actualTrainingSkillGainUpgrades).toBe(0)
    expect(st.aiState.actualExhaustionRecoveryUpgrades).toBe(0)
    expect(st.aiState.actualHitPointsRecoveryUpgrades).toBe(0)
    expect(st.aiState.actualHitPointsUpgrades).toBe(0)

    // Assert - money
    expect(st.gameState.money).toBe(600)
  })
})

// KJA curr work - add more tests for spendMoney, like
// - "if way too many agents, do not purchase them for some time, just stat upgrades"
// - "if way too little agents just purchase agents"
// - "purchase correct amount of things given 10_000 money"

// KJA curr work: review/fix tests in purchasingResilience.test.ts and humanInterference.test.ts
