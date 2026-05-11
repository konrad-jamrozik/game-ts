---
name: MUI v9 Upgrade
overview: "Upgrade the web app from Material UI 7 / MUI X 8 to the current v9 packages, then migrate source code for the v9 breaking changes that affect this project: removed Material system props, Data Grid toolbar typing, and MUI X component API checks."
todos:
  - id: upgrade-packages
    content: Update MUI package versions and lockfile to v9-compatible latest releases.
    status: completed
  - id: migrate-system-props
    content: Move removed Material system props into `sx` across affected components.
    status: completed
  - id: fix-material-api
    content: Audit and fix Material v9 removed props/imports/theme override type errors.
    status: completed
  - id: fix-mui-x-api
    content: Audit and fix MUI X v9 Data Grid, Charts, and Tree View type/API changes.
    status: completed
  - id: verify-qcheck
    content: Run IDE diagnostics and `qcheck`, then fix any introduced issues.
    status: completed
isProject: false
---

# Upgrade App to MUI v9

## Scope

- Upgrade all first-party MUI packages in [`web/package.json`](web/package.json): `@mui/material`, `@mui/icons-material`, `@mui/system`, `@mui/x-data-grid`, `@mui/x-charts`, and `@mui/x-tree-view` to v9-compatible latest releases, updating [`web/package-lock.json`](web/package-lock.json) through npm. Also verify direct utility imports such as `@mui/types` in [`web/src/components/styling/modelPaletteUtils.ts`](web/src/components/styling/modelPaletteUtils.ts) resolve cleanly after the upgrade.
- Keep React 19 and Emotion dependencies unless the installer or MUI peer requirements force a change.
- Do not use `npx` codemods because this repo forbids `npx`; apply the MUI v9 migrations manually.

## Code Migration

- Convert removed Material UI v9 system props into `sx` objects. The current hot spots include [`web/src/components/App.tsx`](web/src/components/App.tsx), [`web/src/components/MissionDetails/MissionDetailsScreen.tsx`](web/src/components/MissionDetails/MissionDetailsScreen.tsx), [`web/src/components/Common/StyledDataGrid.tsx`](web/src/components/Common/StyledDataGrid.tsx), Data Grid toolbar files, and screen/layout components using `Box`, `Grid`, `Stack`, and `Typography` props such as `paddingX`, `paddingY`, `bgcolor`, `display`, `width`, `minWidth`, `px`, `color`, `alignItems`, and `justifyContent`.
- Include the updated controls UI in the audit: [`web/src/components/GameControls/GameControls.tsx`](web/src/components/GameControls/GameControls.tsx), [`web/src/components/GameControls/ResetControls.tsx`](web/src/components/GameControls/ResetControls.tsx), [`web/src/components/GameControls/GameControlsSection.tsx`](web/src/components/GameControls/GameControlsSection.tsx), and [`web/src/components/Common/LabeledValue.tsx`](web/src/components/Common/LabeledValue.tsx). These already mostly use `sx`, but their Accordion, Box grid, and reusable `sx` helper patterns should be compile-checked after the package bump.
- Audit Material component breaking changes from the v9 guide. The app already uses many v9-style `slotProps` patterns for `Checkbox`, `Snackbar`, and `CardHeader`; verify no removed props or legacy imports remain, especially around the newly touched Accordion-based controls.
- Verify the theme overrides in [`web/src/components/styling/theme.tsx`](web/src/components/styling/theme.tsx) still type-check against MUI v9 `Components` types and update any removed override keys if TypeScript flags them.

## MUI X Migration

- Update custom Data Grid toolbar typings from older `GridSlotsComponentsProps['toolbar']` usage to the v9-recommended `PropsFromSlot<GridSlots['toolbar']>` if needed. Primary files: [`web/src/components/AgentsDataGrid/AgentsToolbar.tsx`](web/src/components/AgentsDataGrid/AgentsToolbar.tsx), [`web/src/components/MissionsDataGrid/MissionsDataGridToolbar.tsx`](web/src/components/MissionsDataGrid/MissionsDataGridToolbar.tsx), [`web/src/components/LeadsDataGrid/LeadsDataGridToolbar.tsx`](web/src/components/LeadsDataGrid/LeadsDataGridToolbar.tsx), and [`web/src/components/MissionDetails/CombatLogToolbar.tsx`](web/src/components/MissionDetails/CombatLogToolbar.tsx).
- Re-check controlled Data Grid row selection. The app already uses the v8+ `{ type, ids: Set<GridRowId> }` shape and `createRowSelectionManager`, so this is likely a compile/audit step rather than a rewrite.
- Compile-check MUI X Charts composition imports in [`web/src/components/Charts/CombatRatingChart.tsx`](web/src/components/Charts/CombatRatingChart.tsx) and [`web/src/components/Charts/CashFlowChart.tsx`](web/src/components/Charts/CashFlowChart.tsx), plus the custom Tree View item slot in [`web/src/components/TurnReport/TurnReportTreeView.tsx`](web/src/components/TurnReport/TurnReportTreeView.tsx), adjusting imports/types only where v9 requires it.

## Verification

- Use IDE diagnostics after edits and run `qcheck` from the web project as the final verification.
- If `qcheck` reveals broader MUI X API changes, fix those directly and rerun `qcheck` once more.
- Do not run tests, `tsc`, build, or `npx` commands separately.
