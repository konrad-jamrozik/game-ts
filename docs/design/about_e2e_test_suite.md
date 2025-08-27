# About test suite

This file specifies the e2e test suite for the project.

For how to run tests and more on vitest setup, see [About vitest](../setup/about_vitest.md).

For other test suites, see [About test suites](./about_test_suites.md).

## E2E Tests

## App.test.tsx

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
