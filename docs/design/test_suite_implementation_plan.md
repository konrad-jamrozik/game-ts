# Test Suite Implementation Plan

This document outlines the implementation plan to align the current test suite with the updated design specification in `docs/design/about_test_suites.md`.

## Overview

The goal is to implement a focused test suite that contains only the tests specified in the "Test suite design" section:
- 1 E2E test (already exists)
- 5 Component tests (already exist)
- Unit tests for turn advancement logic, player actions, and documentation examples (partially exists)

## Current vs. Target State

### ✅ Tests That Should Remain (Already Compliant)

#### E2E Tests

- `web/test/e2e/App.test.tsx`:
  - **Keep:** `Execute subset of core logic and verify the game does not crash`

#### Component Tests  

- `web/test/component/GameControls.test.tsx`:
  - **Keep:** `When 'advance turn' button is clicked, the turn advances`
  - **Keep:** `Given an in-progress game state, when the 'restart game' button is clicked, the game state is reset`
- `web/test/component/PlayerActions.test.tsx`:
  - **Keep:** `When 'hire agent' button is pressed, agents counter is incremented from 0 to 1`
- `web/test/component/EventLog.test.tsx`:
  - **Keep all tests:** Event display functionality
- `web/test/component/ErrorBoundary.test.tsx`:
  - **Keep all tests:** Error boundary functionality

#### Unit Tests

- `web/test/unit/evaluateDeployedMissionSite.test.ts`:
  - **Keep all 3 tests:** deployment evaluation, agent termination, mission failure
- `web/test/unit/AgentView.test.ts`:
  - **Keep all tests:** effective skill calculation examples from documentation
- `web/test/unit/eventsMiddleware.test.ts`:
  - **Keep all tests:** events middleware functionality
- `web/test/unit/settingsSlice.test.ts`:
  - **Keep all tests:** settings slice functionality
- `web/test/unit/fixtures.example.test.ts`:
  - **Keep all tests:** fixture usage examples
- `web/test/unit/initialState.test.ts`:
  - **Keep all tests:** initial state validation

### ❌ Tests To Remove (Not in Design Specification)

**No tests need to be removed** - all existing tests are now part of the design specification.

## ➕ Tests To Add (Missing from Current Implementation)

### Unit Tests for Turn Advancement Logic

#### `web/test/unit/evaluateBattle.test.ts`

Multiple tests for battle evaluation logic:
- `handle agent vs enemy combat with successful agent attacks`
- `handle agent termination when hit points reach zero`
- `handle enemy elimination and loot distribution`
- `handle multiple agents vs multiple enemies combat`
- `apply exhaustion after combat completion`
- `handle combat with officers present`

#### `web/test/unit/evaluateTurn.test.ts`

Multiple tests for turn advancement logic:
- `advance turn counter and reset action counter`
- `process all deployed mission sites`
- `handle mission site expiration`
- `process agent recovery and exhaustion reduction`
- `calculate and deduct agent costs from money`
- `handle game over condition when money becomes negative`
- `update panic levels based on failed missions`

### Unit Tests for Documentation Examples

#### `web/test/unit/agentRecovery.test.ts`

Tests for hit points recovery examples documented in `Agent lost hit points and recovery` section of [about_agents.md](about_agents.md):
- `recover hit points correctly according to documentation examples`
- `handle recovery turns countdown properly`
- `reset recovery process when fully healed`

#### `web/test/unit/contestRolls.test.ts`

Tests for contest rolls examples documented in `Contest roll` section of [about_deployed_mission_site.md](about_deployed_mission_site.md):
- `execute contest rolls correctly according to documentation examples`
- `handle tie situations in contest rolls`
- `apply skill modifiers correctly in contests`

#### `web/test/unit/weaponDamageRolls.test.ts`

Tests for weapon damage rolls examples documented in `Range roll` section of [about_deployed_mission_site.md](about_deployed_mission_site.md):
- `calculate weapon damage ranges correctly according to documentation examples`
- `handle different weapon types and damage calculations`
- `apply damage modifiers correctly`

### Unit Tests for Player Actions

#### `web/test/unit/playerActions.test.ts`

Tests for each `asPlayerAction` entry from `gameStateSlice.ts` (7 player actions total):

**hireAgent tests:**
- `create new agent with correct initial values`
- `alert on insufficient money`

**sackAgents tests:**
- `sack agents`
- `alert on selection of agents in invalid state`

**assignAgentsToContracting tests:**
- `assign agents to contracting`
- `alert on selection of agents in invalid state`

**assignAgentsToEspionage tests:**
- `assign agents to espionage`
- `alert on selection of agents in invalid state`

**recallAgents tests:**
- `recall agents`
- `alert on selection of agents in invalid state`

**investigateLead tests:**
- `investigate lead and create mission site for dependent mission`
- `alert on insufficient intel`

**deployAgentsToMission tests:**
- `deploy agents to active missions site`
- `alert on selection of agents in invalid state`

## Implementation Notes

### Test Structure

- All unit tests should use `describe` blocks to group related tests
- Tests should use `debugInitialState` when appropriate to arrange game state
- Tests should modify the debug state as needed to ensure proper item selection
- Each test should have at least one happy path test and one failure/alert test where applicable

### Test Naming Convention

- Test files should match the module being tested (e.g., `evaluateBattle.test.ts` for `evaluateBattle.ts`)
- Test descriptions should be clear and specify the expected behavior
- Follow existing patterns: `[expected behavior] when [condition]`

### Dependencies and Fixtures

- Player action tests should use appropriate fixtures and state arrangements
- Tests should be isolated and not depend on other tests
- Use `beforeEach` to reset state when needed

### Documentation Verification Tests

- Documentation example tests should verify that the exact examples shown in the documentation work correctly
- These tests serve as living documentation - if the implementation changes, either the tests or
  documentation should be updated
- Tests should reference specific sections of documentation files to maintain traceability

## File Changes Summary

### Files to Delete

**None** - all existing tests are part of the design specification.

### Files to Modify

**None** - all existing tests should remain as-is.

### Files to Create

- `web/test/unit/evaluateBattle.test.ts`
- `web/test/unit/evaluateTurn.test.ts`
- `web/test/unit/playerActions.test.ts`
- `web/test/unit/agentRecovery.test.ts`
- `web/test/unit/contestRolls.test.ts`
- `web/test/unit/weaponDamageRolls.test.ts`

This comprehensive approach ensures complete coverage of the core game logic while verifying that
documentation examples remain accurate and functional.
