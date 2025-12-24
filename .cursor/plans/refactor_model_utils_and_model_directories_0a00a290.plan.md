---
name: Refactor model_utils and model directories
overview: Split `lib/model_utils` into `lib/data_table_utils` (functions depending on data_tables) and a new `lib/model_utils` (functions not depending on data_tables), and move utility functions from `lib/model` files to the new `lib/model_utils`.
todos:
  - id: create-data-table-utils
    content: Create lib/data_table_utils directory and move formatModelUtils.ts and fmtMissionIdWithMissionDefId from missionUtils.ts
    status: pending
  - id: create-new-model-utils
    content: Replace lib/model_utils directory content with files that do not depend on data_tables
    status: pending
  - id: move-model-functions
    content: Move utility functions from lib/model files to new lib/model_utils files (agentModelUtils, missionModelUtils, factionModelUtils, leadModelUtils, and bldValueChange to turnReportUtils)
    status: pending
    dependencies:
      - create-new-model-utils
  - id: update-imports
    content: Update all imports across codebase to reference new locations (data_table_utils vs model_utils)
    status: pending
    dependencies:
      - create-data-table-utils
      - create-new-model-utils
      - move-model-functions
  - id: update-model-imports
    content: Update lib/model files to import moved utility functions from lib/model_utils
    status: pending
    dependencies:
      - move-model-functions
  - id: replace-model-utils
    content: Replace old lib/model_utils directory content with new files (overwriting old files with new structure)
    status: pending
    dependencies:
      - update-imports
      - update-model-imports
  - id: update-docs
    content: Update docs/design/about_code_dependencies.md with new dependency structure
    status: pending
    dependencies:
      - replace-model-utils
---

# Refactor model_utils and model directories

## Overview

This refactoring addresses the dependency issue where `model_utils` depends on `data_tables`. The plan:

1. Rename `lib/model_utils` to `lib/data_table_utils` and keep only functions that depend on `data_tables`
2. Create a new `lib/model_utils` directory with functions from the old `model_utils` that don't depend on `data_tables`
3. Move utility functions from `lib/model` files to the new `lib/model_utils`

## Current State Analysis

### Files in `lib/model_utils` that depend on `data_tables`:

- `formatModelUtils.ts` - entire file (imports `getLeadById`, `getMissionDataById`, `getFactionDataById`)
- `missionUtils.ts` - only `fmtMissionIdWithMissionDefId` function (uses `getMissionDataById`)

### Files in `lib/model_utils` that DON'T depend on `data_tables`:

- `agentUtils.ts` - entire file
- `factionActivityLevelUtils.ts` - entire file
- `factionUtils.ts` - entire file
- `leadInvestigationUtils.ts` - entire file
- `missionStatePriority.ts` - entire file
- `turnReportUtils.ts` - entire file
- `validateAgentInvariants.ts` - entire file
- `validateAgents.ts` - entire file
- `validateGameStateInvariants.ts` - entire file
- `missionUtils.ts` - all functions except `fmtMissionIdWithMissionDefId`

### Functions in `lib/model` to move to new `lib/model_utils`:

- From `agentModel.ts`: `isActivityAssignment`, `isMissionAssignment`, `isLeadInvestigationAssignment`, `isAssignmentState`, `assertIsAgentId`
- From `missionModel.ts`: `assertIsMissionId`, `assertIsMissionDataId`
- From `factionModel.ts`: `asActivityLevelOrd`, `assertIsActivityLevelOrd`, `asOperationLevelOrd`, `assertIsOperationLevelOrd`, `assertIsFactionId`
- From `leadModel.ts`: `asLeadId`, `assertIsLeadId`, `assertIsLeadInvestigationId`
- From `turnReportModel.ts`: `bldValueChange`

## Implementation Steps

### Step 1: Create new `lib/data_table_utils` directory

1. Create `web/src/lib/data_table_utils/` directory
2. Move `formatModelUtils.ts` from `lib/model_utils/` to `lib/data_table_utils/`
3. Create `missionUtils.ts` in `lib/data_table_utils/` with only `fmtMissionIdWithMissionDefId` function
4. Update imports in `formatModelUtils.ts` to use relative paths correctly

### Step 2: Replace `lib/model_utils` directory content

1. Keep `web/src/lib/model_utils/` directory (it already exists)
2. Replace files in `lib/model_utils/` with files that don't depend on `data_tables`:

- `agentUtils.ts`
- `factionActivityLevelUtils.ts`
- `factionUtils.ts`
- `leadInvestigationUtils.ts`
- `missionStatePriority.ts`
- `turnReportUtils.ts`
- `validateAgentInvariants.ts`
- `validateAgents.ts`
- `validateGameStateInvariants.ts`

