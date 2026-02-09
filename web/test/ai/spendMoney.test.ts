import { describe, expect, test, beforeEach } from 'vitest'
import { ActionCreators } from 'redux-undo'
import { getStore } from '../../src/redux/store'
import { reset } from '../../src/redux/slices/gameStateSlice'
import { clearEvents } from '../../src/redux/slices/eventsSlice'
import { getPlayTurnApi } from '../../src/redux/playTurnApi'
import { spendMoney } from '../../src/ai/intellects/basic/purchasing'
import { st } from '../fixtures/stateFixture'

describe('spendMoney - vNext purchasing', () => {
  beforeEach(() => {
    const store = getStore()
    store.dispatch(ActionCreators.clearHistory())
    store.dispatch(reset())
    store.dispatch(clearEvents())
  })

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
