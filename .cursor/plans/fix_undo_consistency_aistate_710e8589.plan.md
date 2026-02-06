---
name: Fix undo consistency aiState
overview: Eliminate undo inconsistency between gameState and aiState by making aiStateSlice react to the buyUpgrade action via extraReducers (atomic actual* updates), and restructuring the purchase loop so desired count updates are captured in undo snapshots. Subsumes the AI desires resilience plan.
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
  - id: refactor-assertion
    content: Replace getAndAssertExactlyOneDesiredStateIsOneAboveActual with findNextDesiredUpgrade that returns UpgradeName | undefined, handles desired > actual (not just +1), and warns instead of throwing for multiple matches
    status: pending
  - id: add-ensure-goal
    content: Add ensureDesiredGoalExists(api) helper that calls decideSomeDesiredCount in a bounded loop until an actionable buy goal exists
    status: pending
  - id: restructure-desired
    content: Restructure computeNextBuyPriority to call ensureDesiredGoalExists when no goal found, moving decideSomeDesiredCount from buy() into computeNextBuyPriority()
    status: pending
  - id: run-qcheck
    content: Run qcheck to verify correctness
    status: pending
isProject: false
---

# Fix Undo Consistency Between gameState and aiState

This plan subsumes and replaces [fix_ai_desires_resilience](fix_ai_desires_resilience_d4c90c26.plan.md), which is now obsolete.

## Problem

Within `executePurchase` in [purchasing.ts](web/src/ai/intellects/basic/purchasing.ts), two sequential dispatches create an inconsistent undo snapshot:

1. `api.buyUpgrade(priority)` -- dispatches `buyUpgrade` which has `asPlayerAction` (creates undo snapshot). `gameState` updated.
2. `api.incrementActualWeaponDamageUpgrades()` -- dispatches a plain reducer (no snapshot). `aiState.actual*` updated.

The undo snapshot from step 1 captures `gameState` with the upgrade applied but `aiState.actual*` at the old value. Similarly, `incrementDesired*` dispatches (in `decideSomeDesiredCount`) happen after `buyUpgrade`, so desired counts can also be stale in the snapshot.

Additionally, the AI's purchasing logic maintains a strict invariant -- **exactly one upgrade type must have `desired === actual + 1**` -- which breaks when:

- **Human action fulfills AI's goal**: Human hires agents or buys upgrades, satisfying the AI's current goal without `decideSomeDesiredCount()` ever being called to establish a new one. The assertion throws.
- **Undo restores mid-purchase snapshot**: `gameState` shows the upgrade but `aiState.actual*` hasn't caught up. The AI may double-purchase.

Both issues stem from the same design flaw: *the AI assumes it is the sole actor modifying game state, and actual tracking is not atomic with purchases**.

## Solution: Three complementary changes

### Change A: Make actual* updates atomic with buyUpgrade via extraReducers

Instead of dispatching separate `incrementActual*` actions after `buyUpgrade`, make `aiStateSlice` listen for the `buyUpgrade` action directly using `extraReducers`. Both `gameStateReducer` and `aiStateReducer` process the same dispatched action in a single Redux dispatch cycle, so they're captured in the same undo snapshot.

In [aiStateSlice.ts](web/src/redux/slices/aiStateSlice.ts), add:

```typescript
import { buyUpgrade } from './gameStateSlice'

const aiStateSlice = createSlice({
  name: 'aiState',
  initialState: createInitialState(),
  reducers: {
    // ... existing desired count reducers, reset ...
    // (remove all incrementActual* reducers)
  },
  extraReducers: (builder) => {
    builder.addCase(buyUpgrade, (state, action) => {
      const upgradeName = action.payload
      switch (upgradeName) {
        case 'Agent cap':            state.actualAgentCapUpgrades += 1; break
        case 'Transport cap':        state.actualTransportCapUpgrades += 1; break
        case 'Training cap':         state.actualTrainingCapUpgrades += 1; break
        case 'Weapon damage':        state.actualWeaponDamageUpgrades += 1; break
        case 'Training skill gain':  state.actualTrainingSkillGainUpgrades += 1; break
        case 'Exhaustion recovery %': state.actualExhaustionRecoveryUpgrades += 1; break
        case 'Hit points recovery %': state.actualHitPointsRecoveryUpgrades += 1; break
        case 'Hit points':           state.actualHitPointsUpgrades += 1; break
      }
    })
  },
})
```

No circular dependency: [gameStateSlice.ts](web/src/redux/slices/gameStateSlice.ts) does not import from `aiStateSlice`, so `aiStateSlice` importing `buyUpgrade` from `gameStateSlice` is a one-way dependency.

**Bonus**: This also handles human player purchases. When a human buys an upgrade via the UI, `actual*` increments automatically. The AI's `actual*` now means "total upgrades purchased by anyone," which is semantically correct -- the AI's desired counts represent "I want at least N upgrades to exist," and a human purchase satisfies that goal. This directly supports resilience to human interference.

### Change B: Replace assertion with soft lookup (`findNextDesiredUpgrade`)

Rename `getAndAssertExactlyOneDesiredStateIsOneAboveActual` to `findNextDesiredUpgrade`. Change it to:

- Return `UpgradeName | undefined` instead of throwing
- Find any upgrade where `desired > actual` (not strictly `=== actual + 1`)
- If multiple found, pick the first one and log a warning (instead of throwing)
- If none found, return `undefined`

This makes the AI resilient to any state where the strict `desired === actual + 1` invariant doesn't hold (e.g., after human actions, after undo, or when desired > actual by more than 1).

