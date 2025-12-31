---
name: Create AI test suite
overview: ""
todos:
  - id: vitest-config
    content: Add AI test project configuration to vitest.config.ts
    status: completed
  - id: create-test
    content: Create web/test/ai/basicIntellect.test.ts with the AI test
    status: completed
    dependencies:
      - vitest-config
---

# Create AI Test for Basic Intellect

Create a new AI test directory and test file that runs the basic intellect AI player for up to 100 turns with favorable conditions and verifies victory.

## Overview

The test will:

1. Set up a standard initial game state with 100,000 money
2. Configure `rand` overrides for successful lead investigations and combat rolls
3. Delegate up to 100 turns to the basic intellect AI
4. Assert that the game ended in victory

## Implementation

### 1. Add AI test project to Vitest config

Update [`web/vitest.config.ts`](web/vitest.config.ts) to add a new test project for `test/ai/*.test*` files with `node` environment (no UI rendering needed).

### 2. Create new test directory and file

Create [`web/test/ai/basicIntellect.test.ts`](web/test/ai/basicIntellect.test.ts) with:

```typescript
// Arrange:
// - Reset store with standard initial state + 100,000 money
// - Set rand.set('lead-investigation', 1) for successful investigations
// - Set rand.set('agent_attack_roll', 1) and rand.set('enemy_attack_roll', 0) for successful combat

// Act:
// - Call delegateTurnsToAIPlayer('basic', 100)

// Assert:
// - Verify isGameWon(gameState) returns true
```

Key imports:

- `bldInitialState()` from [`web/src/lib/factories/gameStateFactory.ts`](web/src/lib/factories/gameStateFactory.ts)
- `reset` from [`web/src/redux/slices/gameStateSlice.ts`](web/src/redux/slices/gameStateSlice.ts)
- `delegateTurnsToAIPlayer` from [`web/src/ai/delegateTurnToAIPlayer.ts`](web/src/ai/delegateTurnToAIPlayer.ts)
- `isGameWon` from [`web/src/lib/game_utils/gameStateChecks.ts`](web/src/lib/game_utils/gameStateChecks.ts)
- `rand` from [`web/src/lib/primitives/rand.ts`](web/src/lib/primitives/rand.ts)
- `store` from [`web/src/redux/store.ts`](web/src/redux/store.ts)