3. Create `missionUtils.ts` in new `lib/model_utils/` with all functions from old `missionUtils.ts` EXCEPT `fmtMissionIdWithMissionDefId`
4. Update imports in all moved files to use correct relative paths

### Step 3: Move utility functions from `lib/model` to new `lib/model_utils`

1. Create `agentModelUtils.ts` in `lib/model_utils/`:

- Move `isActivityAssignment`, `isMissionAssignment`, `isLeadInvestigationAssignment`, `isAssignmentState`, `assertIsAgentId` from `agentModel.ts`
- Add necessary imports

2. Create `missionModelUtils.ts` in `lib/model_utils/`:

- Move `assertIsMissionId`, `assertIsMissionDataId` from `missionModel.ts`
- Add necessary imports

3. Create `factionModelUtils.ts` in `lib/model_utils/`:

- Move `asActivityLevelOrd`, `assertIsActivityLevelOrd`, `asOperationLevelOrd`, `assertIsOperationLevelOrd`, `assertIsFactionId` from `factionModel.ts`
- Add necessary imports

4. Create `leadModelUtils.ts` in `lib/model_utils/`:

- Move `asLeadId`, `assertIsLeadId`, `assertIsLeadInvestigationId` from `leadModel.ts`
- Add necessary imports

5. Add `bldValueChange` to `turnReportUtils.ts` in `lib/model_utils/`:

- Move `bldValueChange` from `turnReportModel.ts`
- Update imports in `turnReportModel.ts` to import from `model_utils/turnReportUtils`

### Step 4: Update all imports across the codebase

1. Update imports from `lib/model_utils/formatModelUtils` to `lib/data_table_utils/formatModelUtils`
2. Update imports from `lib/model_utils/missionUtils`:

- If importing `fmtMissionIdWithMissionDefId` → change to `lib/data_table_utils/missionUtils`
- If importing other functions → change to `lib/model_utils/missionUtils`

3. Update imports from `lib/model/*` to `lib/model_utils/*ModelUtils` for moved functions
4. Update imports in `lib/model` files that reference moved functions to import from `lib/model_utils`

### Step 5: Replace old `lib/model_utils` directory content

1. The old `lib/model_utils/` directory will be replaced/overwritten with the new files during Step 2

### Step 6: Update dependency documentation

1. Update `docs/design/about_code_dependencies.md`:

- Add `LibDataTUtils[lib/data_table_utils]` to the dependency diagram
- Update dependency chain: `LibRul --> LibDataTUtils --> LibDataT --> LibMUt --> LibMod --> LibPri`
- Ensure `LibMUt` (new model_utils) does NOT depend on `LibDataTUtils` or `LibDataT`
- Ensure `LibDataT` can depend on `LibMUt` (new model_utils)

## Files to Modify

### New Files to Create:

- `web/src/lib/data_table_utils/formatModelUtils.ts`
- `web/src/lib/data_table_utils/missionUtils.ts`
- `web/src/lib/model_utils/agentModelUtils.ts`
- `web/src/lib/model_utils/factionModelUtils.ts`
- `web/src/lib/model_utils/leadModelUtils.ts`
- `web/src/lib/model_utils/missionModelUtils.ts`

### Files to Modify:

- All files importing from `lib/model_utils/formatModelUtils` (42+ files)
- All files importing from `lib/model_utils/missionUtils` (need to check which function)
- `web/src/lib/model/agentModel.ts` - remove utility functions, add imports
- `web/src/lib/model/missionModel.ts` - remove utility functions, add imports
- `web/src/lib/model/factionModel.ts` - remove utility functions, add imports
- `web/src/lib/model/leadModel.ts` - remove utility functions, add imports
- `web/src/lib/model/turnReportModel.ts` - remove `bldValueChange`, add import
- `docs/design/about_code_dependencies.md` - update dependency diagram

### Files to Replace:

- `web/src/lib/model_utils/` (directory will be updated with new files, replacing old ones)

## Dependency Rules Verification

After refactoring, the dependency chain should be:

- `ruleset` → `data_table_utils` → `data_tables` → `model_utils` (new, no data_tables dependency) → `model` → `primitives`
- `data_table_utils` can depend on `data_tables`, `model_utils` (new), `model`, and `primitives`
- `data_tables` can depend on `model_utils` (new), `model`, and `primitives`
- `model_utils` (new) can depend on `model` and `primitives`, but NOT on `data_tables` or `data_table_utils`