### Change C: Establish desired counts BEFORE purchases, not after

Currently `decideSomeDesiredCount` is called inside `buy()` AFTER `executePurchase` dispatches `buyUpgrade` (which creates the undo snapshot). This means the desired count update is NOT captured in that snapshot.

Restructure so desired count establishment happens in `computeNextBuyPriority` (BEFORE the next `buy` call). Add an `ensureDesiredGoalExists(api)` helper that:

- Calls `decideSomeDesiredCount(api)` in a bounded loop (max ~50 iterations as safety)
- After each call, checks if an actionable goal now exists (either agent count or an upgrade with `desired > actual`)
- Stops as soon as an actionable goal is found
- Throws only if max iterations exhausted (a genuine bug)

The loop is needed because `decideSomeDesiredCount` may increase `desiredAgentCount`, but if the human already hired enough agents, that's immediately satisfied and another iteration is needed until a stat upgrade goal is established.

Revised `computeNextBuyPriority` flow:

```
function computeNextBuyPriority(api):
  if agents.length < desiredAgentCount:
    return 'newAgent'

  nextUpgrade = findNextDesiredUpgrade(aiState)
  if nextUpgrade !== undefined:
    return nextUpgrade

  // No goal exists - human actions or undo may have fulfilled current goals.
  // Re-establish by calling decideSomeDesiredCount until an actionable goal exists.
  log.warn('purchasing', 'No active buy goal found - re-establishing after external state change')
  ensureDesiredGoalExists(api)

  // Re-check after establishing new goal
  if agents.length < api.aiState.desiredAgentCount:
    return 'newAgent'
  return findNextDesiredUpgrade(api.aiState) ?? throw error
```

Current flow vs new flow:

```
CURRENT:
  spendMoney:
    priority = computeNextBuyPriority()
    while hasMoney:
      buy(priority)
        executePurchase(priority)           // buyUpgrade SNAPSHOT  ← desired stale
        incrementActual*()                  // no snapshot          ← actual stale
        if allMet: decideSomeDesiredCount() // no snapshot
      priority = computeNextBuyPriority()

NEW:
  spendMoney:
    priority = computeNextBuyPriority()     // establishes desired if needed via ensureDesiredGoalExists
    while hasMoney:
      executePurchase(priority)             // buyUpgrade SNAPSHOT  ← desired already current
                                            //                      ← actual* updated atomically via extraReducers
      priority = computeNextBuyPriority()   // if all goals met → ensureDesiredGoalExists → return new priority
```

## File changes

### 1. `aiStateSlice.ts` -- add extraReducers, remove incrementActual*

In [web/src/redux/slices/aiStateSlice.ts](web/src/redux/slices/aiStateSlice.ts):

- Import `buyUpgrade` from `./gameStateSlice`
- Add `extraReducers` block (as shown above) that handles all 8 upgrade types
- Remove all 8 `incrementActual*` reducers from the `reducers` field
- Remove all 8 `incrementActual*` action exports
- Keep all `actual*` fields in `BasicIntellectState` (unchanged)
- Keep all `desired*` reducers and `reset` (unchanged)

### 2. Remove `incrementActual*` from PlayTurnAPI

In [web/src/lib/model_utils/playTurnApiTypes.ts](web/src/lib/model_utils/playTurnApiTypes.ts):

- Remove all 8 `incrementActual*()` methods from the `PlayTurnAPI` type

In [web/src/redux/playTurnApi.ts](web/src/redux/playTurnApi.ts):

- Remove all 8 `incrementActual*()` method implementations
- Remove the corresponding imports from `aiStateSlice`

### 3. Restructure purchasing.ts

In [web/src/ai/intellects/basic/purchasing.ts](web/src/ai/intellects/basic/purchasing.ts):

- Remove all `api.incrementActual*()` calls from `executePurchase` (the whole switch block, lines 180-205)
- Rename `getAndAssertExactlyOneDesiredStateIsOneAboveActual` to `findNextDesiredUpgrade`:
  - Return `UpgradeName | undefined` instead of throwing
  - Accept `desired > actual` (not strictly `=== actual + 1`)
  - If multiple found, pick the first and log a warning
  - If none found, return `undefined`
- Add `ensureDesiredGoalExists(api)` that calls `decideSomeDesiredCount` in a bounded loop (max ~50 iterations) until an actionable goal exists
- Update `computeNextBuyPriority` to call `ensureDesiredGoalExists` when `findNextDesiredUpgrade` returns `undefined`
- Move `decideSomeDesiredCount` call out of `buy()` -- it now lives in `ensureDesiredGoalExists` called from `computeNextBuyPriority`
- Simplify `buy()` to only call `executePurchase` + logging

## Consistency guarantee

After all three changes, every undo snapshot is fully consistent:

- **Actuals**: Updated in the same dispatch as `buyUpgrade` via `extraReducers` -- always in sync with `gameState`
- **Desired counts**: Updated in `computeNextBuyPriority` BEFORE the next `buyUpgrade` dispatch -- captured in the next undo snapshot
- **Edge case** (undo to snapshot before very first desired update): Handled by `ensureDesiredGoalExists` resilience (re-establishes goals when all desired === actual)
- **Human interference**: Human purchases auto-increment `actual*` via `extraReducers`; human hiring is already tracked via `gameState.agents.length`. The AI recognizes externally-fulfilled goals and re-establishes new ones via `ensureDesiredGoalExists`.
