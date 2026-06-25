# About test suite

This file specifies the unit and component test suite for the project.

- [About test suite](#about-test-suite)
- [Test suite design](#test-suite-design)
  - [E2E tests design](#e2e-tests-design)
  - [Component tests design](#component-tests-design)
  - [Unit tests design](#unit-tests-design)
- [Test reference](#test-reference)
  - [E2E tests](#e2e-tests)
    - [`e2e/App.test.tsx`](#e2eapptesttsx)
  - [Component tests](#component-tests)
    - [`component/ErrorBoundary.test.tsx`](#componenterrorboundarytesttsx)
    - [`component/EventLog.test.tsx`](#componenteventlogtesttsx)
    - [`component/GameControls.test.tsx`](#componentgamecontrolstesttsx)
    - [`component/AgentManagementActions.test.tsx`](#componentagentmanagementactionstesttsx)
    - [`component/LeadInvestigationActions.test.tsx`](#componentleadinvestigationactionstesttsx)
    - [`component/MissionDeploymentActions.test.tsx`](#componentmissiondeploymentactionstesttsx)
  - [Unit tests](#unit-tests)
    - [`unit/effectiveSkill.test.ts`](#uniteffectiveskilltestts)
    - [`unit/evaluateBattle.test.ts`](#unitevaluatebattletestts)
    - [`unit/evaluateDeployedMission.test.ts`](#unitevaluatedeployedmissiontestts)
    - [`unit/evaluateTurn.test.ts`](#unitevaluateturntestts)
    - [`unit/gameStateChecks.test.ts`](#unitgamestatecheckstestts)

For how to run tests and more on vitest setup, see [About vitest](../setup/about_vitest.md).

# Test suite design

The test suite is designed to have the tests as described below.

As appropriate tests use `debugInitialState` to arrange the game state, possibly modifying it further,
e.g. by ensuring appropriate items are selected.

## E2E tests design

E2E tests are tests that test the entire application, meaning they render the entire `App.tsx` component.

There is one E2E test: a full-App boot/smoke test that renders the app with the debug state and advances
a turn, guarding the overall wiring. Per-action behavior and game-over rules are covered by the component
and unit tests. For details, refer to [About E2E test suite](./about_e2e_tests.md).

There are no other E2E tests.

## Component tests design

Tests that render the component and test it by interacting with it.

One happy path test per component, rendering the component:

- Tests for `GameControls.tsx`:
  - Tests for `Next turn` button.
  - Tests for `Reset game` button.

- Tests for split player action components:
  - Agent management actions.
  - Lead investigation actions.
  - Mission deployment actions.
  - Note: these tests arrange appropriate selection of agents, leads, mission sites, etc.

- Tests for `EventLog.tsx`.

- Tests for `ErrorBoundary.tsx`.

There are no other component tests.

## Unit tests design

Tests that directly test the logic, without depending on react or simulating it.

Tests that test directly the function powering the `GameControls.tsx` component:
- Tests for `evaluateTurn.ts` (happy path and player-lost-by-upkeep path)
- Tests for `gameStateChecks.ts` (`isGameLost`, `isGameWon`, `isGameEnded`)
- (🚧 needs review) Tests for `evaluateDeployedMission.ts`, which is invoked from `evaluateTurn.ts`
- Tests for `evaluateBattle.ts`, which is invoked from `evaluateDeployedMission.ts`

Tests that verify correctness of select ruleset:

- Effective skill - documented in `Effective skill` section of [about_agents.md](about_agents.md).
- contest roll
  - documented in `Contest roll` section of [about_deployed_mission_site.md](about_deployed_mission_site.md).
- (🚧 not implemented yet) agent recovery from lost hit points
  - documented in `Agent lost hit points and recovery` section of [about_agents.md](about_agents.md).
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

### `e2e/App.test.tsx`

- App boots with debug state and advances a turn

## Component tests

### `component/ErrorBoundary.test.tsx`

- ErrorBoundary -> happy path (no error)
- ErrorBoundary -> error

### `component/EventLog.test.tsx`

- EventLog -> happy path: no events
- EventLog -> happy path: events
- EventLog -> happy path: new game started

### `component/GameControls.test.tsx`

- click 'next turn' button -> happy path
- click 'reset game' button -> happy path

### `component/AgentManagementActions.test.tsx`

- selected-agent action buttons are disabled when no agents are selected
- click 'hire agent' button -> happy path
- click 'hire agent' button -> alert: insufficient funds
- click 'sack agents' button -> happy path
- click 'sack agents' button -> alert: agents in invalid states
- click 'assign agents to contracting' button -> happy path
- click 'assign agents to contracting' button -> alert: agents in invalid states
- click 'recall agents' button -> happy path
- click 'recall agents' button -> alert: agents in invalid states

### `component/LeadInvestigationActions.test.tsx`

- click 'investigate lead' button -> happy path
- 'investigate lead' button is disabled when no agents selected

### `component/MissionDeploymentActions.test.tsx`

- click 'deploy agents to active mission' button -> happy path
- click 'deploy agents to active mission' button -> happy path with ready training agent
- click 'deploy agents to active mission' button -> alert: contracting agent is not ready
- click 'deploy agents to active mission' button -> alert: in-transit agent is not ready
- click 'deploy agents to active mission' button -> alert: exhausted agent is not ready
- click 'deploy agents to active mission' button -> alert: transport cap exceeded by deployed missions

## Unit tests

### `unit/evaluateTurn.test.ts`

- happy path
- player lost

### `unit/gameStateChecks.test.ts`

- isGameLost -> lost when money is negative
- isGameLost -> lost when panic reaches 100%
- isGameLost -> not lost in a healthy state
- isGameWon -> won when "Peace on Earth" lead has been investigated
- isGameWon -> not won when "Peace on Earth" lead has not been investigated
- isGameEnded -> ended when the game is lost
- isGameEnded -> ended when the game is won
- isGameEnded -> not ended in a healthy in-progress state

### `unit/evaluateDeployedMission.test.ts`

- _(TODO - review)_ success
- _(TODO - review)_ agent KIA
- _(TODO - review)_ failure: all agents terminated

### `unit/evaluateBattle.test.ts`

- 1 agent defeats 1 enemy in 1 attack
- 1 enemy defeats 1 agent in 1 attack
- 1 enemy causes 1 agent to retreat

### `unit/effectiveSkill.test.ts`

- no exhaustion, no hit points lost
- exhaustion only
- hit points lost only
- exhaustion and hit points lost
- high exhaustion
- 100% exhaustion
- 105% exhaustion
- zero hit points
- zero max hit points
