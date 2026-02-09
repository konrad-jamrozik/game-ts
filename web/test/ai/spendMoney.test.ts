import { describe, expect, test } from 'vitest'
import { getStore } from '../../src/redux/store'
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

  test('Correctly spends money buying only agents when there are too few agents', () => {
    // Arrange: Start with 0 agents, 1 stat upgrade (so maxDesiredAgents = 8 + 4*1 = 12)
    // Have enough money to buy 10 agents (up to maxDesiredAgents)
    st.arrangeGameState({
      agents: st.bldAgents({ count: 0 }),
      agentCap: 20, // High enough to allow 12 agents
      money: 1000, // Enough for 10 agents + savings requirements
      aiState: {
        actualHitPointsUpgrades: 1, // 1 stat upgrade so maxDesiredAgents = 12
      },
    })
    const store = getStore()
    const api = getPlayTurnApi(store)

    // Act
    spendMoney(api)

    // Assert - should have bought exactly 10 agents (up to maxDesiredAgents)
    expect(st.gameState.agents).toHaveLength(10)
    // Assert - no cap upgrades should have been purchased
    expect(st.aiState.actualTrainingCapUpgrades).toBe(0)
    expect(st.aiState.actualAgentCapUpgrades).toBe(0)
    expect(st.aiState.actualTransportCapUpgrades).toBe(0)
    // Assert - no additional stat upgrades should have been purchased
    expect(st.aiState.actualHitPointsUpgrades).toBe(1) // Still 1, no new purchases
  })

  test('Correctly spends money buying only stat upgrades when agents and caps are adequate', () => {
    // Arrange: Start with many agents (50), adequate caps, adequate money, no stat upgrades
    // transportCap = 6 + 13*2 = 32, required = 50*0.25 = 12.5, so adequate (32 >= 12.5)
    // trainingCap = 0 + 4*4 = 16, required = 50*0.3 = 15, so adequate (16 >= 15)
    // maxDesiredAgents = 8 + 4*0 = 8, so 50 agents is way more than enough
    // With 0 stat upgrades, round-robin will select: 0%5=0 (Hit points), 1%5=1 (Weapon damage), 2%5=2 (Training skill gain), 3%5=3 (Exhaustion recovery), 4%5=4 (Hit points recovery), 5%5=0 (Hit points)
    st.arrangeGameState({
      agents: st.bldAgents({ count: 50 }),
      agentCap: 60,
      transportCap: 32, // 6 + 13*2 = 32, adequate for 50 agents (need 12.5)
      trainingCap: 16, // 0 + 4*4 = 16, adequate for 50 agents (need 15)
      money: 5500, // Enough for 6 stat upgrades (6 * 500 = 3000) + savings (50 agents * 10 * 5 = 2500)
      aiState: {
        // Cap upgrades already purchased to reach adequate caps
        actualTransportCapUpgrades: 13, // 6 + 13*2 = 32
        actualTrainingCapUpgrades: 4, // 0 + 4*4 = 16
        // No stat upgrades initially
        actualHitPointsUpgrades: 0,
        actualWeaponDamageUpgrades: 0,
        actualTrainingSkillGainUpgrades: 0,
        actualExhaustionRecoveryUpgrades: 0,
        actualHitPointsRecoveryUpgrades: 0,
      },
    })
    const store = getStore()
    const api = getPlayTurnApi(store)

    // Act
    spendMoney(api)

    // Assert - should have bought exactly 6 stat upgrades
    const totalStatUpgrades =
      st.aiState.actualHitPointsUpgrades +
      st.aiState.actualWeaponDamageUpgrades +
      st.aiState.actualTrainingSkillGainUpgrades +
      st.aiState.actualExhaustionRecoveryUpgrades +
      st.aiState.actualHitPointsRecoveryUpgrades

    expect(totalStatUpgrades).toBe(6)
    // Assert - round-robin order:
    // - Hit points (0),
    // - Weapon damage (1),
    // - Training skill gain (2),
    // - Exhaustion recovery (3),
    // - Hit points recovery (4),
    // - Hit points (5)
    expect(st.aiState.actualHitPointsUpgrades).toBe(2) // First (index 0) and last (index 5)
    expect(st.aiState.actualWeaponDamageUpgrades).toBe(1) // Index 1
    expect(st.aiState.actualTrainingSkillGainUpgrades).toBe(1) // Index 2
    expect(st.aiState.actualExhaustionRecoveryUpgrades).toBe(1) // Index 3
    expect(st.aiState.actualHitPointsRecoveryUpgrades).toBe(1) // Index 4
    // Assert - no agents should have been purchased
    expect(st.gameState.agents).toHaveLength(50)
    // Assert - no additional cap upgrades should have been purchased
    expect(st.aiState.actualTrainingCapUpgrades).toBe(4) // Still 4, no new purchases
    expect(st.aiState.actualAgentCapUpgrades).toBe(0)
    expect(st.aiState.actualTransportCapUpgrades).toBe(13) // Still 13, no new purchases
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
