---
name: grid card widths
overview: Refactor card and DataGrid sizing so each grid declares its columns once, and card widths are derived from the same source as the rendered `StyledDataGrid`. This should remove the current mismatch where cards use broad max widths while the inner grids use narrower visible-column widths.
todos:
  - id: add-layout-helper
    content: Create or refactor the common grid layout helper with one source of truth for DataGrid chrome, checkbox width, card padding, and composed widths.
    status: completed
  - id: rename-grid-extra-width
    content: Rename the misleading operations/base-width constant to a neutral non-column DataGrid extra-width name and add a short comment explaining what the value represents.
    status: completed
  - id: derive-card-widths
    content: Update StyledDataGrid and DataGridCard so rendered grid width and card width are derived by the same helper.
    status: completed
  - id: fix-affected-screens
    content: Remove accidental max-width coupling from Agents, Missions, Leads, and embedded agent grids; convert direct ExpandableCard widths to declarative helper calls.
    status: completed
  - id: rename-action-width
    content: Move the shared action-button column width out of LeadInvestigationActions and update all screen imports.
    status: completed
  - id: verify-layout
    content: Run qcheck and visually verify the affected screens in the running Vite app.
    status: completed
isProject: false
---

# Refactor Grid Card Widths

## Current Diagnosis

- [`web/src/components/Common/StyledDataGrid.tsx`](web/src/components/Common/StyledDataGrid.tsx) computes the actual grid wrapper width from rendered `columns`, plus private `CHECKMARK_COLUMN_WIDTH = 50` and `DATA_GRID_BASE_WIDTH = 10`.
- [`web/src/components/Common/widthConstants.ts`](web/src/components/Common/widthConstants.ts) duplicates that sizing logic with different meanings: `DATA_GRID_BASE_WIDTH` includes border/padding/filler assumptions, while `OPERATIONS_DATA_GRID_BASE_WIDTH` matches `StyledDataGrid`'s `10`. That makes `SITUATION_REPORT_STYLED_DATA_GRID_WIDTH` technically understandable but confusingly named.
- [`web/src/components/Common/DataGridCard.tsx`](web/src/components/Common/DataGridCard.tsx) requires callers to pass a card width, so card widths and grid widths can drift. The visible bug comes from [`AgentsDataGrid.tsx`](web/src/components/AgentsDataGrid/AgentsDataGrid.tsx) and [`MissionsDataGrid.tsx`](web/src/components/MissionsDataGrid/MissionsDataGrid.tsx) using `MIDDLE_COLUMN_CARD_WIDTH`, a max including the much wider leads grid, while their inner `StyledDataGrid` sizes itself only to the currently visible columns.
- Screen action widths are also named from one screen only: `LEADS_SCREEN_BUTTON_WIDTH` is reused by agents, missions, factions, upgrades, and turn report screens.

## What `OPERATIONS_DATA_GRID_BASE_WIDTH` Means

- Despite the name, `OPERATIONS_DATA_GRID_BASE_WIDTH` does not seem to mean "extra width needed by Operations." It is the small non-column width that matches what [`StyledDataGrid.tsx`](web/src/components/Common/StyledDataGrid.tsx) actually adds around every grid: `sum(column widths) + 10 + optional checkbox width`.
- The `10` is effectively a DataGrid chrome/fudge value: it covers the small horizontal difference between the sum of declared MUI column widths and the outer wrapper width needed for the rendered grid box. It is not card padding, not the Operations card gap, and not tied to operations-specific columns.
- The confusing part is that [`widthConstants.ts`](web/src/components/Common/widthConstants.ts) also has `DATA_GRID_BASE_WIDTH`, which tries to model border, padding, and MUI filler separately. That larger model is not what `StyledDataGrid` uses at runtime, so the plan should rename the `10`-based concept to something neutral like `STYLED_DATA_GRID_CHROME_WIDTH`.

## Refactor Shape

- Create a single shared layout helper module, likely [`web/src/components/Common/dataGridLayout.ts`](web/src/components/Common/dataGridLayout.ts), or replace [`widthConstants.ts`](web/src/components/Common/widthConstants.ts) in place if you prefer less file churn.
- Move the shared primitives there with clear names:
  - `DATA_GRID_CHECKBOX_COLUMN_WIDTH`
  - `STYLED_DATA_GRID_CHROME_WIDTH`
  - `EXPANDABLE_CARD_CONTENT_HORIZONTAL_INSET_PX`
  - `SCREEN_ACTIONS_COLUMN_WIDTH`
- Rename the `OPERATIONS_DATA_GRID_BASE_WIDTH` concept to a neutral name, and document it as the non-column extra width added to `sum(column widths)` when sizing a `StyledDataGrid`.
- Add small helpers for declarative width definitions:
  - `getDataGridWidth(columns, { checkboxSelection })`
  - `getDataGridCardWidth(columns, { checkboxSelection })`
  - `getColumnKeysWidth([...])`
  - `getDataGridCardWidthForColumnKeys([...], { checkboxSelection })`
  - `getHorizontalStackWidth([...], gapPx)` for Operations-style composed cards.

## Component Changes

- Update [`StyledDataGrid.tsx`](web/src/components/Common/StyledDataGrid.tsx) to import the shared checkbox/chrome constants and use the same `getDataGridWidth()` helper that cards use.
- Update [`DataGridCard.tsx`](web/src/components/Common/DataGridCard.tsx) so the card width defaults to `getDataGridCardWidth(columns, { checkboxSelection })`. Keep an explicit override only for cards that intentionally need a stable max width.
- Remove the broad `MIDDLE_COLUMN_CARD_WIDTH` coupling from these grids and let the card follow the declared visible columns:
  - [`web/src/components/AgentsDataGrid/AgentsDataGrid.tsx`](web/src/components/AgentsDataGrid/AgentsDataGrid.tsx)
  - [`web/src/components/MissionsDataGrid/MissionsDataGrid.tsx`](web/src/components/MissionsDataGrid/MissionsDataGrid.tsx)
  - [`web/src/components/Leads/LeadsDataGrid.tsx`](web/src/components/Leads/LeadsDataGrid.tsx)
  - [`web/src/components/Leads/AgentsDataGridForLeads.tsx`](web/src/components/Leads/AgentsDataGridForLeads.tsx)
  - [`web/src/components/Missions/AgentsDataGridForMissions.tsx`](web/src/components/Missions/AgentsDataGridForMissions.tsx)
- Re-express direct `ExpandableCard` widths with the same helpers instead of hand-summed constants:
  - Operations card: max left-column mini grid + gap + max right-column mini grid + card inset.
  - Situation report: max of its two `StyledDataGrid` widths + card inset, with no operations-specific constant name.
  - Mission details, battle log, combat log, assets, capacities, upgrades: derive widths from declared column-key arrays or from the actual `columns` where available.
- Rename/move `LEADS_SCREEN_BUTTON_WIDTH` to a neutral shared screen layout constant and update imports in agents, leads, missions, factions, upgrades, and turn report screens.

## Verification

- Run `qcheck` after implementation.
- Use `http://localhost:5173/game-ts/` to visually verify Agents, Leads, Missions, Situation Report, Operations, and Factions. The important acceptance check is that each card either tightly fits its DataGrid content or has an explicit, named reason to reserve extra width.
