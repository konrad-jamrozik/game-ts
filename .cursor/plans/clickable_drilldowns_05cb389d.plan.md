---
name: clickable drilldowns
overview: Make command-center summary rows and event-log rows act as typed drilldowns into the existing full-screen views, adding small focused selection/filter state where the destination screen currently lacks the requested filter.
todos:
  - id: selection-state
    content: Add typed drilldown state and open* reducer actions in selectionSlice.
    status: completed
  - id: destination-filters
    content: Update destination screens in parallel after the shared selection contract exists.
    status: completed
  - id: operations-clicks
    content: Wire row click handlers and hover styling for Operations card grids.
    status: completed
  - id: situation-clicks
    content: Wire row click handlers and row identity for Situation Report grids.
    status: completed
  - id: event-log-clicks
    content: Add typed event navigation targets and EventLog row click handling without interfering with Undo/Redo.
    status: completed
  - id: integration-pass
    content: Merge the parallel workstreams and resolve shared selection/action naming.
    status: completed
  - id: verify
    content: Add focused coverage and run qcheck.
    status: completed
isProject: false
---

# Clickable Drilldowns Plan

## Current Shape

- Navigation is already centralized in [`web/src/redux/slices/selectionSlice.ts`](web/src/redux/slices/selectionSlice.ts) via `setViewAgents`, `setViewMissions`, `setViewLeads`, `setViewTurnReport`, `setViewFactions`, `setViewCharts`, and `setViewUpgrades`.
- `StyledDataGrid` in [`web/src/components/Common/StyledDataGrid.tsx`](web/src/components/Common/StyledDataGrid.tsx) forwards MUI DataGrid props, so each grid can add `onRowClick` directly.
- Operations and Situation Report rows are currently display-only. Event Log rows have a separate Undo/Redo button, so row navigation must not fire when that button is clicked.

## State And Routing Changes

- Add typed drilldown state to [`selectionSlice.ts`](web/src/redux/slices/selectionSlice.ts):
  - `agentsFilterType?: 'all' | 'ready' | 'exhausted' | 'away' | 'recovering' | 'terminated' | 'stats'` and replace the current mutually-exclusive agents booleans internally.
  - `missionsFilterType?: 'all' | 'expiringSoon' | 'deployed' | 'archived'` while preserving existing archived behavior through the new normalized value.
  - `leadsDrilldownFilter?: 'all' | 'available' | 'activeInvestigations'` alongside existing `leadsFilterType`.
  - `selectedTurnReportTurn?: number` so Event Log can open historical turn reports without time-traveling the game state.
  - `selectedFactionId?: FactionId` if we want clicked Situation Report faction rows highlighted/selected after opening Factions.
- Add focused action creators like `openAgentsDrilldown(filter)`, `openMissionsDrilldown(filter)`, `openLeadsDrilldown(filter)`, `openTurnReportDrilldown(turn)`, and `openFactionsDrilldown(factionId?)`. These should set the view flag and related filters together so click handlers stay small.

## Row Mappings

- Operations Agents in [`AssetsDataGrid.tsx`](web/src/components/Assets/AssetsDataGrid.tsx):
  - Total -> Agents, `all`
  - Ready -> Agents, `ready`
  - Exhausted -> Agents, `exhausted`
  - Away -> Agents, `away`
  - Recovering -> Agents, `recovering`
- Operations Finances in [`AssetsDataGrid.tsx`](web/src/components/Assets/AssetsDataGrid.tsx):
  - Money -> Charts or Upgrades screen; choose Charts as the read-only detail target unless you prefer the purchasing workflow.
  - Projected -> Charts, ideally focused on Cash Flow once chart focus state exists.
- Capacities in [`CapacitiesDataGrid.tsx`](web/src/components/Assets/CapacitiesDataGrid.tsx):
  - Agent cap / Transport cap / Training cap -> Upgrades with `selectedUpgradeName` set to the clicked capacity.
- Operations Leads in [`OperationsSummaryDataGrids.tsx`](web/src/components/Assets/OperationsSummaryDataGrids.tsx):
  - Investigations -> Leads, `leadsFilterType: 'active'`, `leadsDrilldownFilter: 'activeInvestigations'`
  - Available -> Leads, `leadsFilterType: 'active'`, `leadsDrilldownFilter: 'available'`
- Operations Missions in [`OperationsSummaryDataGrids.tsx`](web/src/components/Assets/OperationsSummaryDataGrids.tsx):
  - Sites -> Missions, `all`
  - Expiring soon -> Missions, `expiringSoon`
  - Deployed -> Missions, `deployed`
- Situation Report in [`SituationReportCard.tsx`](web/src/components/SituationReportCard.tsx):
  - Faction next-operation row -> Factions, optionally selecting/highlighting that faction.
  - Panic row -> Charts, with `chartsTurnRangeFilter: 'currentTurn'` and optional future chart focus on Panic.
