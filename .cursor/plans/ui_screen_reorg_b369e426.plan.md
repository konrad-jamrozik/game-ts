---
name: UI Screen Reorg
overview: Move Turn Report and faction details out of the main command center, tighten Situation Report into a compact summary next to Operations, and fold AI Player into Game Controls with consistent padding.
todos:
  - id: navigation-foundation
    content: Add Turn Report and Factions navigation flags, routes, and Game Controls buttons.
    status: pending
  - id: turn-report-screen
    content: Move Turn Report from command center into a standalone screen.
    status: pending
  - id: factions-screen
    content: Move faction detail tables from Situation Report into a standalone Factions screen.
    status: pending
  - id: situation-layout
    content: Make Situation Report a compact side card with panic and faction next-operation summary.
    status: pending
  - id: ai-player-section
    content: Move AI Player into Game Controls and fix dropdown padding.
    status: pending
  - id: verify-ui
    content: Run qcheck and browser-verify the updated UI layout and screens.
    status: pending
isProject: false
---

# UI Screen Reorg Plan

## Scope
- Add separate `Turn Report` and `Factions` screens following the existing screen pattern used by `LeadsScreen`, `MissionsScreen`, `AgentsScreen`, and `UpgradesScreen`.
- Keep the main command-center right area focused on `Operations` plus a narrow `Situation Report` card placed beside it.
- Move `AI Player` into `Game Controls` as a subsection and fix the dropdown top padding using the shared card content padding constant.

## Phase 1: Navigation Foundation
- Update `[web/src/redux/slices/selectionSlice.ts](web/src/redux/slices/selectionSlice.ts)` with `viewTurnReport` and `viewFactions` flags plus set/clear reducers.
- Ensure all `setView*` reducers clear the two new flags, and `clearAllSelection` clears them too.
- Update `[web/src/components/App.tsx](web/src/components/App.tsx)` to route to `TurnReportScreen` and `FactionsScreen` before the command-center layout.
- Add `Turn Report` and `Factions` buttons to `[web/src/components/GameControls/GameControls.tsx](web/src/components/GameControls/GameControls.tsx)`.

## Phase 2: Parallel Screen Extractions
- Turn Report stream:
  - Add `[web/src/components/TurnReport/TurnReportScreen.tsx](web/src/components/TurnReport/TurnReportScreen.tsx)` using the same `Box`, `Stack`, `Back to command center`, and `Escape` close pattern as existing screens.
  - Reuse the current `[web/src/components/TurnReport/TurnReportCard.tsx](web/src/components/TurnReport/TurnReportCard.tsx)` content on the new screen.
  - Remove `TurnReportCard` from the command-center branch in `[web/src/components/App.tsx](web/src/components/App.tsx)`.
- Factions stream:
  - Add `[web/src/components/Factions/FactionsScreen.tsx](web/src/components/Factions/FactionsScreen.tsx)` and move the discovered-faction detailed tables from `[web/src/components/SituationReportCard.tsx](web/src/components/SituationReportCard.tsx)` into it.
  - Keep faction visibility behavior: use `revealAllFactionProfiles` or discovered factions based on `isFactionDiscovered`.
  - Preserve the existing faction row details and color-bar behavior by reusing or moving the current `getFactionRows` helper.

## Phase 3: Situation Report And Main Layout
- Simplify `[web/src/components/SituationReportCard.tsx](web/src/components/SituationReportCard.tsx)` so it contains:
  - the panic/metric table narrowed to match the Capacity table width style,
  - a new faction next-operation table with headers `Next operation` and `Turns`.
- For the new next-operation table, use faction names in the first column and remaining turns in the second column. Terminated or inactive/no-operation factions should use the same display semantics currently used by `getFactionRows` (`-`, or suppression information where applicable).
- Move `SituationReportCard` beside `[web/src/components/Assets/OperationsCard.tsx](web/src/components/Assets/OperationsCard.tsx)` in the main command-center layout, instead of stacking it below Operations.
- Update `[web/src/components/Common/columnWidths.ts](web/src/components/Common/columnWidths.ts)` and `[web/src/components/Common/widthConstants.ts](web/src/components/Common/widthConstants.ts)` so the Situation Report card is about as narrow as one Operations table column and the panic table matches Capacity-table proportions.

## Phase 4: AI Player Section
- Refactor `[web/src/components/GameControls/AIPlayerCard.tsx](web/src/components/GameControls/AIPlayerCard.tsx)` into an embeddable `AIPlayer`/section component that uses the existing subsection style, similar to `ResetControls`, `DebugActions`, and `DebugSettings`.
- Place it inside `[web/src/components/GameControls/GameControls.tsx](web/src/components/GameControls/GameControls.tsx)` between `ResetControls` and `DebugActions`.
- Remove standalone `AIPlayerCard` rendering from `[web/src/components/App.tsx](web/src/components/App.tsx)`.
- Add top padding around the `AI Player Intellect` dropdown using `CARD_CONTENT_PADDING` from `[web/src/components/styling/theme.tsx](web/src/components/styling/theme.tsx)` so top spacing matches side padding.

## Verification
- Run `qcheck` after implementation.
- Open `http://localhost:5173/game-ts/` and verify:
  - Operations and Situation Report sit side by side with compact widths.
  - Situation Report contains panic plus next-operation summary only.
  - Turn Report and Factions open as standalone screens and close via Back/Escape.
  - AI Player appears inside Game Controls with aligned dropdown padding.
  - No obvious table truncation, excess blank space, or layout overlap.

## Parallelization Notes
- Phase 1 is the shared dependency and should run first.
- After Phase 1, Turn Report screen extraction and Factions screen extraction can run in parallel.
- Situation Report/main layout and AI Player section can also run mostly independently after Phase 1, but the Situation Report task should coordinate with the Factions extraction because both touch `SituationReportCard.tsx`.
- Verification should run last after all streams merge.
