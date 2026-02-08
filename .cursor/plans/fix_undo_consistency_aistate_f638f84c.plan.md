---
name: Fix undo consistency aiState
overview: Eliminate undo inconsistency between gameState and aiState by making aiStateSlice react to the buyUpgrade action via extraReducers (atomic actual* updates), restructuring the purchase loop so desired count updates are captured in undo snapshots, and ensuring api.aiState stays fresh after purchases.
todos:
  - id: extra-reducers
    content: Add extraReducers to aiStateSlice that listens for buyUpgrade and increments the corresponding actual* counter atomically
    status: pending
  - id: remove-increment-actual
    content: Remove all incrementActual* reducers/actions from aiStateSlice, PlayTurnAPI type, and playTurnApi.ts
    status: pending
  - id: refresh-aistate
    content: Add updateAiState() call to PlayTurnAPI.buyUpgrade() in playTurnApi.ts after updateGameState()
    status: pending
  - id: simplify-purchasing
    content: Remove all api.incrementActual*() calls from purchasing.ts executePurchase
    status: pending
  - id: refactor-find-upgrade
    content: Refactor findNextDesiredUpgrade to handle gaps > 1 and multiple matches (pick first, warn); remove getAndAssertExactlyOneDesiredStateIsOneAboveActual
    status: pending
  - id: add-ensure-goal
    content: Add ensureDesiredGoalExists(api) helper that calls decideSomeDesiredCount in a bounded loop until an actionable buy goal exists
    status: pending
  - id: restructure-desired
    content: Restructure computeNextBuyPriority to call ensureDesiredGoalExists when no goal found; move decideSomeDesiredCount from buy() into ensureDesiredGoalExists
    status: pending
  - id: run-qcheck
    content: Run qcheck to verify correctness
    status: pending
isProject: false
---

# Fix Undo Consistency Between gameState and aiState

This plan subsumes and replaces [fix_ai_desires_resilience](fix_ai_desires_resilience_d4c90c26.plan.md).

## Problem

Within `executePurchase` in [purchasing.ts](web/src/ai/intellects/basic/purchasing.ts), two sequential dispatches create an inconsistent undo snapshot:

1. `api.buyUpgrade(priority)` -- dispatches `buyUpgrade` (player action, creates undo snapshot). `gameState` updated.
2. `api.incrementActualWeaponDamageUpgrades()` -- dispatches a plain reducer (no snapshot). `aiState.actual*` updated.

The undo snapshot from step 1 captures `gameState` with the upgrade applied but `aiState.actual*` at the old value. Additionally, the AI's purchasing logic breaks when:

- **Human action fulfills AI's goal**: The strict `desired === actual + 1` invariant breaks.
- **Undo restores mid-purchase snapshot**: `gameState` shows the upgrade but `aiState.actual*` hasn't caught up.

## Solution: Four complementary changes

### Change A: Make actual* updates atomic with buyUpgrade via extraReducers

In [aiStateSlice.ts](web/src/redux/slices/aiStateSlice.ts):

- Import `buyUpgrade` from `./gameStateSlice`
- Add `extraReducers` block that increments the corresponding `actual*` counter for all 8 upgrade types
- Remove all 8 `incrementActual*` reducers and their action exports

```typescript
import { buyUpgrade } from './gameStateSlice'

extraReducers: (builder) => {
  builder.addCase(buyUpgrade, (state, action) => {
    const upgradeName = action.payload
    switch (upgradeName) {
      case 'Agent cap':            state.actualAgentCapUpgrades += 1; break
      case 'Transport cap':        state.actualTransportCapUpgrades += 1; break
      // ... all 8 types
    }
  })
},
```

No circular dependency: `gameStateSlice` does not import from `aiStateSlice`.

### Change B: Make updateGameState() always refresh both api.gameState and api.aiState

**This is a critical step the original plan was missing.** In [playTurnApi.ts](web/src/redux/playTurnApi.ts), `updateGameState()` should always also refresh `api.aiState`:

```typescript
function updateGameState(): void {
  api.gameState = getCurrentTurnStateFromStore(store)
  api.aiState = getCurrentAiState(store)
}
```

Both live inside `undoable.present`, so this is just a reference lookup -- essentially free. This ensures that after **any** dispatch (not just `buyUpgrade`), both cached references are fresh. No need to sprinkle individual `updateAiState()` calls at specific action sites.

**Why this is critical**: With `extraReducers`, dispatching `buyUpgrade` atomically updates both `gameState` and `aiState` in the store. But `api.aiState` is a cached snapshot. Without refreshing it, `computeNextBuyPriority(api)` after a purchase would see stale `actual*` values, causing `findNextDesiredUpgrade` to return the same upgrade repeatedly -- infinite double-purchases.