- Event Log in [`EventLog.tsx`](web/src/components/EventLog.tsx):
  - TurnAdvancement -> Turn Report for `event.turn` using `selectedTurnReportTurn`.
  - MissionCompleted -> Missions or Mission Details only if the mission still exists in the current/historical view; otherwise open Missions filtered to archived/completed rather than asserting.
  - Text events -> add typed target metadata in [`eventsSlice.ts`](web/src/redux/slices/eventsSlice.ts) and [`eventsMiddleware.ts`](web/src/redux/eventsMiddleware.ts) for known actions: agent actions to Agents, lead investigation actions to Leads, mission deployment to Missions, upgrade purchase to Upgrades, generic/debug text with no target.

## UI Implementation

- Add `onRowClick` handlers to each summary grid rather than making `StyledDataGrid` globally clickable.
- Add shared cursor/hover styling for clickable grids, either as a helper `clickableRowSx` or a small local `sx` pattern.
- For `EventLog`, store the original `GameEvent` on each row or at least a typed navigation target; do not derive behavior from rendered text.
- Prevent the Undo/Redo button in `EventLog` from triggering row navigation by stopping event propagation in `renderTimeTravelButton` or by ignoring clicks on the `timeTravelAction` field.
- Update full-screen grids to honor new filters:
  - [`AgentsDataGrid.tsx`](web/src/components/AgentsDataGrid/AgentsDataGrid.tsx) and [`AgentsToolbar.tsx`](web/src/components/AgentsDataGrid/AgentsToolbar.tsx) should use the single `agentsFilterType`.
  - [`MissionsDataGrid.tsx`](web/src/components/MissionsDataGrid/MissionsDataGrid.tsx) and its toolbar should filter active/deployed/expiring/archived rows from `missionsFilterType`.
  - [`LeadsDataGrid.tsx`](web/src/components/Leads/LeadsDataGrid.tsx) should apply `leadsDrilldownFilter` after its existing active/inactive/archived filter.
  - [`TurnReportCard.tsx`](web/src/components/TurnReport/TurnReportCard.tsx) should use `selectedTurnReportTurn` with `useTurnReportHistory()` and fall back to the current report when unset.
  - [`FactionDetailsDataGrid.tsx`](web/src/components/Factions/FactionDetailsDataGrid.tsx) can accept/select `selectedFactionId` if highlighting is included.

## Parallelization

- Start with one small shared contract PR/task: add the drilldown state, normalized filter types, and `open*Drilldown(...)` reducers in [`selectionSlice.ts`](web/src/redux/slices/selectionSlice.ts). This is the dependency for all other work.
- After that contract exists, split destination screen support by screen. These can be implemented independently because each consumes different state:
  - Agents filter support in [`AgentsDataGrid.tsx`](web/src/components/AgentsDataGrid/AgentsDataGrid.tsx), [`AgentsToolbar.tsx`](web/src/components/AgentsDataGrid/AgentsToolbar.tsx), and [`AgentsDataGridUtils.ts`](web/src/components/AgentsDataGrid/AgentsDataGridUtils.ts).
  - Missions filter support in [`MissionsDataGrid.tsx`](web/src/components/MissionsDataGrid/MissionsDataGrid.tsx) and [`MissionsDataGridToolbar.tsx`](web/src/components/MissionsDataGrid/MissionsDataGridToolbar.tsx).
  - Leads drilldown filtering in [`LeadsDataGrid.tsx`](web/src/components/Leads/LeadsDataGrid.tsx) and any small helper module it needs.
  - Historical Turn Report support in [`TurnReportCard.tsx`](web/src/components/TurnReport/TurnReportCard.tsx) using [`useTurnReportHistory.tsx`](web/src/components/TurnReport/useTurnReportHistory.tsx).
  - Optional faction selection/highlight support in [`FactionsScreen.tsx`](web/src/components/Factions/FactionsScreen.tsx) and [`FactionDetailsDataGrid.tsx`](web/src/components/Factions/FactionDetailsDataGrid.tsx).
- In parallel with destination screens, wire source clicks that only dispatch the new `open*Drilldown(...)` actions:
  - Operations grids in [`AssetsDataGrid.tsx`](web/src/components/Assets/AssetsDataGrid.tsx), [`CapacitiesDataGrid.tsx`](web/src/components/Assets/CapacitiesDataGrid.tsx), and [`OperationsSummaryDataGrids.tsx`](web/src/components/Assets/OperationsSummaryDataGrids.tsx).
  - Situation Report grids in [`SituationReportCard.tsx`](web/src/components/SituationReportCard.tsx) and row identity in [`getSituationReportColumns.tsx`](web/src/components/SituationReport/getSituationReportColumns.tsx).
- Keep Event Log as a separate stream because it touches event model semantics in [`eventsSlice.ts`](web/src/redux/slices/eventsSlice.ts), event production in [`eventsMiddleware.ts`](web/src/redux/eventsMiddleware.ts), and row-level click/Undo interactions in [`EventLog.tsx`](web/src/components/EventLog.tsx).
- Do one final integration pass after the parallel streams merge: verify all source rows call the intended reducer, every destination screen consumes the matching filter, shared hover styling is consistent, and no old mutually-exclusive boolean filter paths remain half-active.

## Verification

- Add focused tests for drilldown reducers and filter selectors/helpers where practical.
- Add component tests for representative clicks: Exhausted agents, Expiring soon missions, Situation Report faction, panic row, and TurnAdvancement event.
- Run `qcheck` after implementation, per project rules.
