# About test suite

This file specifies the unit and component test suites for the project.

For how to run tests and more on vitest setup, see [About vitest](../setup/about_vitest.md).

# Test suite design

The test suite is designed to have the tests as described below.

As appropriate tests use `debugInitialState` to arrange the game state, possibly modifying it further,
e.g. by ensuring appropriate items are selected.

## E2E tests design

E2E tests are tests that test the entire application, meaning they render the entire `App.tsx` component.

There is one E2E test covering some core logic like "advance turn". For details, refer to [About E2E test suite](./about_e2e_test_suite.md).

There are no other E2E tests

## Component tests design

Tests that render the component and test it by interacting with it.

One happy path test per component, rendering the component:

- Tests for `GameControls.tsx`:
  - Tests for `Advance turn` button.
  - Tests for `Restart game` button.

- Tests that test exercising  `PlayerActions.tsx`:
  - For each player action:
    - One happy path test
    - One test resulting in alert
  - Note: these tests arrange appropriate selection of agents, leads, missions, etc.

- Tests for  `EventLog.tsx`.

- Tests for  `ErrorBoundary`.

There are no other component tests.

## Unit tests design

Tests that directly test the logic, without depending on react or simulating it.

Tests that test directly the function powering the `GameControls.tsx` component:
- Tests for `evaluateTurn.ts`
- Tests for `evaluateDeployedMissionSite.ts`, which is invoked from `evaluateTurn.ts`
- Tests for `evaluateBattle.ts`, which is invoked from `evaluateDeployedMissionSite.ts`

Tests that verify correctness of select ruleset:

- Effective skill - documented in `Effective skill` section of [about_agents.md](about_agents.md).
- (🚧 not implemented yet) agent recovery from lost hit points
  - documented in `Agent lost hit points and recovery` section of [about_agents.md](about_agents.md).
- (🚧 not implemented yet) contest roll
  - documented in `Contest roll` section of [about_deployed_mission_site.md](about_deployed_mission_site.md).
- (🚧 not implemented yet) weapon damage roll
  - documented in `Weapon damage roll` section of [about_deployed_mission_site.md](about_deployed_mission_site.md).
- (🚧 not implemented yet) contracting and espionage output
  - documented in `Contracting and espionage assignments` section of [about_agents.md](about_agents.md).
- (🚧 not implemented yet) exhaustion
  - documented in `Agent exhaustion` section of [about_agents.md](about_agents.md).
- (🚧 not implemented yet) panic and supporting values: faction threat values and suppression
  - not documented yet.

There are no other unit tests.

# Test reference

TODO: list here all test names, grouped by type (e2e, component, unit), and by file name.
