import { describe, expect, test, beforeEach } from 'vitest'
import { ActionCreators } from 'redux-undo'
import { getStore } from '../../src/redux/store'
import { reset } from '../../src/redux/slices/gameStateSlice'
import { getPlayTurnApi } from '../../src/redux/playTurnApi'
import {
  spendMoney,
  computeMinimumRequiredSavings,
  computeNextBuyPriority,
} from '../../src/ai/intellects/basic/purchasing'
import { st } from '../fixtures/stateFixture'
import { assertAboveZero, assertEqual } from '../../src/lib/primitives/assertPrimitives'
import { AGENT_HIRE_COST } from '../../src/lib/data_tables/constants'
import { getUpgradePrice } from '../../src/lib/data_tables/upgrades'

describe(spendMoney, () => {
  beforeEach(() => {
    const store = getStore()
    store.dispatch(ActionCreators.clearHistory())
    store.dispatch(reset())
  })

  /**
   * Algorithm trace for 5,000 money (expected results)
   *
   * Starting from default initial state (4 agents, agentCap=20, transportCap=6, trainingCap=0, all upgrades=0),
   * with money overridden to 5,000.
   */
  test('Correctly spends 5000 money in initial game state', () => {
    // Arrange
    st.arrangeGameState({ money: 5000 })
    const store = getStore()
    const api = getPlayTurnApi(store)

    // Act
    spendMoney(api)

    // Assert - agents
    expect(st.gameState.agents).toHaveLength(24) // 4 initial + 20 hired

    // Assert - cap upgrades
    expect(st.aiState.actualTrainingCapUpgrades).toBe(2)
    expect(st.aiState.actualAgentCapUpgrades).toBe(1)
    expect(st.aiState.actualTransportCapUpgrades).toBe(0)

    // Assert - stat upgrades
    expect(st.aiState.actualHitPointsUpgrades).toBe(1)
    expect(st.aiState.actualWeaponDamageUpgrades).toBe(1)
    expect(st.aiState.actualTrainingSkillGainUpgrades).toBe(1)
    expect(st.aiState.actualExhaustionRecoveryUpgrades).toBe(1)
    expect(st.aiState.actualHitPointsRecoveryUpgrades).toBe(0)

    // Assert - money
    expect(st.gameState.money).toBe(1400)

    // Assert - minimum required savings
    expect(computeMinimumRequiredSavings(api)).toBe(1200) // 24 agents * 10 upkeep * 5 turns = 1200

    // Assert - next buy priority price
    // After purchases: 24 agents, 4 stat upgrades total
    // maxDesiredAgents = 8 + 4*4 = 24, so no more agents needed
    // transportCap = 6, required = 24*0.25 = 6, so transport cap is sufficient
    // trainingCap = 8, required = 24*0.3 = 7.2, so training cap is sufficient
    // Next priority is stat upgrade: 4 % 5 = 4, which is 'Hit points recovery %' = 500
    const nextPriority = computeNextBuyPriority(api)
    assertEqual(nextPriority, 'Hit points recovery %')
    expect(getUpgradePrice(nextPriority)).toBe(500)
  })

  test('redoing spendMoney after undo leads to the same purchase count', () => {
    st.arrangeGameState({ agents: st.bldAgents({ count: 0 }), money: AGENT_HIRE_COST * 8 })
    st.arrangeAiState({})

    const moneyBefore = st.gameState.money
    assertEqual(st.gameState.money, moneyBefore)

    // Act 1/2
    const purchaseCount1 = spendMoney(st.api)

    expect(st.gameState.money).toBeLessThan(moneyBefore)

    // Undo all purchases
    for (let i = 0; i < purchaseCount1; i += 1) {
      assertAboveZero(st.pastLength)
      st.undo()
    }

    expect(st.gameState.money).toBe(moneyBefore)
    st.api.updateCachedGameState()

    // Act 2/2
    const purchaseCount2 = spendMoney(st.api)

    expect(purchaseCount2).toBe(purchaseCount1)
  })
})

// KJA curr work - add more tests for spendMoney, like
// - "if way too many agents, do not purchase them for some time, just stat upgrades"
// - "if way too little agents just purchase agents"
// - "purchase correct amount of things given 10_000 money"
