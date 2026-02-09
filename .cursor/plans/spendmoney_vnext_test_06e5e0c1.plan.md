---
name: spendMoney vNext test
overview: Create `web/test/ai/spendMoney.test.ts` with a test that verifies the vNext purchasing algorithm correctly spends 1,000 money in the initial game state, asserting agent count, cap upgrades, and stat upgrades.
todos:
  - id: create-test
    content: Create `web/test/ai/spendMoney.test.ts` with the vNext test case
    status: completed
  - id: verify
    content: Run `qcheck` to verify the test file is correct
    status: completed
isProject: false
---

# Create spendMoney vNext test suite

## Context

The vNext purchasing algorithm (documented in [docs/ai/about_basic_intellect_purchasing.md](docs/ai/about_basic_intellect_purchasing.md)) describes a simplified `computeNextBuyPriority()` that directly decides purchases based on actual state, without the legacy desired/actual tracking pattern. The test verifies the expected outcome of calling `spendMoney()` with 1,000 money.

## Note: Test documents expected vNext behavior

This test is written to document the expected behavior of the vNext purchasing algorithm as specified in the documentation. The test will fail until the vNext implementation is completed in production code. The test serves as a specification for the vNext algorithm behavior:

- The vNext algorithm directly decides purchases based on actual state (not desired/actual tracking)
- It uses `AGENT_HIRING_PURCHASED_UPGRADES_MULTIPLIER` of `4` (current code uses `3`)
- Priority order: agents → transport cap → training cap → stat upgrades

## Algorithm trace for 1,000 money (expected results)

Starting from default initial state (4 agents, agentCap=20, transportCap=6, trainingCap=0, all upgrades=0), with money overridden to 1,000:

- **minSavings** = agents x AGENT_UPKEEP_COST(10) x REQUIRED_TURNS_OF_SAVINGS(5)
- **targetAgentCount** = min(8 + 4 x 0, 1000) = 8

| Round | Priority     | Cost | Money after | minSavings     | Affordable?        | State after              |
| ----- | ------------ | ---- | ----------- | -------------- | ------------------ | ------------------------ |
| 1     | newAgent     | 50   | 950         | 200 (4 agents) | Yes                | agents=5, money=950      |
| 2     | newAgent     | 50   | 900         | 250            | Yes                | agents=6, money=900      |
| 3     | newAgent     | 50   | 850         | 300            | Yes                | agents=7, money=850      |
| 4     | newAgent     | 50   | 800         | 350            | Yes                | agents=8, money=800      |
| 5     | Training cap | 200  | 600         | 400 (8 agents) | Yes                | trainingCap=4, money=600 |
| 6     | Hit points   | 500  | 100         | 400            | **No** (100 < 400) | STOP                     |

**Expected final state:**

- **money**: 600
- **agents**: 8 (4 hired from initial 4)
- **Training cap upgrades**: 1
- **All other cap upgrades**: 0
- **All stat upgrades**: 0
- **Total spent**: 400 (4 x 50 + 1 x 200)

## Test file

Create [web/test/ai/spendMoney.test.ts](web/test/ai/spendMoney.test.ts), following the patterns from [web/test/ai/purchasingResilience.test.ts](web/test/ai/purchasingResilience.test.ts).

### Structure

```typescript
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
    st.arrangeGameState({ money: 1_000 })
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
```

### Key assertions explained

- **8 agents**: The vNext algorithm hires agents first until alive count reaches `AGENT_COUNT_BASE`(8), since `sumStatUpgrades=0` means `targetAgentCount = 8 + 4*0 = 8`
- **1 training cap upgrade**: After 8 agents, `trainingCap(0) < ceil(0.3 * 8) = 3`, so training cap is purchased (0 -> 4 slots)
- **0 stat upgrades**: After the training cap purchase, `money=600` but `Hit points` costs 500, and `600 - 500 = 100 < minSavings(400)`, so the loop stops
- **money=600**: Total spent = 4 x 50 (agents) + 200 (training cap) = 400
