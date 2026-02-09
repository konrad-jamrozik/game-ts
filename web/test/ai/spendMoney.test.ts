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
import { assertEqual } from '../../src/lib/primitives/assertPrimitives'
import { AGENT_HIRE_COST } from '../../src/lib/data_tables/constants'
import { getUpgradePrice } from '../../src/lib/data_tables/upgrades'

describe(spendMoney, () => {
  beforeEach(() => {
    const store = getStore()
    store.dispatch(ActionCreators.clearHistory())
    store.dispatch(reset())
  })

  test('Correctly spends 10_000 money in initial game state', () => {
    // Arrange
    st.arrangeGameState({ money: 10_000 })
    const store = getStore()
    const api = getPlayTurnApi(store)

    // Act
    spendMoney(api)

    // Assert - agents
    expect(st.gameState.agents).toHaveLength(36) // 4 initial + 32 hired

    // Assert - cap upgrades
    expect(st.aiState.actualTrainingCapUpgrades).toBe(3)
    expect(st.aiState.actualAgentCapUpgrades).toBe(4)
    expect(st.aiState.actualTransportCapUpgrades).toBe(1)

    // Assert - stat upgrades
    expect(st.aiState.actualHitPointsUpgrades).toBe(2)
    expect(st.aiState.actualWeaponDamageUpgrades).toBe(2)
    expect(st.aiState.actualTrainingSkillGainUpgrades).toBe(1)
    expect(st.aiState.actualExhaustionRecoveryUpgrades).toBe(1)
    expect(st.aiState.actualHitPointsRecoveryUpgrades).toBe(1)

    // Assert - money
    expect(st.gameState.money).toBe(2500)

    // Assert - minimum required savings
    expect(computeMinimumRequiredSavings(api)).toBe(1800) // 36 agents * 10 upkeep * 5 turns = 1800

    // Assert - next buy priority price
    // After purchases: 36 agents, 7 stat upgrades total (2+2+1+1+1)
    // maxDesiredAgents = min(8 + 4*7, 1000) = 36, so aliveAgents (36) is NOT < maxDesiredAgents (36), so no more agents needed
    // transportCap = 6 + 1*2 = 8, required = 36*0.25 = 9, so transportCap (8) < required (9), so next priority is 'Transport cap' = 1000
    const nextPriority = computeNextBuyPriority(api)
    assertEqual(nextPriority, 'Transport cap')
    expect(getUpgradePrice(nextPriority)).toBe(1000)
  })

  test('redoing spendMoney after undo leads to the same purchase count', () => {
    st.arrangeGameState({ agents: st.bldAgents({ count: 0 }), money: AGENT_HIRE_COST * 8 })

    const moneyBefore = st.gameState.money
    assertEqual(st.gameState.money, moneyBefore)

    // Act 1/2
    const purchaseCount1 = spendMoney(st.api)

    expect(st.gameState.money).toBeLessThan(moneyBefore)

    // Undo all purchases
    st.undo(purchaseCount1)

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