Also in this file:

- Remove all 8 `incrementActual*()` method implementations
- Remove the corresponding imports from `aiStateSlice`
- The standalone `updateAiState()` function can be removed (it's now folded into `updateGameState()`)

### Change C: Replace assertion with soft lookup (findNextDesiredUpgrade)

In [purchasing.ts](web/src/ai/intellects/basic/purchasing.ts), refactor `findNextDesiredUpgrade`:

- Accept any `desired > actual` gap (not just `=== actual + 1`)
- When multiple found, pick the first and log a warning (instead of current behavior of returning `undefined`)
- When none found, return `undefined`
- Remove `getAndAssertExactlyOneDesiredStateIsOneAboveActual` entirely

### Change D: Establish desired counts BEFORE purchases

Restructure so desired count establishment happens in `computeNextBuyPriority` (before the next `buy` call):

- Add `ensureDesiredGoalExists(api)` that calls `decideSomeDesiredCount` in a bounded loop (~50 max) until an actionable goal exists
- Update `computeNextBuyPriority` to call `ensureDesiredGoalExists` when `findNextDesiredUpgrade` returns `undefined`
- Remove `decideSomeDesiredCount` from `buy()` -- it now lives in `ensureDesiredGoalExists`
- Simplify `buy()` to only call `executePurchase` + logging

New flow:

```
spendMoney:
  priority = computeNextBuyPriority()     // establishes desired if needed via ensureDesiredGoalExists
  while hasMoney:
    executePurchase(priority)             // buyUpgrade SNAPSHOT  <- desired already current
                                          //                      <- actual* updated atomically via extraReducers
                                          //                      <- api.aiState refreshed via updateAiState()
    priority = computeNextBuyPriority()   // if all goals met -> ensureDesiredGoalExists -> new priority
```

## File changes

### 1. [aiStateSlice.ts](web/src/redux/slices/aiStateSlice.ts)

- Import `buyUpgrade` from `./gameStateSlice`
- Add `extraReducers` block handling all 8 upgrade types
- Remove all 8 `incrementActual*` reducers and exports
- Keep all `actual*` fields in `BasicIntellectState`, all `desired*` reducers, `loadState`, `reset`

### 2. [playTurnApi.ts](web/src/redux/playTurnApi.ts)

- **Make `updateGameState()` also refresh `api.aiState**` -- both references always stay in sync after any dispatch
- Remove the standalone `updateAiState()` function (folded into `updateGameState()`)
- Remove all 8 `incrementActual*()` method implementations
- Remove the corresponding imports from `aiStateSlice`

### 3. [playTurnApiTypes.ts](web/src/lib/model_utils/playTurnApiTypes.ts)

- Remove all 8 `incrementActual*()` methods from the `PlayTurnAPI` type

### 4. [purchasing.ts](web/src/ai/intellects/basic/purchasing.ts)

- Remove all `api.incrementActual*()` calls from `executePurchase` (lines 244-269)
- Refactor `findNextDesiredUpgrade`: always return first found when multiple `desired > actual`, log warning
- Remove `getAndAssertExactlyOneDesiredStateIsOneAboveActual` entirely
- Add `ensureDesiredGoalExists(api)` with bounded loop
- Update `computeNextBuyPriority` to call `ensureDesiredGoalExists` when no goal found
- Move `decideSomeDesiredCount` out of `buy()` into `ensureDesiredGoalExists`
- Simplify `buy()` to only `executePurchase` + logging

## Acceptance criteria

The implementation is considered complete only when **all** tests in these two files pass:

- [web/test/ai/humanInterference.test.ts](web/test/ai/humanInterference.test.ts) (6 tests)
- [web/test/ai/purchasingResilience.test.ts](web/test/ai/purchasingResilience.test.ts) (9 tests)

These tests cover atomic actual* updates, undo consistency, human interference resilience, post-undo recovery, and the full ensureDesiredGoalExists loop. If any test fails, the implementation must be adjusted until all pass.

## Consistency guarantee

After all four changes, every undo snapshot is fully consistent:

- **Actuals**: Updated in the same dispatch as `buyUpgrade` via `extraReducers` -- always in sync with `gameState`
- **api.aiState**: Refreshed after every dispatch via `updateGameState()` which always syncs both -- the purchasing loop always sees current state
- **Desired counts**: Updated in `computeNextBuyPriority` BEFORE the next `buyUpgrade` dispatch -- captured in the next undo snapshot
- **Human interference**: Human purchases auto-increment `actual*` via `extraReducers`; the AI recognizes externally-fulfilled goals via `ensureDesiredGoalExists`
