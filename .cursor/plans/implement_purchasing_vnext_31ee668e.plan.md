---
name: Implement Purchasing vNext
overview: Replace the legacy "desired/actual" purchasing system with the vNext algorithm that directly computes buy priority from current game state, eliminating all `desired*` fields and the goal-establishment machinery.
todos:
  - id: rewrite-purchasing
    content: "Rewrite purchasing.ts: remove 6 legacy functions, rewrite spendMoney/computeNextBuyPriority, rename decideStatUpgrade->chooseStatUpgrade, add hasSufficientMoney/computeTotalStatUpgradesPurchased, adapt helpers"
    status: pending
  - id: update-constants
    content: "Update constants.ts: change AGENT_HIRING_PURCHASED_UPGRADES_MULTIPLIER to 4, remove MAX_DESIRED_TRANSPORT_CAP/MAX_DESIRED_TRAINING_CAP, update comments"
    status: pending
  - id: strip-aistate-desired
    content: "Strip desired* fields from aiStateSlice.ts: remove DesiredCountName, desired* fields, incrementDesired* reducers/exports, simplify createInitialAiState"
    status: pending
  - id: update-playturn-api
    content: "Update PlayTurnAPI type and implementation: remove increaseDesiredCount from type and playTurnApi.ts"
    status: pending
  - id: update-spec-docs
    content: "Update docs/ai/about_basic_intellect.md and about_basic_intellect_purchasing.md: remove undefined check from spendMoney pseudocode, clarify computeNextBuyPriority always returns a value"
    status: pending
  - id: verify-qcheck
    content: Run qcheck to verify compilation and linting (tests expected to fail)
    status: pending
isProject: false
---

# Implement Purchasing vNext

## Context

The legacy purchasing system maintains parallel `desired*` and `actual*` fields in `BasicIntellectState`, using a "desired goal" establishment loop (`ensureDesiredGoalExists` -> `decideSomeDesiredCount`) to decide what to buy. The vNext replaces this with a direct algorithm that computes the next buy priority purely from actual game/AI state counts.

## Key design decision

The `actual*` fields on `BasicIntellectState` are **kept** because the vNext algorithm needs the total count of purchased stat upgrades for its agent-hiring formula and round-robin stat selection. All `desired*` fields are **removed** since vNext computes priorities on-the-fly.

## Changes by file

### 1. [web/src/ai/intellects/basic/purchasing.ts](web/src/ai/intellects/basic/purchasing.ts)

**Functions to REMOVE** (6 functions):

- `findNextDesiredUpgrade()` -- no more desired vs actual comparison
- `ensureDesiredGoalExists()` -- no more goal establishment loop
- `decideSomeDesiredCount()` -- no more desired count incrementing
- `decideDesiredAgentCount()` -- logic absorbed into new `computeNextBuyPriority()`
- `areAllDesiredCountsMet()` -- no longer needed (currently unused externally)
- `getIncreaseMessage()` -- was about desired count change logging

**Functions to REWRITE** (2 functions):

- `spendMoney()` -- new loop structure with separate `hasSufficientMoney()` guard:

```typescript
export function spendMoney(api: PlayTurnAPI): void {
  while (hasSufficientMoney(api)) {
    const priority = computeNextBuyPriority(api)
    if (hasSufficientMoneyToBuy(api, priority)) {
      buy(api, priority)
    } else {
      break
    }
  }
  logFailedPurchase(api, computeNextBuyPriority(api))
}
```

- `computeNextBuyPriority()` -- entirely new algorithm. Always returns a defined `BuyPriority` (never `undefined`) because the branches are exhaustive: the final fallback is `chooseStatUpgrade()` which always has at least "Hit points" and "Training skill gain" available (both uncapped):

```typescript
export function computeNextBuyPriority(api: PlayTurnAPI): BuyPriority {
  const { gameState, aiState } = api
  const totalStatUpgrades = computeTotalStatUpgradesPurchased(aiState)
  const aliveAgents = gameState.agents.length
  const maxDesiredAgents = Math.min(
    AGENT_COUNT_BASE + AGENT_HIRING_PURCHASED_UPGRADES_MULTIPLIER * totalStatUpgrades,
    MAX_DESIRED_AGENT_COUNT,
  )
  if (aliveAgents < maxDesiredAgents) {
    return aliveAgents < gameState.agentCap ? 'newAgent' : 'Agent cap'
  }
  if (gameState.transportCap < aliveAgents * TRANSPORT_CAP_RATIO) {
    return 'Transport cap'
  }
  if (gameState.trainingCap < aliveAgents * TRAINING_CAP_RATIO) {
    return 'Training cap'
  }
  return chooseStatUpgrade(api)
}
```

