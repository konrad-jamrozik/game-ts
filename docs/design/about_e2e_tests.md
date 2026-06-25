# About e2e tests

This file specifies the e2e tests for the project.

For how to run tests and more on vitest setup, see [About vitest](../setup/about_vitest.md).

For the full test suite design, see [About test suite](./about_test_suite.md).

## E2E Tests

E2E tests render the entire `App` component (with the real Redux store and the
events/persistence middleware) to guard the overall application wiring.

Per-action behavior (advance turn, hire/sack agents, investigate leads, deploy
missions, reset game) is covered more thoroughly by the component tests, and the
turn-evaluation and game-over rules are covered by the unit tests. The e2e suite
therefore intentionally stays minimal and only verifies that the whole app boots
and that a turn can be advanced end to end.

## App.test.tsx

### Test: App boots with debug state and advances a turn

A full-App boot/smoke test.

Given:
- The app is rendered with the debug initial state (see
  `bldInitialState({ debug: true })` in
  [gameStateFactory.ts](../../web/src/lib/factories/gameStateFactory.ts), which
  builds the rich debug fixture defined in
  [debugGameStateFactory.ts](../../web/src/lib/factories/debugGameStateFactory.ts)).

Then:
- The app renders without crashing in turn 1.
- The debug fixture is visible (e.g. the "Criminal organizations" lead and the
  "agent-000" row).

When: the user clicks the Game Controls "Next turn" button.

Then: the turn advances to 2.
