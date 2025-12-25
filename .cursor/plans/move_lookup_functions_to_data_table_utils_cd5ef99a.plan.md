---
name: Move lookup functions to data_table_utils
overview: Move all lookup and utility functions from `dataTables.ts` to a new `data_table_utils/getterUtils.ts` file, then update all imports across the codebase.
todos:
  - id: create-getter-utils
    content: Create web/src/lib/data_table_utils/getterUtils.ts with all lookup functions moved from dataTables.ts
    status: pending
  - id: update-dataTables
    content: Remove lookup functions from web/src/lib/data_tables/dataTables.ts, keeping only core data structure
    status: pending
  - id: update-imports
    content: Update all import statements across 16 files to import from the new getterUtils.ts location
    status: pending
---

# Move lookup functions from dataTables.ts to data_table_utils

## Overview

Refactor `dataTables.ts` to only contain the core data table structure (`DataTables` type, `dataTables` constant, and `bldDataTables()` function). Move all lookup and utility functions to a new `data_table_utils/getterUtils.ts` file.

## Functions to move

The following functions will be moved from `web/src/lib/data_tables/dataTables.ts` to `web/src/lib/data_table_utils/getterUtils.ts`:

1. `getFactionShortId()` - formatting utility
2. `getOffensiveMissionDataById()` - lookup function
3. `getDefensiveMissionDataById()` - lookup function
4. `getMissionDataById()` - lookup function
5. `getLeadById()` - lookup function
6. `getFactionDataById()` - lookup function
7. `getFactionName()` - utility function
8. `getFactionDataByDataId()` - private helper (will be exported in new file)
9. `getActivityLevelByOrd()` - lookup function
10. `getEnemyByType()` - lookup function
11. `getFactionOperationByLevel()` - lookup function

**Note:** `isFactionDiscovered()` has already been moved to ruleset by the user and should not be moved.

## Implementation steps

### 1. Create new getter utilities file

- Create `web/src/lib/data_table_utils/getterUtils.ts`
- Move all lookup functions from `dataTables.ts` (excluding `isFactionDiscovered()` which was already moved to ruleset)
- Import `dataTables` from `../data_tables/dataTables` to access the data
- Export `getFactionDataByDataId()` (currently private) since it's used by other exported functions

### 2. Update dataTables.ts

- Remove all lookup/utility functions (excluding `isFactionDiscovered()` which was already moved)
- Remove the comment on line 60
- Keep only: type definitions, `dataTables` constant, and `bldDataTables()` function
- Remove unused imports if any

### 3. Update all import statements

Update imports in the following files to import from the new location:

- `web/src/lib/data_table_utils/formatModelUtils.ts`
- `web/src/components/SituationReportCard.tsx`
- `web/src/lib/ruleset/factionActivityLevelRuleset.ts`
- `web/src/lib/game_utils/turn_advancement/evaluateTurn.ts`
- `web/src/redux/eventsMiddleware.ts`
- `web/src/lib/game_utils/turn_advancement/evaluateDeployedMission.ts`
- `web/src/lib/game_utils/turn_advancement/updateLeadInvestigations.ts`
- `web/src/lib/factories/enemyFactory.ts`
- `web/src/components/LeadInvestigationsDataGrid/LeadInvestigationsDataGrid.tsx`
- `web/src/components/GameControls/PlayerActions.tsx`
- `web/src/lib/factories/missionFactory.ts`
- `web/src/components/MissionDetails/MissionDetailsCard.tsx`
- `web/src/redux/reducers/leadReducers.ts`
- `web/src/lib/ruleset/factionOperationLevelRuleset.ts`
- `web/src/lib/ruleset/factionRuleset.ts`
- `web/src/components/MissionsDataGrid/MissionsDataGrid.tsx`

## File structure after refactoring

```javascript
web/src/lib/
├── data_tables/
│   └── dataTables.ts          # Only core data structure
└── data_table_utils/
    ├── formatModelUtils.ts    # Existing formatting utilities
    └── getterUtils.ts         # New file with all lookup functions
```



## Notes

- The new `getterUtils.ts` will import `dataTables` from `../data_tables/dataTables` to access the data tables
- All function signatures and behavior remain unchanged
- The private `getFactionDataByDataId()` function will be exported in the new file since it's used by `getFactionName()`
- `isFactionDiscovered()` has already been moved to ruleset and should not be included in this refactoring