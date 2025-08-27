# About test suite

This file specifies the unit and component test suites for the project.

- [About test suite](#about-test-suite)
- [Test suite design](#test-suite-design)
  - [E2E tests design](#e2e-tests-design)
  - [Component tests design](#component-tests-design)
  - [Unit tests design](#unit-tests-design)
- [Test reference](#test-reference)
  - [E2E tests](#e2e-tests)
    - [`web/test/e2e/App.test.tsx`](#webteste2eapptesttsx)
  - [Component tests](#component-tests)
    - [`web/test/component/ErrorBoundary.test.tsx`](#webtestcomponenterrorboundarytesttsx)
    - [`web/test/component/EventLog.test.tsx`](#webtestcomponenteventlogtesttsx)
    - [`web/test/component/GameControls.test.tsx`](#webtestcomponentgamecontrolstesttsx)
    - [`web/test/component/PlayerActions.test.tsx`](#webtestcomponentplayeractionstesttsx)
  - [Unit tests](#unit-tests)
    - [`web/test/unit/effectiveSkill.test.ts`](#webtestuniteffectiveskilltestts)
    - [`web/test/unit/evaluateBattle.test.ts`](#webtestunitevaluatebattletestts)
    - [`web/test/unit/evaluateDeployedMissionSite.test.ts`](#webtestunitevaluatedeployedmissionsitetestts)
    - [`web/test/unit/evaluateTurn.test.ts`](#webtestunitevaluateturntestts)

For how to run tests and more on vitest setup, see [About vitest](../setup/about_vitest.md).

# Test suite design

The test suite is designed to have the tests as described below.

As appropriate tests use `debugInitialState` to arrange the game state, possibly modifying it further,
e.g. by ensuring appropriate items are selected.

## E2E tests design

E2E tests are tests that test the entire application, meaning they render the entire `App.tsx` component.

(🚧 needs review) There is one E2E test covering some core logic like "advance turn".
For details, refer to [About E2E test suite](./about_e2e_test_suite.md).

There are no other E2E tests.

## Component tests design

Tests that render the component and test it by interacting with it.

One happy path test per component, rendering the component:

- Tests for `GameControls.tsx`:
  - Tests for `Advance turn` button.
  - Tests for `Restart game` button.

- (🚧 stub) Tests for `PlayerActions.tsx`:
  - For each player action:
    - One happy path test
    - One test resulting in alert
  - Note: these tests arrange appropriate selection of agents, leads, missions, etc.
  - Currently only `hire agent` happy path is implemented.

- Tests for `EventLog.tsx`.

- Tests for `ErrorBoundary.tsx`.

There are no other component tests.

## Unit tests design

Tests that directly test the logic, without depending on react or simulating it.

Tests that test directly the function powering the `GameControls.tsx` component:
- (🚧 stub) Tests for `evaluateTurn.ts`
- (🚧 needs review) Tests for `evaluateDeployedMissionSite.ts`, which is invoked from `evaluateTurn.ts`
- (🚧 stub) Tests for `evaluateBattle.ts`, which is invoked from `evaluateDeployedMissionSite.ts`

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

All tests are in `web/test/`. Below are all test names grouped by type (e2e, component, unit) and by file name:

## E2E tests

### `web/test/e2e/App.test.tsx`

- Execute subset of core logic and verify the game does not crash

## Component tests

### `web/test/component/ErrorBoundary.test.tsx`

- ErrorBoundary -> happy path (no error)
- ErrorBoundary -> error

### `web/test/component/EventLog.test.tsx`

- EventLog -> happy path: no events
- EventLog -> happy path: events
- EventLog -> happy path: new game started

### `web/test/component/GameControls.test.tsx`

- click 'advance turn' button -> happy path
- click 'restart game' button -> happy path

### `web/test/component/PlayerActions.test.tsx`

- click 'hire agent' button -> happy path
- _(TODO)_ click 'hire agent' button -> alert: insufficient money
- _(TODO)_ click 'sack agents' button -> happy path
- _(TODO)_ click 'sack agents' button -> alert: agents in invalid states
- _(TODO)_ click 'assign agents to contracting' button -> happy path
- _(TODO)_ click 'assign agents to contracting' button -> alert: agents in invalid states
- _(TODO)_ click 'assign agents to espionage' button -> happy path
- _(TODO)_ click 'assign agents to espionage' button -> alert: agents in invalid states
- _(TODO)_ click 'recall agents' button -> happy path
- _(TODO)_ click 'recall agents' button -> alert: agents in invalid states
- _(TODO)_ click 'investigate lead' button -> happy path
- _(TODO)_ click 'investigate lead' button -> alert: insufficient intel
- _(TODO)_ click 'deploy agents to active mission site' button -> happy path
- _(TODO)_ click 'deploy agents to active mission site' button -> alert: agents in invalid states

## Unit tests

### `web/test/unit/effectiveSkill.test.ts`

- effective skill: no exhaustion, no hit points lost
- effective skill: exhaustion only
- effective skill: hit points lost only
- effective skill: exhaustion and hit points lost
- effective skill: high exhaustion
- effective skill: 100% exhaustion
- effective skill: 105% exhaustion
- effective skill: zero hit points
- effective skill: zero max hit points

### `web/test/unit/evaluateBattle.test.ts`

- _(TODO)_ evaluateBattle -> happy path: player won
- _(TODO)_ evaluateBattle -> happy path: player lost

### `web/test/unit/evaluateDeployedMissionSite.test.ts`

- evaluateDeployedMissionSite -> success
- evaluateDeployedMissionSite -> agent KIA
- evaluateDeployedMissionSite -> failure: all agents terminated

### `web/test/unit/evaluateTurn.test.ts`

- _(TODO)_ evaluateTurn -> happy path
- _(TODO)_ evaluateTurn -> happy path: player lost
