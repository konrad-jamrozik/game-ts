---
name: Replace e2e with smoke test
overview: Replace the oversized, drifted 12-step e2e in App.test.tsx with a slim full-App boot/smoke test, move the unique "player lost" coverage into fast unit tests, and refresh the two test design docs to match reality.
todos:
  - id: smoke
    content: Replace App.test.tsx body with a slim full-App boot smoke test (render debug state, assert boot, advance one turn)
    status: pending
  - id: unit-evaluateturn
    content: Fill evaluateTurn.test.ts 'player lost' and 'happy path' todos using a low-money/upkeep state and isGameLost assertion
    status: pending
  - id: unit-checks
    content: Add gameStateChecks.test.ts covering isGameLost/isGameWon/isGameEnded
    status: pending
  - id: docs
    content: Rewrite about_e2e_tests.md and update about_test_suite.md to match the new tests and real debug fixture
    status: pending
  - id: verify
    content: Run qcheck and fix any errors
    status: pending
isProject: false
---

# Replace e2e with smoke test + game-over unit coverage

## Why

The 343-line [web/test/e2e/App.test.tsx](web/test/e2e/App.test.tsx) duplicates per-action happy paths already covered better by the component tests (`AgentManagementActions`, `LeadInvestigationActions`, `MissionDeploymentActions`, `GameControls`) and the `evaluate*` unit tests. Its only unique value is (a) booting the whole `App` with the debug fixture and (b) the lose/game-over flow. We keep those two signals cheaply and drop the redundant maintenance.

## 1. Slim the e2e down to a full-App smoke test

Replace the body of [web/test/e2e/App.test.tsx](web/test/e2e/App.test.tsx) (keep the file at the same path; rendering all of `App` is e2e by the project's own definition in [docs/design/about_test_suite.md](docs/design/about_test_suite.md)).

New test does only:
- `beforeEach`: `clearHistory()` + `reset()` (as today).
- Render `App` with the debug state: `reset({ customState: bldInitialState({ debug: true }) })`, then render `<Provider store={getStore()}><App /></Provider>`.
- Assert the app boots without throwing: `Turn:` shows `1`, the Game Controls next-turn button exists (`getGameControlsNextTurnButton()`), and the debug fixture renders (e.g. `Criminal organizations` lead text and an `agent-000` cell are present).
- Click next turn once and assert `Turn:` becomes `2` (exercises real store + events/persist middleware end to end).

Drop all the step3-step12 helpers, the money-parsing helpers, and the `rand.set(...)` mission-rigging. Reuse [web/test/utils/testComponentUtils.ts](web/test/utils/testComponentUtils.ts).

## 2. Move the unique "game over (lost)" coverage into unit tests

Game-over logic is the pure function in [web/src/lib/game_utils/gameStateChecks.ts](web/src/lib/game_utils/gameStateChecks.ts):

```4:6:web/src/lib/game_utils/gameStateChecks.ts
export function isGameLost(gameState: GameState): boolean {
  return f6ge(gameState.panic, toF6(1)) || gameState.money < 0
}
```

- Fill the existing `test.todo('player lost')` in [web/test/unit/evaluateTurn.test.ts](web/test/unit/evaluateTurn.test.ts): build a state via `bldGameState`/`bldInitialState` with several agents and low money/funding so upkeep (`agents.length * AGENT_UPKEEP_COST`, see [web/src/lib/ruleset/moneyRuleset.ts](web/src/lib/ruleset/moneyRuleset.ts)) drives `money` negative; call `evaluateTurn(state)`; assert `state.money < 0` and `isGameLost(state) === true`. This is the direct, deterministic replacement for the e2e lose flow. Also fill the trivial `happy path` (turn increments, not lost).
- Add a small [web/test/unit/gameStateChecks.test.ts](web/test/unit/gameStateChecks.test.ts) covering `isGameLost` (money < 0 true; panic >= 1 true; healthy state false), `isGameWon` (peace-on-earth lead investigated), and `isGameEnded`.

## 3. Update the docs to match reality

- Rewrite [docs/design/about_e2e_tests.md](docs/design/about_e2e_tests.md): replace the stale 12-step narrative and the wrong debug-state assumptions (it claimed only agents 000/001/002 exist; the debug fixture in [web/src/lib/factories/debugGameStateFactory.ts](web/src/lib/factories/debugGameStateFactory.ts) seeds 18 agents across many states, two missions, and a seeded lead investigation) with a short description of the new smoke test.
- Update [docs/design/about_test_suite.md](docs/design/about_test_suite.md): E2E section -> "one full-App smoke test (boots + advances one turn)"; add the `gameStateChecks` unit test and mark `evaluateTurn` happy/player-lost as implemented; fix component-test names from `advance turn`/`restart game` to `next turn`/`reset game` to match the actual tests.

## 4. Verify

Run `qcheck` and fix any type/lint errors.

## Net effect

- Lose: ~330 lines of redundant, drift-prone e2e.
- Keep: full-App boot/wiring smoke signal + deterministic, faster game-over coverage; per-action behavior already covered by component tests.
