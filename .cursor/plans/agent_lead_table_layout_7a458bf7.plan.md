---
name: agent lead table layout
overview: Update the Agents and Leads screens so their DataGrids render directly on the page, with stable Agents-table sizing, filter-local counts, and left-side action buttons.
todos:
  - id: direct-grid-width
    content: Add optional explicit width support to StyledDataGrid.
    status: completed
  - id: agents-grid-layout
    content: Render AgentsDataGrid directly, stabilize its width, and add filter counts.
    status: completed
  - id: screen-action-layout
    content: Move Agents buttons left of the table and widen shared screen action buttons.
    status: completed
  - id: leads-direct-grids
    content: Render Leads view tables directly and rename the agent ID column to Agent.
    status: completed
  - id: verify
    content: Run qcheck and inspect relevant lints after changes.
    status: completed
isProject: false
---

# Agents And Leads Table Layout

## Scope

- Change only the Agents and Leads screen layouts and the shared grid components needed to support direct table rendering.
- Preserve existing selection, filters, toolbar behavior, and action behavior.

## Implementation

- In [`web/src/components/Common/StyledDataGrid.tsx`](web/src/components/Common/StyledDataGrid.tsx), add an optional explicit width prop so direct grids can reserve a stable width instead of always deriving width from the currently visible columns.
- In [`web/src/components/AgentsDataGrid/AgentsDataGrid.tsx`](web/src/components/AgentsDataGrid/AgentsDataGrid.tsx), replace `DataGridCard` with `StyledDataGrid`, remove the card title/header, and compute one stable width from the max of the default, available, recovering, stats, and terminated column configurations.
- In [`web/src/components/AgentsDataGrid/AgentsToolbar.tsx`](web/src/components/AgentsDataGrid/AgentsToolbar.tsx), add counts to the filter labels, matching the rows each filter shows: Available, Recovering, Stats, and Terminated.
- In [`web/src/components/Agents/AgentsScreen.tsx`](web/src/components/Agents/AgentsScreen.tsx), change the layout to a horizontal row with the action buttons on the left and the Agents table on the right.
- Increase the shared screen action column from `240` to about `312` in [`web/src/components/Common/dataGridLayout.ts`](web/src/components/Common/dataGridLayout.ts), so Agents and Leads buttons are roughly 30% wider.
- In [`web/src/components/Leads/LeadsDataGrid.tsx`](web/src/components/Leads/LeadsDataGrid.tsx) and [`web/src/components/Leads/AgentsDataGridForLeads.tsx`](web/src/components/Leads/AgentsDataGridForLeads.tsx), replace `DataGridCard` with direct `StyledDataGrid` rendering. Keep existing filter counts in toolbars.
- In [`web/src/components/AgentsDataGrid/getAgentsColumns.tsx`](web/src/components/AgentsDataGrid/getAgentsColumns.tsx), rename the shared agent-id column header from `ID` to `Agent`, which updates the Agents table used in the Leads view.

## Verification

- Run `qcheck` after the implementation.
- Visually check Agents and Leads views: no cards around tables, counts beside filters, Agents table width stays stable across filters, and action buttons sit left of the Agents table.
