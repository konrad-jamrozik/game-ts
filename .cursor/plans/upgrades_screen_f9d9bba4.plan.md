---
name: Upgrades Screen
overview: Move upgrade purchasing out of the command center into a standalone Upgrades screen, and simplify the command-center asset/capacity summaries.
todos:
  - id: navigation
    content: Add Upgrades screen navigation state, button, and App route.
    status: completed
  - id: screen
    content: Create the standalone Upgrades screen with grids, buy action, next-turn, back, and Escape handling.
    status: completed
  - id: command-center
    content: Remove command-center upgrade purchasing UI and make capacity grids read-only.
    status: completed
  - id: assets
    content: Inline the money projection chip in the Assets current value column and remove the Projected column.
    status: completed
  - id: verify
    content: Run `qcheck` and address any issues.
    status: completed
isProject: false
---

# Move Upgrades To A Screen

## Scope

- Add a standalone Upgrades screen like Missions/Leads/Agents, opened from Game Controls and closed by Back or Escape.
- Keep the command-center `Assets` and `Capacities` cards as read-only current-value summaries.
- Remove the command-center `Upgrades` card and `UpgradeActions` card so buying upgrades happens only on the new screen.
- Move the Assets projected money chip into the Current cell and remove the Projected column.

## Implementation

- Update navigation state in [`web/src/redux/slices/selectionSlice.ts`](web/src/redux/slices/selectionSlice.ts): add `viewUpgrades?: true`, `setViewUpgrades`, and `clearViewUpgrades`; clear `viewUpgrades` from the other `setView*` reducers and from `clearAllSelection`.
- Update [`web/src/components/App.tsx`](web/src/components/App.tsx): read `viewUpgrades`, render a new `UpgradesScreen` early-return branch, and remove `UpgradeActions` and `UpgradesCard` from the main command-center layout.
- Update [`web/src/components/GameControls/GameControls.tsx`](web/src/components/GameControls/GameControls.tsx): add an `Upgrades` button that dispatches `setViewUpgrades`; keep the existing button style and arrange it as a third navigation row if needed.
- Add [`web/src/components/Upgrades/UpgradesScreen.tsx`](web/src/components/Upgrades/UpgradesScreen.tsx): mirror the existing screen pattern from `LeadsScreen`/`MissionsScreen` with `Box`, `Stack`, `Next turn`, `Back to command center`, Escape handling, the upgrade grids, and the existing `UpgradeActions` buy button.
- Split or parameterize upgrade columns in [`web/src/components/Assets/getCapabilitiesColumns.tsx`](web/src/components/Assets/getCapabilitiesColumns.tsx): provide read-only columns for command-center capacities (`Capability`, `Current`) and shop columns for the Upgrades screen (`Capability`, `Current`, `Upgrade`, `Price`). Keep the capacity color bar rendering for current values.
- Update [`web/src/components/Assets/CapacitiesDataGrid.tsx`](web/src/components/Assets/CapacitiesDataGrid.tsx): use read-only columns and remove checkbox selection/state dispatching in the command center.
- Keep [`web/src/components/Assets/UpgradesDataGrid.tsx`](web/src/components/Assets/UpgradesDataGrid.tsx) selectable for the new screen, using the shop columns and existing `selectedUpgradeName` state.
- Update [`web/src/components/Assets/getAssetsColumns.tsx`](web/src/components/Assets/getAssetsColumns.tsx) and [`web/src/components/Assets/AssetsDataGrid.tsx`](web/src/components/Assets/AssetsDataGrid.tsx): remove the `Projected` column, render the Money row as current value plus `MyChip`, and remove unused projected fields if they are no longer needed.
- Update [`web/src/components/Common/columnWidths.ts`](web/src/components/Common/columnWidths.ts) and [`web/src/components/Common/widthConstants.ts`](web/src/components/Common/widthConstants.ts): remove/recalculate widths for the deleted Assets Projected column and command-center capacity shop columns.

## Verification

- Run `qcheck` after implementation, because this changes app navigation, Redux state, and multiple UI components.
- If `qcheck` surfaces formatting-only issues, run the project formatter only as needed, then re-run `qcheck`.
