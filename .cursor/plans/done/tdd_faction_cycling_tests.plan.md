---
name: "TDD: faction cycling lead selection"
overview: TDD test suite for the faction cycling plan. Write failing tests first, then implement ai_faction_cycling_for_leads to make them pass. Covers faction priority rotation, lead selection by faction, and multi-turn integration.
todos:
  - id: r1-export-lead-fns
    content: "R1: Export `selectLeadToInvestigate` (and later `getFactionPriorityOrder`) from `leadInvestigation.ts`"
    status: completed
  - id: test-faction-cycling
    content: Write `web/test/ai/factionCycling.test.ts` with pure + integration tests for lead selection faction cycling
    status: completed
  - id: run-qcheck
    content: Run `qcheck` to verify all tests compile and lint passes
    status: completed
isProject: false
---

# TDD: Faction Cycling Lead Selection

TDD test suite for [ai_faction_cycling_for_leads](ai_faction_cycling_for_leads_1a8f75f3.plan.md). Write these failing tests first, then implement the faction cycling plan to make them pass.

## Approach

Two layers of tests, both running in Node (no React/jsdom), using the existing `ai` vitest project config with `setupAITests.ts`:

1. **Pure function tests** -- call exported functions directly with crafted inputs, no Redux store needed
2. **Store integration tests** -- use the real Redux store via `delegateTurnsToAIPlayer`

Key design decisions:

- **No mocking**: All tests use real store, real reducers, real AI logic, real data tables
- **No React**: All tests run in Node environment via the `ai` vitest project
- **TDD**: Tests describe desired post-refactor behavior; they will fail until the faction cycling plan is implemented
- **Fast**: Pure function tests are instant; store tests use `undoLimit: 0` and no persistence
- `**rand` control**: Use `rand.set()` for deterministic lead investigation outcomes

## Refactoring for Testability

### R1. Export pure functions from `leadInvestigation.ts`

Export `selectLeadToInvestigate` so it can be called directly in tests with crafted `Lead[]`, `GameState`, and `AgentWithStats[]`. Also export the new `getFactionPriorityOrder` when implementing the faction cycling plan.

```typescript
// web/src/ai/intellects/basic/leadInvestigation.ts
export function selectLeadToInvestigate(...): Lead | undefined { ... }
export function getFactionPriorityOrder(turn: number, offset: number): FactionId[] { ... }
```

These are pure functions (data in, data out) -- no store dependency.

Note: `getFactionPriorityOrder` does not exist yet. For the TDD step, add it as a stub that throws, so the tests compile but fail. `selectLeadToInvestigate` exists but is not exported -- add `export` keyword.

## Test File: `web/test/ai/factionCycling.test.ts`

Tests for lead selection with faction cycling. Uses `ai` vitest project.

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
