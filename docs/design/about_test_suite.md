# About test suite

This file specifies the test suite for the project.

For how to run tests and more on vitest setup, see [About vitest](../setup/about_vitest.md).

## E2E Tests

## AppE2E.test.tsx

### Test: Execute subset of core logic and verify the game does not crash

This test makes the player play the game starting in debug state, exercising following core logic:

- Turn advancement
- Mission evaluation
- Lead investigation
- Mission deployment
- Agent hiring
- Game termination as lost due to lack of money
- Game reset

Specifically:

Given:
- Game launched with a debug state in turn 1, that includes:
  - A lead "Criminal organizations".
  - A mission with ID "000".
  - A deployed mission.
  - Agents with ID "000", "001" and "002", all in "Available" state.
When: user clicks "Advance turn" button.
Then:
- Mission evaluates
- Turn advances
- Mission with ID "000" now appears in "Archived missions".

Next, in turn 2:

When: user selects "Criminal organizations" lead and clicks "Investigate lead" button.
Then:
- The lead now appears in "Archived leads".

Next, in turn 2:

When:
- Player selects mission with ID "001"
- Player selects agents with ID "000", "001" and "002"
- Player clicks "Deploy agents" button

Then:
- Mission with ID "001" still appears in "Missions" but with "Status: Deployed".

Next, still in turn 2:

When:
- Player repeats clicking "Hire agent" button until "New $ balance" in "Balance sheet" shows negative value.
- Player clicks "Advance turn" button.
Then:
- Turn advances.
- In place of "Advance turn" button, a disabled "Game over" button appears.

Next, in turn 3:

When:
- Player unfolds "Reset controls" section.
- Player clicks "Restart game" button.
Then:
- Game resets to turn 1.
- There are no missions, normal nor archived.
- There is only one lead: "Criminal organizations".
- There are no archived leads.
- There are no agents.

## Component Tests

### App.test.tsx

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

## Model/Logic Tests

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
