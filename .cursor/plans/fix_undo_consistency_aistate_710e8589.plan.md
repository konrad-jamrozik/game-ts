---
name: Fix undo consistency aiState
overview: Eliminate undo inconsistency between gameState and aiState by making aiStateSlice react to the buyUpgrade action via extraReducers (atomic actual* updates), and restructuring the purchase loop so desired count updates are captured in undo snapshots.
todos:
  - id: extra-reducers
    content: Add extraReducers to aiStateSlice that listens for buyUpgrade and increments the corresponding actual* counter atomically
    status: pending
  - id: remove-increment-actual
    content: Remove all incrementActual* reducers/actions from aiStateSlice, PlayTurnAPI type, and playTurnApi.ts
    status: pending
  - id: simplify-purchasing
    content: Remove all api.incrementActual*() calls from purchasing.ts executePurchase
    status: pending
  - id: restructure-desired
    content: Move decideSomeDesiredCount from buy() into computeNextBuyPriority() so desired counts are established before purchases
    status: pending
  - id: update-test-plan
    content: Update the AI behavior test suite plan to reflect the changes
    status: pending
  - id: run-qcheck
    content: Run qcheck to verify correctness
    status: pending
isProject: false
---

# Fix Undo Consistency Between gameState and aiState

## Problem

Within `executePurchase` in [purchasing.ts](web/src/ai/intellects/basic/purchasing.ts), two sequential dispatches create an inconsistent undo snapshot:

1. `api.buyUpgrade(priority)` -- dispatches `buyUpgrade` which has `asPlayerAction` (creates undo snapshot). `gameState` updated.
2. `api.incrementActualWeaponDamageUpgrades()` -- dispatches a plain reducer (no snapshot). `aiState.actual*` updated.

The undo snapshot from step 1 captures `gameState` with the upgrade applied but `aiState.actual*` at the old value. Similarly, `incrementDesired*` dispatches (in `decideSomeDesiredCount`) happen after `buyUpgrade`, so desired counts can also be stale in the snapshot.

## Solution: Two complementary changes

### Change A: Derive actual upgrade counts from gameState

Remove all 8 `actual*` fields from `BasicIntellectState`. Instead, compute them on-the-fly from `gameState` values. Each upgrade modifies a specific `gameState` field with a known increment from a known initial value, making the count derivable:

| Upgrade               | gameState field        | Initial value       | Increment   | Formula                  |
| --------------------- | ---------------------- | ------------------- | ----------- | ------------------------ |
| Agent cap             | `agentCap`             | `AGENT_CAP` (20)    | 4           | `(agentCap - 20) / 4`    |
| Transport cap         | `transportCap`         | `TRANSPORT_CAP` (6) | 2           | `(transportCap - 6) / 2` |
| Training cap          | `trainingCap`          | `TRAINING_CAP` (0)  | 4           | `trainingCap / 4`        |
| Weapon damage         | `weaponDamage`         | 10                  | 1           | `weaponDamage - 10`      |
| Hit points            | `agentMaxHitPoints`    | 30                  | 1           | `agentMaxHitPoints - 30` |
| Training skill gain   | `trainingSkillGain`    | `toF6(1)`           | `toF6(0.1)` | Fixed6 integer math      |
| Exhaustion recovery % | `exhaustionRecovery`   | `toF6(5)`           | `toF6(0.5)` | Fixed6 integer math      |
| Hit points recovery % | `hitPointsRecoveryPct` | `toF6(2)`           | `toF6(0.2)` | Fixed6 integer math      |

Since these fields are only modified by the `buyUpgrade` reducer, the derivation is always exact.

### Change B: Establish desired counts BEFORE purchases, not after

Currently `decideSomeDesiredCount` is called inside `buy()` AFTER `executePurchase` dispatches `buyUpgrade` (which creates the undo snapshot). This means the desired count update is NOT captured in that snapshot.

Restructure so `decideSomeDesiredCount` is called from `computeNextBuyPriority` (BEFORE the next `buy` call). This way, by the time `buyUpgrade` creates a snapshot, the desired count is already updated in `aiState`.

Current flow:

```
spendMoney:
  priority = computeNextBuyPriority()
  while hasMoney:
    buy(priority)
      executePurchase(priority)    // buyUpgrade SNAPSHOT ← desired stale
      incrementActual*()           // no snapshot ← actual stale
      if allMet: decideSomeDesiredCount()  // no snapshot
    priority = computeNextBuyPriority()
```

New flow:

```
spendMoney:
  priority = computeNextBuyPriority()  // establishes desired if needed
  while hasMoney:
    executePurchase(priority)           // buyUpgrade SNAPSHOT ← desired already current, actuals derived
    priority = computeNextBuyPriority() // if all goals met → decideSomeDesiredCount → then return priority
```

This is naturally aligned with Plan 2's resilience refactoring (`ensureDesiredGoalExists` inside `computeNextBuyPriority`).

## File changes

### 1. Extract initial values to constants

