---
name: event-log-world-events
overview: Add non-action world events to the event log while keeping player/debug actions undoable, with work split into event model/UI, transition detection, middleware wiring, and tests.
todos:
  - id: event-row-contract
    content: Add event metadata/action creator support for action-controlled rows versus world-event rows.
    status: pending
  - id: event-log-ui
    content: Render blank A# and no time-travel button for world-event rows in EventLog.
    status: pending
  - id: world-event-detectors
    content: Implement pure previous/current state detectors for requested mission, investigation, and lead events.
    status: pending
  - id: middleware-wiring
    content: Dispatch world events after player actions and turn advancement while preserving truncation and compaction behavior.
    status: pending
  - id: debug-action-events
    content: Add event log text for all undoable player actions currently missing from the event log.
    status: pending
  - id: verification
    content: Add focused tests and run qcheck.
    status: pending
isProject: false
---

# Event Log World Events Plan

## Current Shape

- [`web/src/redux/eventsMiddleware.ts`](web/src/redux/eventsMiddleware.ts) logs only explicitly matched actions after reducers run. Debug actions are `asPlayerAction(...)`, so they enter undo history and increment `actionsCount`, but no middleware branch posts their event text.
- [`web/src/redux/slices/eventsSlice.ts`](web/src/redux/slices/eventsSlice.ts) stores every event with `turn` and `actionsCount`; keep those internally for truncation/compaction, even when the UI displays no `A#`.
- [`web/src/components/EventLog.tsx`](web/src/components/EventLog.tsx) currently assumes every event row should compute an undo/redo target from `(turn, actionsCount)`.
- Turn advancement already creates `turnStartReport` in [`web/src/redux/reducers/gameControlsReducers.ts`](web/src/redux/reducers/gameControlsReducers.ts); mission results and completed investigations are in [`web/src/lib/model/turnReportModel.ts`](web/src/lib/model/turnReportModel.ts). Newly available leads require a before/after diff using [`web/src/lib/model_utils/leadUtils.ts`](web/src/lib/model_utils/leadUtils.ts).

## Parallel Workstreams

1. Define the event row contract in [`web/src/redux/slices/eventsSlice.ts`](web/src/redux/slices/eventsSlice.ts) and [`web/src/components/EventLog.tsx`](web/src/components/EventLog.tsx).
   - Add a flag or event subtype that distinguishes rows with action controls from world-event rows.
   - Existing player-action text rows and `TurnAdvancement` rows keep `A#` plus Undo/Redo behavior.
   - New world-event rows keep internal `turn`/`actionsCount`, but render an empty `A#` cell and no time-travel button.
   - This can be implemented independently once the action creator shape is chosen, for example `addWorldTextEvent(...)` alongside existing action text events.

2. Build pure world-event detection helpers, ideally in a new focused module such as [`web/src/redux/eventLogWorldEvents.ts`](web/src/redux/eventLogWorldEvents.ts).
   - Compare previous/current `GameState` to emit `New mission site available: <name>. Expires in X turns.` for newly added active missions.
   - Emit `Expires in X turns: <name>` when an existing active mission's numeric `expiresIn` changes to `3`, `2`, or `1`.
   - Emit `Mission successful: <name>` for turn-report mission outcomes of `Won`; emit `Mission failed: <name>` for other deployed mission outcomes such as `Retreated` or `Wiped`.
   - Emit `Investigation completed: <name>` when an active investigation becomes `Done`, and `Investigation abandoned: <name>` when it becomes `Abandoned`.
   - Compare `getAvailableLeadsForInvestigation(previousGameState)` to the current result and emit `New one-time lead available: <name>` or `New repeatable lead available: <name>` for leads newly entering the available set.
   - Return ordered message descriptors rather than dispatching; that keeps this work testable without Redux/MUI.

3. Wire events in [`web/src/redux/eventsMiddleware.ts`](web/src/redux/eventsMiddleware.ts).
   - Capture previous `gameState` before `next(action)`, then run normal reducers.
   - For `advanceTurn`, continue asserting `turnStartReport`, logging `Advanced to turn N`, compacting history, and compacting events.
   - After player actions and `advanceTurn`, call the world-event helper and dispatch each result via the new world-event action creator.
   - Preserve branch truncation before player actions/turn advancement so future world events disappear when the user branches after undo.
   - Keep undo/redo/jump actions silent.

4. Add player-action log entries for every undoable player action currently missing from [`web/src/redux/eventsMiddleware.ts`](web/src/redux/eventsMiddleware.ts).
   - Import and match all 9 missing `asPlayerAction(...)` action creators from [`web/src/redux/slices/gameStateSlice.ts`](web/src/redux/slices/gameStateSlice.ts): `addAgentsToInvestigation`, `debugAddEverything`, `debugSetPanicToZero`, `debugSetAllFactionsSuppression`, `debugAddMoney`, `debugSpawn10Agents`, `debugAddCapabilities`, `debugSpawnMissions`, and `debugTerminateRedDawn`.
   - Post action-control text rows for all of them so they show `A#` and Undo/Redo.
   - Keep this list in sync with the repo rule that every `asPlayerAction(...)` reducer appears in the event log.

5. Test in parallel once the event-row contract exists.
   - Add pure helper tests for mission creation, mission countdown warnings, mission success/failure, investigation completion/abandonment, and newly available lead detection.
   - Update [`web/test/component/EventLog.test.tsx`](web/test/component/EventLog.test.tsx) so world-event rows show no `A#` value and no Undo/Redo button, while existing action rows still time travel.
   - Add middleware/store coverage proving a debug action creates an action row with `actionsCount > 0`, and that world events created in the same dispatch remain non-action rows.
   - Run `qcheck` after implementation.

## Suggested Merge Order

- First merge the event-row contract and UI rendering change with a minimal world-event fixture test.
- Then merge pure world-event detection helpers and tests.
- Then merge middleware wiring plus debug action labels.
- Finish with integration tests and `qcheck`.
