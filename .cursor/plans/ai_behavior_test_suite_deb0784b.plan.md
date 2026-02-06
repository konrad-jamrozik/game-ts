---
name: "TDD: undo consistency and purchasing resilience"
overview: TDD test suite for the undo consistency plan. Write failing tests first, then implement fix_undo_consistency_aistate to make them pass. Covers purchasing resilience, human interference, and undo scenarios.
todos:
  - id: r2-export-purchasing-fns
    content: "R2: Export `findNextDesiredUpgrade`, `areAllDesiredCountsMet`, `computeNextBuyPriority` from `purchasing.ts`"
    status: pending
  - id: r3-load-ai-state
    content: "R3: Add `loadState` reducer to `aiStateSlice.ts` and export `createInitialAiState`"
    status: pending
  - id: r4-arrange-ai-state
    content: "R4: Add `arrangeAiState` and `aiState` getter to `stateFixture.ts`"
    status: pending
  - id: test-purchasing-resilience
    content: Write `web/test/ai/purchasingResilience.test.ts` with pure + integration tests for purchasing resilience
    status: pending
  - id: test-human-interference
    content: Write `web/test/ai/humanInterference.test.ts` with end-to-end human interference scenarios
    status: pending
  - id: run-qcheck
    content: Run `qcheck` to verify all tests compile and lint passes
    status: pending
isProject: false
---

# TDD: Undo Consistency and Purchasing Resilience

TDD test suite for [fix_undo_consistency_aistate](fix_undo_consistency_aistate_710e8589.plan.md). Write these failing tests first, then implement the undo consistency plan to make them pass.

## Approach

Two layers of tests, both running in Node (no React/jsdom), using the existing `ai` vitest project config with `setupAITests.ts`:

1. **Pure function tests** -- call exported functions directly with crafted inputs, no Redux store needed
2. **Store integration tests** -- use the real Redux store via `PlayTurnAPI` / `delegateTurnsToAIPlayer`, simulating human actions via `PlayerActionsAPI`

Key design decisions:

- **No mocking**: All tests use real store, real reducers, real AI logic, real data tables
- **No React**: All tests run in Node environment via the `ai` vitest project
- **TDD**: Tests describe desired post-refactor behavior; they will fail until the undo consistency plan is implemented
- **Fast**: Pure function tests are instant; store tests use `undoLimit: 0` and no persistence
- `**rand` control**: Use `rand.set()` for deterministic outcomes in integration tests (already used in `setupCheatingGameState`)

## Refactoring for Testability (3 changes)

### R2. Export pure functions from `purchasing.ts`

Export `findNextDesiredUpgrade` (the refactored assertion), `areAllDesiredCountsMet`, and `computeNextBuyPriority`.

```typescript
// web/src/ai/intellects/basic/purchasing.ts
export function findNextDesiredUpgrade(aiState: BasicIntellectState): UpgradeName | undefined { ... }
export function areAllDesiredCountsMet(gameState: GameState, aiState: BasicIntellectState): boolean { ... }
export function computeNextBuyPriority(api: PlayTurnAPI): UpgradeNameOrNewAgent { ... }
```

`findNextDesiredUpgrade` and `areAllDesiredCountsMet` are pure. `computeNextBuyPriority` needs `PlayTurnAPI` but is easy to test via the store.

Note: `findNextDesiredUpgrade` does not exist yet (it replaces `getAndAssertExactlyOneDesiredStateIsOneAboveActual`). For the TDD step, export the current function with the new name and signature as a stub that throws, so the tests compile but fail.

### R3. Add `loadState` reducer to `aiStateSlice`

Currently `resetAiState` always resets to initial values with no way to set arbitrary state for tests. Add a `loadState` reducer:

```typescript
// web/src/redux/slices/aiStateSlice.ts
loadState(state, action: PayloadAction<BasicIntellectState>) {
  Object.assign(state, action.payload)
},
```

Export as `loadAiState`. This enables tests to arrange any `aiState` configuration in one dispatch, instead of dozens of increment dispatches. Small, safe production code change.

### R4. Add `arrangeAiState` to test fixtures

Add to [web/test/fixtures/stateFixture.ts](web/test/fixtures/stateFixture.ts):

```typescript
arrangeAiState(updates: Partial<BasicIntellectState>): void {
  const store = getStore()
  store.dispatch(loadAiState({ ...createInitialAiState(), ...updates }))
},

get aiState(): BasicIntellectState {
  return getStore().getState().undoable.present.aiState
},
```