**Functions to RENAME** (1 function):

- `decideStatUpgrade()` -> `chooseStatUpgrade()` -- same round-robin logic but returns `UpgradeName` directly instead of calling `api.increaseDesiredCount()`. No longer takes `gameState` param (uses `api`). The `getAvailableStatUpgrades()` helper is adapted to return `UpgradeName[]` instead of `StatUpgradeType[]`.

**Functions to ADAPT** (3 functions):

- `hasSufficientMoneyToBuy()` -- signature stays the same (takes `BuyPriority`)
- `logBuyResult()` -- simplify: remove `stateBeforeIncrease` parameter, simplify log message
- `logFailedPurchase()` -- signature stays the same (takes `BuyPriority`)

**Functions to KEEP as-is** (3 functions):

- `buy()`
- `executePurchase()`
- `computeMinimumRequiredSavings()`

**Functions/types to ADD** (2):

- `hasSufficientMoney(api)` -- new: checks `currentMoney >= minimumRequiredSavings` (loop guard)
- `computeTotalStatUpgradesPurchased(aiState)` -- sums `actual*` stat upgrade fields

**Types to REMOVE**:

- `StatUpgradeType` -- replaced by using `UpgradeName` directly in `getAvailableStatUpgrades()`

### 2. [web/src/ai/intellects/basic/constants.ts](web/src/ai/intellects/basic/constants.ts)

- Change `AGENT_HIRING_PURCHASED_UPGRADES_MULTIPLIER` from `3` to `4`
- Remove `MAX_DESIRED_TRANSPORT_CAP` (not in vNext spec)
- Remove `MAX_DESIRED_TRAINING_CAP` (not in vNext spec)
- Update comment on line 22 from "decideSomeDesiredCount" to "computeNextBuyPriority"

### 3. [web/src/redux/slices/aiStateSlice.ts](web/src/redux/slices/aiStateSlice.ts)

- Remove `DesiredCountName` type entirely
- Remove all 9 `desired*` fields from `BasicIntellectState` (keep all 8 `actual*` fields)
- Remove all 9 `incrementDesired*` reducers from the slice
- Remove all 9 `incrementDesired*` exports
- Simplify `createInitialAiState()` to only have `actual*` fields (all zero)

### 4. [web/src/lib/model_utils/playTurnApiTypes.ts](web/src/lib/model_utils/playTurnApiTypes.ts)

- Remove `increaseDesiredCount(name: DesiredCountName): void` from `PlayTurnAPI` type
- Remove import of `DesiredCountName` and `BasicIntellectState` if no longer needed (keep `BasicIntellectState` import since `aiState` field remains)

### 5. [web/src/redux/playTurnApi.ts](web/src/redux/playTurnApi.ts)

- Remove the entire `increaseDesiredCount` method implementation (lines 104-135)
- Remove all `incrementDesired*` and `DesiredCountName` imports from `aiStateSlice`

### 6. [web/src/ai/intellects/basic/types.ts](web/src/ai/intellects/basic/types.ts)

- No changes needed. `BuyPriority = UpgradeName | 'newAgent'` remains correct.

### 7. Documentation updates

**[docs/ai/about_basic_intellect.md](docs/ai/about_basic_intellect.md)** (lines 83-91, `spendMoney` pseudocode):

- Remove the `priority is not undefined` check from the `if` condition, since `computeNextBuyPriority()` always returns a defined value
- Change `if (priority is not undefined and hasSufficientMoneyToBuy(priority))` to just `if (hasSufficientMoneyToBuy(priority))`

**[docs/ai/about_basic_intellect_purchasing.md](docs/ai/about_basic_intellect_purchasing.md)**:

- Add a note that `computeNextBuyPriority()` always returns a defined `BuyPriority` because the branches are exhaustive (the final fallback `chooseStatUpgrade()` always has at least "Hit points" and "Training skill gain" available, both of which are uncapped)

## Test files that will break (NOT to be fixed in this plan)

These files reference `desired*` fields, `findNextDesiredUpgrade`, or `computeNextBuyPriority` with the old signature and will need updating in a separate plan:

- `web/test/ai/purchasingResilience.test.ts`
- `web/test/ai/humanInterference.test.ts`
- `web/test/fixtures/stateFixture.ts`

## Verification

Run `qcheck` after all changes to verify TypeScript compilation and linting pass (tests are expected to fail and will be fixed separately).
