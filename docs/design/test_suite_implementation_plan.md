# Test Suite Implementation Plan

This document outlines the implementation plan to align the current test suite with the updated design specification in `docs/design/about_test_suites.md`.

## Overview

The goal is to implement a focused test suite that contains only the tests specified in the "Test suite design" section:
- 1 E2E test (already exists)
- Component tests for GameControls, EventLog, ErrorBoundary, and PlayerActions (some exist, PlayerActions needs expansion)
- Unit tests for turn advancement logic and documentation examples (partially exists, some tests need removal)

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
  - **UPDATE:** `When 'hire agent' button is pressed, agents counter is incremented from 0 to 1`
    to `When 'Hire agent' button is clicked, hire agent`
- `web/test/component/EventLog.test.tsx`:
  - **Keep all tests:** Event display functionality
- `web/test/component/ErrorBoundary.test.tsx`:
  - **Keep all tests:** Error boundary functionality

#### Unit Tests

- `web/test/unit/evaluateDeployedMissionSite.test.ts`:
  - **Keep all 3 tests:** deployment evaluation, agent termination, mission failure
- `web/test/unit/AgentView.test.ts`:
  - **Keep all tests:** effective skill calculation examples from documentation

### ❌ Tests To Remove (Not in Design Specification)

The following tests are not mentioned in the "Test suite design" section of `about_test_suites.md` and should be removed:

- `web/test/unit/eventsMiddleware.test.ts`: events middleware functionality tests
- `web/test/unit/settingsSlice.test.ts`: settings slice functionality tests  
- `web/test/unit/fixtures.example.test.ts`: fixture usage examples tests
- `web/test/unit/initialState.test.ts`: initial state validation tests

These tests appear in the outdated "List of tests" section but are excluded from the authoritative "Test suite design"
specification, which explicitly states "There are no other unit tests."

## ➕ Tests To Add (Missing from Current Implementation)

### Unit Tests for Turn Advancement Logic

#### `web/test/unit/evaluateBattle.test.ts`

Multiple tests for battle evaluation logic:
- `Given battle that player will win, when the battle is evaluated, result is correct`
- `Given battle that player will lose, when the battle is evaluated, result is correct`

#### `web/test/unit/evaluateTurn.test.ts`

Multiple tests for turn advancement logic:
- `when turn advances, result is correct`
- `Given game state where player is about to lose, when turn advances, player loses the game`

### Unit Tests for Documentation Examples

#### `web/test/unit/agentRecovery.test.ts`

Tests for hit points recovery examples documented in `Agent lost hit points and recovery` section of [about_agents.md](about_agents.md):
- `documentation example: recover hit points correctly`
- `documentation example: handle recovery turns countdown properly`
- `documentation example: reset recovery process when fully healed`

#### `web/test/unit/contestRolls.test.ts`

Tests for contest rolls examples documented in `Contest roll` section of [about_deployed_mission_site.md](about_deployed_mission_site.md):
- `documentation example: execute contest rolls correctly`
- `documentation example: handle tie situations in contest rolls`
- `documentation example: apply skill modifiers correctly in contests`

#### `web/test/unit/weaponDamageRolls.test.ts`

Tests for weapon damage rolls examples documented in `Range roll` section of [about_deployed_mission_site.md](about_deployed_mission_site.md):
- `documentation example: calculate weapon damage ranges correctly`
- `documentation example: handle different weapon types and damage calculations`
- `documentation example: apply damage modifiers correctly`

### Component Tests for Player Actions

#### `web/test/component/PlayerActions.test.tsx` (Additional Tests)

Tests for each `asPlayerAction` entry from `gameStateSlice.ts` (7 player actions total).
These tests primarily test the logic behind clicking the button on the `PlayerActions.tsx` component:

**hireAgent tests:**
- `given player has sufficient money, when 'hire agent' button is clicked, result is correct`
- `given player has insufficient money, when 'hire agent' button is clicked, alert is shown`

**sackAgents tests:**
- `given selection of agents in valid states, when 'sack agents' button is clicked, result is correct`
- `given selection of agents in invalid states, when 'sack agents' button is clicked, alert is shown`

**assignAgentsToContracting tests:**
- `given selection of agents in valid states, when 'assign agents to contracting' button is clicked, result is correct`
- `given selection of agents in invalid states, when 'assign agents to contracting' button is clicked, alert is shown`

**assignAgentsToEspionage tests:**
- `given selection of agents in valid states, when 'assign agents to espionage' button is clicked, result is correct`
- `given selection of agents in invalid states, when 'assign agents to espionage' button is clicked, alert is shown`

**recallAgents tests:**
- `given selection of agents in valid states, when 'recall agents' button is clicked, result is correct`
- `given selection of agents in invalid states, when 'recall agents' button is clicked, alert is shown`

**investigateLead tests:**
- `given sufficient intel and selection of lead in valid state, when 'investigate lead' button is clicked, result is correct`
- `given insufficient intel and selection of lead in valid state, when 'investigate lead' button is clicked, alert is shown`

**deployAgentsToMission tests:**
- `given selection of agents in valid states, when 'deploy agents to active mission site' button is clicked, result is correct`
- `given selection of agents in invalid states, when 'deploy agents to active mission site' button is clicked, alert is shown`

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

- Component tests (including player action tests) should use appropriate fixtures and state arrangements
- Tests should be isolated and not depend on other tests
- Use `beforeEach` to reset state when needed

### Documentation Verification Tests

- Documentation example tests should verify that the exact examples shown in the documentation work correctly
- These tests serve as living documentation - if the implementation changes, either the tests or
  documentation should be updated
- Tests should reference specific sections of documentation files to maintain traceability

## File Changes Summary

### Files to Delete

- `web/test/unit/eventsMiddleware.test.ts`
- `web/test/unit/settingsSlice.test.ts`
- `web/test/unit/fixtures.example.test.ts`
- `web/test/unit/initialState.test.ts`

### Files to Create

- `web/test/unit/evaluateBattle.test.ts`
- `web/test/unit/evaluateTurn.test.ts`
- `web/test/unit/agentRecovery.test.ts`
- `web/test/unit/contestRolls.test.ts`
- `web/test/unit/weaponDamageRolls.test.ts`

### Files to Modify

- `web/test/component/PlayerActions.test.tsx` - Add additional player action tests with alert scenarios

This comprehensive approach ensures complete coverage of the core game logic while verifying that
documentation examples remain accurate and functional.
