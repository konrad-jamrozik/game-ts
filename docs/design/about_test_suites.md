# About test suite

This file specifies the unit and component test suites for the project.

For how to run tests and more on vitest setup, see [About vitest](../setup/about_vitest.md).

# Test suite design

The test suite is designed to have the tests as described below.

As appropriate tests use `debugInitialState` to arrange the game state, possibly modifying it further,
e.g. by ensuring appropriate items are selected.

## E2E tests

E2E tests are tests that test the entire application, meaning they render the entire `App.tsx` component.

There is one E2E test covering some core logic like "advance turn". For details, refer to [About E2E test suite](./about_e2e_test_suite.md).

There are no other E2E tests

## Component tests

Tests that render the component and test it by interacting with it.

One happy path test per component, rendering the component:

- Tests for `GameControls.tsx`:
  - Test to show "Advance turn" works.
  - Test to show "Restart game" works.

- Test to show an event appears in the `EventLog.tsx`.

- Test to show that `ErrorBoundary` works.

- Tests that directly test the logic behind `PlayerActions.tsx`:
  - Few tests for each player action - basically all "asPlayerAction" entries in `gameStateSlice.ts`
    - These tests primarily test the logic behind clicking the button on the `PlayerActions.tsx` component.
    - At least one test for each button happy path, and at least one test resulting in alert.
    - These tests arrange appropriate selection of agents, leads, missions, etc.

There are no other component tests.

## Unit tests

Tests that directly test the logic, without depending on react or simulating it.

Tests that directly test the logic behind `GameControls.tsx`:
- Multiple tests for `evaluateBattle.ts`
- Multiple tests for `evaluateTurn.ts`
- Multiple tests for `evaluateDeployedMissionSite.ts`

Tests that verify correctness of the following examples in documentation:

- Tests for effective skill examples documented in `Effective skill` section of [about_agents.md](about_agents.md).
- Tests for hit points recovery examples documented in `Agent lost hit points and recovery` section of [about_agents.md](about_agents.md).
- Tests for contest rolls examples documented in `Contest roll` section of [about_deployed_mission_site.md](about_deployed_mission_site.md).
- Tests for weapon damage rolls examples documented in `Range roll` section of [about_deployed_mission_site.md](about_deployed_mission_site.md).

There are no other unit tests.

# List of tests

TODO: this list of tests needs an update once the plan above is implemented. This means appropriate
obsolete tests should be removed.

## Component Tests

### GameControls.test.tsx

- "When 'advance turn' button is clicked, the turn advances"
- "Given an in-progress game state, when the 'restart game' button is clicked, the game state is reset"

### PlayerActions.test.tsx

- "When 'hire agent' button is pressed, agents counter is incremented from 0 to 1"

### ErrorBoundary.test.tsx

- "render children when no error occurs"
- "render error UI with Wipe IndexedDB button when error occurs"
- "have clickable Wipe IndexedDB button"

### EventLog.test.tsx

- "displays 'No events yet' when there are no events"
- "displays events when they exist in the state"
- "shows 'New game started' event when store initializes without persisted state"

## Unit Tests

### AgentView.test.ts

**effectiveSkill tests:**
- "calculate effective skill correctly with no exhaustion and no hit points lost"
- "calculate effective skill correctly with exhaustion only"
- "calculate effective skill correctly with hit points lost only"
- "calculate effective skill correctly with both exhaustion and hit points lost"
- "handle high exhaustion correctly"
- "handle 100% exhaustion correctly"
- "handle zero hit points correctly"
- "handle zero max hit points correctly"

### initialState.test.ts

- "debug initial state passes agent invariant validation"

### evaluateDeployedMissionSite.test.ts

**deployedMissionSiteUpdate tests:**
- "evaluate a deployed mission site with successful combat"
- "handle agent termination correctly"
- "handle mission failure with all agents terminated"

## State Management Tests

### eventsMiddleware.test.ts

**Events Middleware tests:**
- "creates event when advancing turn"
- "creates event when hiring agent"
- "does not create event when resetting game and clears events"
- "does not create event when undoing action"
- "does not create event when redoing action"
- "does not create event when resetting turn"

### settingsSlice.test.ts

**settingsSlice tests:**
- "return the initial state"
- "setResetControlsExpanded should set the expanded state"
- "toggleResetControlsExpanded should toggle the expanded state"

## Fixture and Example Tests

### fixtures.example.test.ts

**Fixture Usage Examples:**

#### Agent Fixtures

- "create different agent types"
- "create agent teams"
- "compose agent states"

#### Game State Fixtures

- "create different game phases"
- "compose game states with specific conditions"
- "use builder methods for specific scenarios"

#### Mission and Enemy Fixtures

- "create mission sites with different enemy compositions"
- "create enemy forces for testing combat"

#### Lead Campaign Fixtures

- "create lead dependency chains"

#### Fixture Composition

- "create complex test scenario"

#### Test Data Generation

- "generate multiple unique entities"
- "reset counters for test isolation"