Also export `createInitialAiState` from `aiStateSlice.ts` (rename `createInitialState` to be exported).

## Test File 1: `web/test/ai/purchasingResilience.test.ts`

Tests for purchasing resilience and undo consistency. Uses `ai` vitest project.

### Pure function tests

```
describe('findNextDesiredUpgrade')
  - 'returns upgrade name when exactly one desired > actual'
  - 'returns undefined when all desired === actual'
  - 'handles desired > actual + 1 (gap > 1) without throwing'
  - 'when multiple desired > actual, returns first and does not throw'
  - 'returns undefined when only desiredAgentCount > actual (not an upgrade)'
```

Input: crafted `BasicIntellectState` objects with various desired/actual combinations. Uses `createInitialAiState()` as base.

```
describe('areAllDesiredCountsMet')
  - 'returns true when agents.length >= desiredAgentCount and all upgrade desired === actual'
  - 'returns false when agents.length < desiredAgentCount'
  - 'returns false when any upgrade desired > actual'
```

### Store integration tests

```
describe('computeNextBuyPriority - after human interference')
  - 'when human hires agent satisfying agent count goal, re-establishes new goal'
  - 'when human fulfills all current goals, re-establishes via ensureDesiredGoalExists loop'
  - 'does not crash when desired > actual by more than 1'
```

Note: `computeNextBuyPriority` is where `ensureDesiredGoalExists` (calling `decideSomeDesiredCount` in a bounded loop) is invoked, so these tests cover the desired count re-establishment flow.

Pattern: `st.arrangeGameState({ agents: <enough agents>, money: 100_000 })` + `st.arrangeAiState({ desiredAgentCount: 5 /* already met */ })`, create `PlayTurnAPI` via `getPlayTurnApi(store)`, call `computeNextBuyPriority(api)`.

```
describe('spendMoney - full purchasing loop after human interference')
  - 'purchases normally when starting from state where human already met agent goal'
  - 'establishes new goals and purchases when all desired counts met externally'
```

Pattern: arrange state, call `spendMoney(api)`, verify no crash + `aiState` has new desired counts.

## Test File 2: `web/test/ai/humanInterference.test.ts`

End-to-end integration tests for human action interference scenarios. Uses `ai` vitest project.

```
describe('AI resilience to human actions')
  - 'AI continues after human hires agents mid-game'
    Setup: run AI 5 turns, then human hires via PlayerActionsAPI, then AI runs 5 more turns
  - 'AI adapts when human hires enough agents to satisfy all AI agent goals'
    Setup: run AI 3 turns, human hires to meet desiredAgentCount, AI runs 5 more turns, verify new upgrade goals established
  - 'AI recognizes human-purchased upgrades and does not double-purchase'
    Setup: run AI 3 turns, human buys upgrade via PlayerActionsAPI, verify aiState.actual* incremented atomically, AI runs 5 more turns without re-buying same upgrade
  - 'AI recovers from simulated post-undo state (all desired === actual)'
    Setup: arrange aiState with all desired === actual, arrange gameState to match, run AI 5 turns
  - 'AI recovers from simulated post-undo state (desired > actual + 1)'
    Setup: arrange aiState with a gap > 1 on one upgrade, run spendMoney, verify it handles the gap
  - 'AI wins game after human interference in early game'
    Setup: setupCheatingGameState, run AI 3 turns, human hires 2 agents, AI runs remaining 247 turns, verify game won
```

Pattern for human actions: `getPlayerActionsApi(store.dispatch)` to get the human-facing API, call `api.hireAgent(gameState)` or `api.buyUpgrade(gameState, upgradeName)`.

## Undo Testing Strategy

Instead of requiring actual undo/redo (which needs `undoLimit > 0` and is slower), the tests **simulate the after-undo state** by directly setting `aiState` and `gameState` to the problematic configurations:

- "All desired === actual" (human fulfilled goals scenario, or undo to before desired count was bumped)
- "desired > actual + 1" (undo reverted an increment scenario)

Note: the "mid-purchase undo" scenario (gameState shows upgrade bought but aiState.actual hasn't caught up) is eliminated by the undo consistency plan -- `extraReducers` in aiStateSlice makes actual* updates atomic with `buyUpgrade`.

This tests the exact same recovery code paths without needing Redux undo history, keeping the `ai` vitest project with `undoLimit: 0` and no extra setup.
