---
name: Fix AI desires resilience
overview: Make the AI purchasing logic resilient to human actions and undo/redo by replacing the strict "exactly one desired above actual" assertion with a flexible "find-or-establish" pattern that recovers gracefully when game state has been modified externally.
todos:
  - id: refactor-assertion
    content: Replace getAndAssertExactlyOneDesiredStateIsOneAboveActual with findNextDesiredUpgrade that returns UpgradeName | undefined, handles desired > actual (not just +1), and warns instead of throwing for multiple matches
    status: pending
  - id: add-ensure-goal
    content: Add ensureDesiredGoalExists(api) helper that calls decideSomeDesiredCount in a bounded loop until an actionable buy goal (agent count or upgrade) exists
    status: pending
  - id: update-compute-priority
    content: Update computeNextBuyPriority to call ensureDesiredGoalExists when findNextDesiredUpgrade returns undefined, with warning log about external state change
    status: pending
  - id: verify-qcheck
    content: Run qcheck to verify all changes compile and pass linting
    status: pending
isProject: false
---

# Fix AI desires to handle intermittent game state changes

## Root Cause Analysis

The AI's purchasing logic in [purchasing.ts](web/src/ai/intellects/basic/purchasing.ts) maintains a strict invariant: **exactly one upgrade type must have `desired === actual + 1**` at all times. This breaks in two scenarios:

### Scenario 1: Human action fulfills AI's current goal

1. AI has `desiredAgentCount = 2`, `agents.length = 1`, all upgrade desired/actual = 0
2. Human manually hires an agent -> `agents.length = 2` (goal met!)
3. Human delegates to AI -> `computeNextBuyPriority()` finds agent count met, checks upgrades
4. All upgrade `desired === actual === 0` -> **assertion fails**: "Expected exactly one desired cap/upgrade to be exactly 1 above actual, but found none."

This happens because agent count uses `gameState.agents.length` as the "actual" (line 74), so human hiring directly satisfies the AI's goal without `decideSomeDesiredCount()` ever being called to establish a new upgrade goal.

### Scenario 2: Undo restores mid-purchase snapshot

`buyUpgrade` has `playerAction: true` (creates undo snapshot), but `incrementActual*` / `incrementDesired*` do NOT. This means undo snapshots can capture state where `gameState` reflects a purchase but `aiState.actual*` hasn't been incremented yet. After undo to such a snapshot:

- `gameState` shows the upgrade was bought
- `aiState.actual*` hasn't caught up
- The invariant may hold (one desired > actual) but the AI will double-purchase the upgrade

Both scenarios stem from the same design flaw: **the AI assumes it is the sole actor modifying game state**.

## Proposed Fix

All changes are in [purchasing.ts](web/src/ai/intellects/basic/purchasing.ts). No other files need changes.

### 1. Replace assertion with soft lookup

Rename `getAndAssertExactlyOneDesiredStateIsOneAboveActual` to `findNextDesiredUpgrade`. Change it to:

- Return `UpgradeName | undefined` instead of throwing
- Find any upgrade where `desired > actual` (not strictly `=== actual + 1`)
- If multiple found, pick the first one and log a warning (instead of throwing)
- If none found, return `undefined`

### 2. Add goal re-establishment in `computeNextBuyPriority`

When `findNextDesiredUpgrade` returns `undefined`, call a new `ensureDesiredGoalExists(api)` function that:

- Calls `decideSomeDesiredCount(api)` in a bounded loop (max ~50 iterations as safety)
- After each call, checks if an actionable goal now exists (either agent count or an upgrade with `desired > actual`)
- Stops as soon as an actionable goal is found
- Throws only if max iterations exhausted (a genuine bug)

The loop is needed because `decideSomeDesiredCount` may increase `desiredAgentCount`, but if the human already hired enough agents, that's immediately satisfied and another iteration is needed until a stat upgrade goal is established.

### 3. Revised `computeNextBuyPriority` flow

```
function computeNextBuyPriority(api):
  if agents.length < desiredAgentCount:
    return 'newAgent'
  
  nextUpgrade = findNextDesiredUpgrade(aiState)
  if nextUpgrade !== undefined:
    return nextUpgrade
  
  // No goal exists - human actions must have fulfilled current goals.
  // Re-establish by calling decideSomeDesiredCount until an actionable goal exists.
  log.warn('purchasing', 'No active buy goal found - re-establishing after external state change')
  ensureDesiredGoalExists(api)
  
  // Re-check after establishing new goal
  if agents.length < api.aiState.desiredAgentCount:
    return 'newAgent'
  return findNextDesiredUpgrade(api.aiState) ?? throw error
```

## What This Does NOT Fix (acceptable)

- **Double-purchasing after undo to mid-purchase snapshot**: The AI may buy an upgrade that was already applied to `gameState` but not tracked in `aiState.actual*`. This is a cosmetic issue (player gets an extra upgrade) and does not crash. Fixing this would require deriving `actual*` from game state, which is a larger refactor.
- The `actual*` counters remain AI-internal and are not reconciled with `gameState`. This is fine because for upgrades, human purchases don't touch `actual*` and the AI's own tracking stays self-consistent.
