---
name: AI behavior test suite
overview: "Design a comprehensive, fast unit test suite (TDD-style, initially failing) for the two new AI behavior plans: faction cycling in lead selection and purchasing resilience to human actions. Includes minimal refactoring for testability."
todos:
  - id: r1-export-lead-fns
    content: "R1: Export `selectLeadToInvestigate` (and later `getFactionPriorityOrder`) from `leadInvestigation.ts`"
    status: pending
  - id: r2-export-purchasing-fns
    content: "R2: Export `findNextDesiredUpgrade`, `areAllDesiredCountsMet`, `computeNextBuyPriority` from `purchasing.ts`"
    status: pending
  - id: r3-load-ai-state
    content: "R3: Add `loadState` reducer to `aiStateSlice.ts` and export `createInitialAiState`"
    status: pending
  - id: r4-arrange-ai-state
    content: "R4: Add `arrangeAiState` and `aiState` getter to `stateFixture.ts`"
    status: pending
  - id: test-faction-cycling
    content: Write `web/test/ai/factionCycling.test.ts` with pure + integration tests for lead selection faction cycling
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

# AI Behavior Test Suite

## Approach

Two layers of tests, both running in Node (no React/jsdom), using the existing `ai` vitest project config with `setupAITests.ts`:

1. **Pure function tests** -- call exported functions directly with crafted inputs, no Redux store needed
2. **Store integration tests** -- use the real Redux store via `PlayTurnAPI` / `delegateTurnsToAIPlayer`, simulating human actions via `PlayerActionsAPI`

For "after-undo" scenarios: instead of requiring actual undo (which needs `undoLimit > 0`), simulate the inconsistent state directly by setting up `aiState` + `gameState` to the problematic configuration. This is faster, more isolated, and tests the same code path.

## Refactoring for Testability (4 changes)

### R1. Export pure functions from `leadInvestigation.ts`

Export `selectLeadToInvestigate` so it can be called directly in tests with crafted `Lead[]`, `GameState`, and `AgentWithStats[]`. Also export the new `getFactionPriorityOrder` when implementing plan 1.

```typescript
// web/src/ai/intellects/basic/leadInvestigation.ts
export function selectLeadToInvestigate(...): Lead | undefined { ... }
export function getFactionPriorityOrder(turn: number, offset: number): FactionId[] { ... }
```

These are pure functions (data in, data out) -- no store dependency.

### R2. Export pure functions from `purchasing.ts`

Export `findNextDesiredUpgrade` (the refactored assertion), `areAllDesiredCountsMet`, and `computeNextBuyPriority`.

```typescript
// web/src/ai/intellects/basic/purchasing.ts
export function findNextDesiredUpgrade(aiState: BasicIntellectState): UpgradeName | undefined { ... }
export function areAllDesiredCountsMet(gameState: GameState, aiState: BasicIntellectState): boolean { ... }
export function computeNextBuyPriority(api: PlayTurnAPI): UpgradeNameOrNewAgent { ... }
```

`findNextDesiredUpgrade` and `areAllDesiredCountsMet` are pure. `computeNextBuyPriority` needs `PlayTurnAPI` but is easy to test via the store.

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

## Test File 1: `web/test/ai/factionCycling.test.ts`

Tests for lead selection with faction cycling (Plan 1). Uses `ai` vitest project.

### Pure function tests (no store needed)

```
describe('getFactionPriorityOrder')
  - 'returns all 3 factions in rotated order for turn 1, offset 0'
  - 'rotates by one position each turn'
  - 'wraps around after cycling through all factions'
  - 'offset=1 shifts rotation by one position vs offset=0'
  - 'repeatable and non-repeatable prioritize different factions on same turn'
```

```
describe('selectLeadToInvestigate')
  - 'prioritizes faction-agnostic non-repeatable leads over faction-specific'
  - 'for non-repeatable faction leads, selects by faction priority order'
  - 'for repeatable leads, uses faction priority as primary sort key'
  - 'within same faction, falls back to combat rating tiebreaking'
  - 'within same faction and combat rating, picks least investigated'
  - 'returns undefined when no deployable repeatable leads exist'
  - 'skips factions with no deployable leads and tries next in priority'
```

Inputs: crafted `Lead[]` arrays with leads from multiple factions, `GameState` with different `turn` values, `AgentWithStats[]` built from `agFix.bld()` + `calculateAgentCombatRating()`.

### Store integration tests

```
describe('assignToLeadInvestigation - faction cycling')
  - 'over 9 turns with cheating, investigates leads from all 3 factions'
  - 'piles agents on existing repeatable investigation regardless of faction cycle'
```

Pattern: `setupCheatingGameState()`, run `delegateTurnsToAIPlayer('basic', N)`, inspect `gameState.leadInvestigations` and `leadInvestigationCounts` to verify faction distribution.

## Test File 2: `web/test/ai/purchasingResilience.test.ts`

Tests for AI desires resilience (Plan 2). Uses `ai` vitest project.

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
  - 'when human fulfills all current goals, re-establishes via decideSomeDesiredCount loop'
  - 'does not crash when desired > actual by more than 1'
```

Note: after the undo consistency plan, `computeNextBuyPriority` is also where `decideSomeDesiredCount` is called (moved from `buy()`), so these tests also cover the desired count re-establishment flow.

Pattern: `st.arrangeGameState({ agents: <enough agents>, money: 100_000 })` + `st.arrangeAiState({ desiredAgentCount: 5 /* already met */ })`, create `PlayTurnAPI` via `getPlayTurnApi(store)`, call `computeNextBuyPriority(api)`.

```
describe('spendMoney - full purchasing loop after human interference')
  - 'purchases normally when starting from state where human already met agent goal'
  - 'establishes new goals and purchases when all desired counts met externally'
```

Pattern: arrange state, call `spendMoney(api)`, verify no crash + `aiState` has new desired counts.

## Test File 3: `web/test/ai/humanInterference.test.ts`

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

Instead of requiring actual undo/redo (which needs `undoLimit > 0` and is slower), the tests in File 2 and File 3 **simulate the after-undo state** by directly setting `aiState` and `gameState` to the problematic configurations:

- "All desired === actual" (human fulfilled goals scenario, or undo to before desired count was bumped)
- "desired > actual + 1" (undo reverted an increment scenario)

Note: the "mid-purchase undo" scenario (gameState shows upgrade bought but aiState.actual hasn't caught up) is eliminated by the undo consistency plan -- `extraReducers` in aiStateSlice makes actual* updates atomic with `buyUpgrade`.

This tests the exact same recovery code paths without needing Redux undo history, keeping the `ai` vitest project with `undoLimit: 0` and no extra setup.

## Key Design Decisions

- **No mocking**: All tests use real store, real reducers, real AI logic, real data tables
- **No React**: All tests run in Node environment via the `ai` vitest project
- **TDD**: Tests describe desired post-refactor behavior; they will fail until the two plans are implemented
- **Fast**: Pure function tests are instant; store tests use `undoLimit: 0` and no persistence
- `**rand` control**: Use `rand.set()` for deterministic lead investigation outcomes in integration tests (already used in `setupCheatingGameState`)
