# About test suite

This file specifies the unit and component test suites for the project.

For how to run tests and more on vitest setup, see [About vitest](../setup/about_vitest.md).

## Component Tests

### GameControls.test.tsx

- "When 'hire agents' button is pressed, agents counter is incremented from 0 to 1"
- "When 'advance turn' button is clicked, the turn advances"
- "Given an in-progress game state, when the 'restart game' button is clicked, the game state is reset"

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

### updateDeployedMissionSite.test.ts

**deployedMissionSiteUpdate tests:**
- "update a deployed mission site with successful combat"
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
