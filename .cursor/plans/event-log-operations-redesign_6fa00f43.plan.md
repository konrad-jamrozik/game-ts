---
name: event-log-operations-redesign
overview: Redesign the home screen event log as a DataGrid with row-level undo/redo, and fold Situation Report into the Operations card with the requested compact/collapsed behavior.
todos:
  - id: event-grid
    content: Convert EventLog from expandable list to StyledDataGrid with Event/T#/A#/Undo columns.
    status: in_progress
  - id: event-time-travel
    content: Add row-level undo/redo jump logic over the existing redux-undo timeline.
    status: pending
  - id: operations-nesting
    content: Move Situation Report under Operations and remove the standalone home-screen card.
    status: pending
  - id: operations-collapse
    content: Add Operations-only collapsed title/width behavior through ExpandableCard props.
    status: pending
  - id: situation-two-column
    content: "Render Situation Report as two columns: Next operation left, Metric/Panic right."
    status: pending
  - id: verification
    content: Update focused tests and run qcheck.
    status: pending
isProject: false
---

# Event Log And Operations Redesign

## Relevant Current Shape

- [`web/src/components/EventLog.tsx`](web/src/components/EventLog.tsx) is currently an `ExpandableCard` containing a MUI `List`; it filters out undone future events before rendering.
- [`web/src/redux/rootReducer.ts`](web/src/redux/rootReducer.ts) already wraps `gameState` and `aiState` in `redux-undo`.
- [`web/src/redux/eventsMiddleware.ts`](web/src/redux/eventsMiddleware.ts) already truncates future events before new player actions, so redo rows naturally disappear after branching.
- [`web/src/components/App.tsx`](web/src/components/App.tsx) currently renders `OperationsCard` and `SituationReportCard` as sibling cards.
- [`web/src/components/Assets/OperationsCard.tsx`](web/src/components/Assets/OperationsCard.tsx) already uses a two-column operations layout.

## Plan

1. Replace the Event Log card/list with a plain `StyledDataGrid` in [`web/src/components/EventLog.tsx`](web/src/components/EventLog.tsx).
   - Columns: `Event`, `T#`, `A#`, `Undo`.
   - Render all retained events, including events ahead of the current undo pointer.
   - Use the existing newest-first event ordering, so “3rd from the top” means the third most recent event.
   - Add/adjust event-log width keys in [`web/src/components/Common/columnWidths.ts`](web/src/components/Common/columnWidths.ts) and [`web/src/components/Common/widthConstants.ts`](web/src/components/Common/widthConstants.ts).
   - Remove `event-log` from bulk expand/collapse IDs in [`web/src/redux/slices/expansionSlice.ts`](web/src/redux/slices/expansionSlice.ts), since it will no longer be collapsible.

2. Implement row-level undo/redo using the existing `redux-undo` state.
   - Build a timeline from `undoable.past`, `undoable.present`, and `undoable.future`.
   - For an `Undo` row, find the history state matching the event’s after-action `(turn, actionsCount)`, then jump to the state immediately before it.
   - For a `Redo` row, jump to the history state matching the event’s `(turn, actionsCount)`.
   - Dispatch `ActionCreators.jump(offset)` where `offset` is relative to the current present index.
   - Disable the button when the required state is unavailable, such as the initial “New game started” event or compacted-away history.

3. Refactor Situation Report into Operations.
   - Extract the reusable body of [`web/src/components/SituationReportCard.tsx`](web/src/components/SituationReportCard.tsx) into a content component, or repurpose the file so `OperationsCard` can render the report without a separate top-level card.
   - Remove the standalone `SituationReportCard` import/render from [`web/src/components/App.tsx`](web/src/components/App.tsx).
   - Render Situation Report as a nested `ExpandableCard` inside [`web/src/components/Assets/OperationsCard.tsx`](web/src/components/Assets/OperationsCard.tsx), keeping `id="situation-report"` so existing expand/collapse-all behavior still controls it.

4. Update Operations collapse behavior.
   - Extend [`web/src/components/Common/ExpandableCard.tsx`](web/src/components/Common/ExpandableCard.tsx) with scoped optional props such as `collapsedTitle` and `collapsedSx`.
   - Use `title="Operations"`, `collapsedTitle="Ops"`, normal expanded width, and a narrow collapsed width for `OperationsCard` only.
   - Keep the existing vertical content collapse, while the card itself shrinks horizontally when collapsed.

5. Make Situation Report two-column inside Operations.
   - Left column: “Next operation” grid.
   - Right column: panic metric grid, with headers `Metric` and `Panic`.
   - Reuse the same `Box display="flex"` + `CARD_GAP` pattern as `OperationsCard`.
   - Update [`web/src/components/Common/widthConstants.ts`](web/src/components/Common/widthConstants.ts) so `OPERATIONS_CARD_WIDTH` accounts for the wider nested two-column Situation Report.

6. Update verification coverage.
   - Update [`web/test/component/EventLog.test.tsx`](web/test/component/EventLog.test.tsx) for the DataGrid headers and row buttons.
   - Add a focused test for undoing multiple top events via one row button, then dispatching a new player action and verifying redo rows disappear.
   - Run `qcheck` after implementation, per repo guidance.
