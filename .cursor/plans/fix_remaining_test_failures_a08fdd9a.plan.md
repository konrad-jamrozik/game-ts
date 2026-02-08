---
name: Fix remaining test failures
overview: Fix 3 remaining test failures caused by (1) undo history being disabled in AI test setup, and (2) aiState not being reset when gameState is reset, causing test isolation leaks.
todos:
  - id: fix-undo-limit
    content: Change undoLimit from 0 to 100 in setupAITests.ts to enable undo history for undo tests
    status: completed
  - id: fix-aistate-reset
    content: Add gameState/reset to aiStateSlice extraReducers so aiState resets atomically when gameState is reset
    status: completed
  - id: remove-redundant-resetAiState
    content: Remove now-redundant dispatch(resetAiState()) from ResetControls.tsx and remove the resetAiState export from aiStateSlice if no other callers remain
    status: pending
  - id: verify-tests
    content: Run all 15 tests in humanInterference.test.ts and purchasingResilience.test.ts and verify they pass
    status: completed
  - id: verify-qcheck
    content: Run qcheck to verify no regressions
    status: completed
isProject: false
---

# Fix Remaining 3 Test Failures

## Root Cause Analysis

### Failure 1: Undo tests in purchasingResilience.test.ts (2 tests)

Tests: "undo after purchase reverts both gameState and aiState.actual*" and "spendMoney works after undo reverts all AI purchases".

The AI test setup file [setupAITests.ts](web/test/utils/setupAITests.ts) initializes the store with `undoLimit: 0`:

```1:1:web/test/utils/setupAITests.ts
// Setup for AI tests with undoLimit: 0 to avoid undo history overhead during long AI simulations
```

In [rootReducer.ts](web/src/redux/rootReducer.ts), `undoLimit: 0` produces `limit: 0 + 1 = 1`, meaning redux-undo keeps only the current state with **zero past entries**. Undo is effectively disabled for all AI tests.

The undo tests dispatch `buyUpgrade` (a player action) and then call `ActionCreators.undo()`, expecting to revert. But with `limit: 1`, no past state is ever recorded, so undo has no effect.

**Fix**: Change `undoLimit: 0` to `undoLimit: 100` in `setupAITests.ts`. This enables undo for the 2 tests that need it while keeping a reasonable limit. The performance impact is minimal -- undo history just stores state references.

### Failure 2: humanInterference.test.ts "AI adapts when human hires enough agents" (1 test)

The `beforeEach` in [humanInterference.test.ts](web/test/ai/humanInterference.test.ts) dispatches `gameState/reset` but does NOT dispatch `aiState/reset`. This means `aiState` (including `desiredAgentCount`, `actual*` counters, etc.) leaks between tests. When test 2 runs after test 1 (which ran AI for 10 turns), `desiredAgentCount` is inflated from the previous test to a value like 465. The test then tries to hire 465 agents but the agent cap is only 20.

**Fix**: Add `gameState/reset` to `aiStateSlice`'s `extraReducers`. When `gameState` is reset, `aiState` is atomically reset too. This is semantically correct -- resetting the game should reset AI state -- and it fixes test isolation without modifying any test files.

## File changes

### 1. [web/test/utils/setupAITests.ts](web/test/utils/setupAITests.ts) -- enable undo history

Change `undoLimit: 0` to `undoLimit: 100`:

```typescript
await initStore({ undoLimit: 100, enablePersistence: false, enableDefaultMiddleware: false })
```

### 2. [web/src/redux/slices/aiStateSlice.ts](web/src/redux/slices/aiStateSlice.ts) -- reset aiState on gameState reset

Import `reset` from `gameStateSlice` (aliased to avoid conflict with the local `reset` reducer) and add a second `addCase` to `extraReducers`:

```typescript
import { buyUpgrade, reset as gameStateReset } from './gameStateSlice'

extraReducers: (builder) => {
  builder.addCase(buyUpgrade, (state, action) => { ... })
  builder.addCase(gameStateReset, (state) => {
    Object.assign(state, createInitialState())
  })
},
```

### 3. [web/src/components/GameControls/ResetControls.tsx](web/src/components/GameControls/ResetControls.tsx) -- remove redundant resetAiState call

Since `gameState/reset` now atomically resets `aiState` via `extraReducers`, the separate `dispatch(resetAiState())` in `handleResetGame` is redundant. Remove it and its import:

```typescript
// Before:
dispatch(reset(useDebug ? { debug: true } : undefined))
dispatch(resetAiState())  // <-- remove this line

// After:
dispatch(reset(useDebug ? { debug: true } : undefined))
```

### 4. [web/src/redux/slices/aiStateSlice.ts](web/src/redux/slices/aiStateSlice.ts) -- remove resetAiState export

With no remaining callers, remove the `reset` reducer from the `reducers` block and the `resetAiState` export. The reset logic now lives exclusively in `extraReducers`.