In [web/src/lib/data_tables/constants.ts](web/src/lib/data_tables/constants.ts), add:

```typescript
export const INITIAL_WEAPON_DAMAGE = 10
export const INITIAL_AGENT_MAX_HIT_POINTS = 30
```

Update [gameStateFactory.ts](web/src/lib/factories/gameStateFactory.ts) to use `INITIAL_WEAPON_DAMAGE` and `INITIAL_AGENT_MAX_HIT_POINTS` instead of hardcoded `30` and `initialWeapon.damage`.

### 2. Add derivation function

Create [web/src/lib/model_utils/upgradeCountUtils.ts](web/src/lib/model_utils/upgradeCountUtils.ts) with:

```typescript
export type ActualUpgradeCounts = {
  agentCapUpgrades: number
  transportCapUpgrades: number
  trainingCapUpgrades: number
  weaponDamageUpgrades: number
  trainingSkillGainUpgrades: number
  exhaustionRecoveryUpgrades: number
  hitPointsRecoveryUpgrades: number
  hitPointsUpgrades: number
}

export function deriveActualUpgradeCounts(gameState: GameState): ActualUpgradeCounts { ... }
```

This lives in `lib/model_utils/` which can depend on `lib/data_tables/` (for increments and initial constants) and `lib/model/` (for `GameState`). Dependency rules are satisfied.

### 3. Slim down `BasicIntellectState`

In [web/src/redux/slices/aiStateSlice.ts](web/src/redux/slices/aiStateSlice.ts):

- Remove all 8 `actual*` fields from `BasicIntellectState` (type goes from 17 fields to 9)
- Remove all 8 `incrementActual*` reducers
- Remove all 8 `incrementActual*` action exports

### 4. Remove `incrementActual*` from PlayTurnAPI

In [web/src/lib/model_utils/playTurnApiTypes.ts](web/src/lib/model_utils/playTurnApiTypes.ts):

- Remove all 8 `incrementActual*()` methods from the `PlayTurnAPI` type

In [web/src/redux/playTurnApi.ts](web/src/redux/playTurnApi.ts):

- Remove all 8 `incrementActual*()` method implementations
- Remove the corresponding imports from `aiStateSlice`

### 5. Restructure purchasing.ts

In [web/src/ai/intellects/basic/purchasing.ts](web/src/ai/intellects/basic/purchasing.ts):

- Remove all `api.incrementActual*()` calls from `executePurchase` (the whole switch block, lines 180-205)
- Import and use `deriveActualUpgradeCounts` wherever `aiState.actual*` was read
- Move `decideSomeDesiredCount` call from `buy()` into `computeNextBuyPriority()` (this aligns with plan 2's `ensureDesiredGoalExists`)
- Simplify `buy()` to only call `executePurchase` + logging
- Update `getAndAssertExactlyOneDesiredStateIsOneAboveActual` / `findNextDesiredUpgrade` to take both `gameState` and `aiState`, using derived actuals
- Update `areAllDesiredCountsMet` similarly
- Update `decideSomeDesiredCount` and `decideStatUpgrade` to use derived actuals for the `sumStatUpgrades` calculations

### 6. Update `agentFactory.ts` / `weaponFactory.ts`

In [web/src/lib/factories/agentFactory.ts](web/src/lib/factories/agentFactory.ts), use `INITIAL_AGENT_MAX_HIT_POINTS` constant for `hitPoints` and `maxHitPoints` instead of hardcoded `30`.

In [web/src/lib/factories/gameStateFactory.ts](web/src/lib/factories/gameStateFactory.ts), use `INITIAL_WEAPON_DAMAGE` (via `initialWeapon.damage` already works, but `agentMaxHitPoints: 30` should use the constant).

## Impact on test plan

The test plan ([ai_behavior_test_suite](/.cursor/plans/ai_behavior_test_suite_deb0784b.plan.md)) simplifies:

- R3 (`loadState` reducer for aiState) still needed but only for desired counts -- no actual counts to set up
- `deriveActualUpgradeCounts` is a new pure function that can be directly tested
- `findNextDesiredUpgrade` takes `(gameState, aiState)` instead of just `(aiState)`
- No need to arrange `actual*` values in tests -- just set up `gameState` with the right upgrade values
- Undo consistency tests become much simpler: any undo snapshot is automatically consistent for actuals

## Impact on plan 2 (AI desires resilience)

This change naturally aligns with plan 2. The `ensureDesiredGoalExists` pattern from plan 2 fits directly into `computeNextBuyPriority` (Change B above). The two plans should be implemented together for cleanest results.

## Consistency guarantee

After both changes:

- **Actuals**: Derived from `gameState` -- always consistent by construction since they're never stored separately
- **Desired counts**: Updated BEFORE the next `buyUpgrade` dispatch, so they're captured in the next undo snapshot. Edge case (undo to snapshot before very first desired update) is handled by plan 2's resilience (re-establishes goals when all desired === actual)
