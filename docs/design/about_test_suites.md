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
