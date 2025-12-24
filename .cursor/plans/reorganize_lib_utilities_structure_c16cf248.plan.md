---
name: Reorganize lib utilities structure
overview: Reorganize utility directories in `web/src/lib/` to improve organization while maintaining dependency rules. Consolidate small directories, organize by domain, and clarify utility purposes.
todos:
  - id: reorganize-model-utils
    content: Create domain subdirectories in model_utils (agent/, mission/, faction/, lead/, turnReport/, validation/) and move files accordingly
    status: pending
  - id: flatten-game-utils
    content: Move all files from game_utils/turn_advancement/ to game_utils/ and remove subdirectory
    status: pending
  - id: update-imports-model-utils
    content: Update all imports from model_utils/* to model_utils/{domain}/* across codebase
    status: pending
    dependencies:
      - reorganize-model-utils
  - id: update-imports-game-utils
    content: Update all imports from game_utils/turn_advancement/* to game_utils/* across codebase
    status: pending
    dependencies:
      - flatten-game-utils
  - id: verify-dependencies
    content: Verify all dependency rules are maintained and run qcheck
    status: pending
    dependencies:
      - update-imports-model-utils
      - update-imports-game-utils
---

# Reorganize lib utilities structure



## Current State Analysis

### Current Directory Structure:

- `primitives/` - Low-level utilities (math, formatting, assertions, etc.) - 7 files
- `model/` - Type definitions only - 9 files
- `model_utils/` - Utilities for working with models - 13 files (flat structure)
- `data_tables/` - Data tables and constants - 11 files
- `data_table_utils/` - Formatting utilities that depend on data_tables - 1 file
- `factories/` - Factory functions for creating model instances - 7 files
- `ruleset/` - Game rules/logic - 10 files
- `game_utils/` - Game logic utilities - 2 files + 8 files in `turn_advancement/` subdirectory
- `utils/` - General utilities - 2 files (appInitChecks, errorToast)

### Current Dependency Chain:

```javascript
ruleset → data_table_utils → data_tables → model_utils → model → primitives
factories → (data_table_utils, model_utils, data_tables, model, primitives)
game_utils → (ruleset, factories, model_utils, data_tables, model, primitives)
utils → (model_utils, primitives)
```



### Issues Identified:

1. **`data_table_utils/`** - Only 1 file (`formatModelUtils.ts`), but it depends on `model_utils`, so can't merge into `data_tables` without breaking dependencies
2. **`utils/`** - Only 2 files, could be better organized
3. **`model_utils/`** - 13 files in flat structure, could be organized by domain
4. **`game_utils/`** - Has subdirectory `turn_advancement/`, could be flattened or better organized

## Proposed Reorganization

### Option 1: Domain-Based Organization (Recommended)

**New Structure:**

```javascript
lib/
├── primitives/          (unchanged - lowest level)
├── model/              (unchanged - types only)
├── model_utils/        (reorganized by domain)
│   ├── agent/
│   │   ├── agentUtils.ts
│   │   └── agentModelUtils.ts
│   ├── mission/
│   │   ├── missionUtils.ts
│   │   ├── missionModelUtils.ts
│   │   └── missionStatePriority.ts
│   ├── faction/
│   │   ├── factionUtils.ts
│   │   ├── factionModelUtils.ts
│   │   └── factionActivityLevelUtils.ts
│   ├── lead/
│   │   ├── leadInvestigationUtils.ts
│   │   └── leadModelUtils.ts
│   ├── turnReport/
│   │   └── turnReportUtils.ts
│   └── validation/
│       ├── validateAgentInvariants.ts
│       ├── validateAgents.ts
│       └── validateGameStateInvariants.ts
├── data_tables/        (unchanged)
├── data_table_utils/   (unchanged - depends on model_utils)
├── factories/          (unchanged)
├── ruleset/            (unchanged)
├── game_utils/         (flattened)
│   ├── gameStateChecks.ts
│   ├── evaluateTurn.ts
│   ├── evaluateDeployedMission.ts
│   ├── evaluateBattle.ts
│   ├── evaluateAttack.ts
│   ├── updateAgents.ts
│   ├── updateLeadInvestigations.ts
│   ├── selectTarget.ts
│   └── fmtAttackLog.ts
└── utils/              (consolidated)
    ├── appInitChecks.ts
    └── errorToast.ts
```

**Benefits:**

- `model_utils/` organized by domain (agent, mission, faction, lead, turnReport, validation)
- `game_utils/` flattened (remove `turn_advancement/` subdirectory)
- Clear separation of concerns
- Maintains dependency rules

**Dependency Chain (unchanged):**

```javascript
ruleset → data_table_utils → (data_tables, model_utils) → model → primitives
```



### Option 2: Merge Small Directories

**Alternative Structure:**

- Merge `data_table_utils/formatModelUtils.ts` into `data_tables/formatUtils.ts` (but this breaks dependency - data_tables would depend on model_utils)
- Merge `utils/` into `model_utils/` or create `lib/utils/` with subdirectories
- Keep `game_utils/turn_advancement/` as subdirectory

**Issues:**

- Can't merge `data_table_utils` into `data_tables` because `formatModelUtils.ts` depends on `model_utils`
- Merging `utils/` into `model_utils/` mixes concerns (app init checks aren't model utilities)

### Option 3: Minimal Changes

**Structure:**

- Keep everything as-is except:
- Flatten `game_utils/turn_advancement/` → `game_utils/`
- Organize `model_utils/` into subdirectories by domain

**Benefits:**

- Minimal disruption
- Improves organization without major restructuring

## Recommended Approach: Option 1 (Domain-Based)

### Implementation Steps:

1. **Reorganize `model_utils/` by domain:**

- Create subdirectories: `agent/`, `mission/`, `faction/`, `lead/`, `turnReport/`, `validation/`
- Move files to appropriate subdirectories
- Update all imports

2. **Flatten `game_utils/turn_advancement/`:**

- Move all files from `turn_advancement/` to `game_utils/`
- Update all imports
- Remove `turn_advancement/` directory

3. **Keep `utils/` as-is:**

- Only 2 files, serves a clear purpose (app initialization and error handling)
- Could rename to `app_utils/` for clarity, but not necessary

4. **Keep `data_table_utils/` as-is:**

- Only 1 file, but has unique dependency (depends on both `data_tables` and `model_utils`)
- Serves a clear purpose (formatting with data table lookups)

### Files to Move:

**model_utils reorganization:**

- `agentUtils.ts` → `model_utils/agent/agentUtils.ts`
- `agentModelUtils.ts` → `model_utils/agent/agentModelUtils.ts`
- `missionUtils.ts` → `model_utils/mission/missionUtils.ts`
- `missionModelUtils.ts` → `model_utils/mission/missionModelUtils.ts`
- `missionStatePriority.ts` → `model_utils/mission/missionStatePriority.ts`
- `factionUtils.ts` → `model_utils/faction/factionUtils.ts`
- `factionModelUtils.ts` → `model_utils/faction/factionModelUtils.ts`
- `factionActivityLevelUtils.ts` → `model_utils/faction/factionActivityLevelUtils.ts`
- `leadInvestigationUtils.ts` → `model_utils/lead/leadInvestigationUtils.ts`
- `leadModelUtils.ts` → `model_utils/lead/leadModelUtils.ts`
- `turnReportUtils.ts` → `model_utils/turnReport/turnReportUtils.ts`
- `validateAgentInvariants.ts` → `model_utils/validation/validateAgentInvariants.ts`
- `validateAgents.ts` → `model_utils/validation/validateAgents.ts`
- `validateGameStateInvariants.ts` → `model_utils/validation/validateGameStateInvariants.ts`

**game_utils flattening:**

- `turn_advancement/evaluateTurn.ts` → `game_utils/evaluateTurn.ts`
- `turn_advancement/evaluateDeployedMission.ts` → `game_utils/evaluateDeployedMission.ts`
- `turn_advancement/evaluateBattle.ts` → `game_utils/evaluateBattle.ts`
- `turn_advancement/evaluateAttack.ts` → `game_utils/evaluateAttack.ts`
- `turn_advancement/updateAgents.ts` → `game_utils/updateAgents.ts`
- `turn_advancement/updateLeadInvestigations.ts` → `game_utils/updateLeadInvestigations.ts`
- `turn_advancement/selectTarget.ts` → `game_utils/selectTarget.ts`
- `turn_advancement/fmtAttackLog.ts` → `game_utils/fmtAttackLog.ts`

### Import Updates Required:

- All files importing from `model_utils/*` → update to `model_utils/{domain}/*`
- All files importing from `game_utils/turn_advancement/*` → update to `game_utils/*`

### Dependency Verification:

After reorganization, dependency chain remains:

```javascript
ruleset → data_table_utils → (data_tables, model_utils) → model → primitives
factories → (data_table_utils, model_utils, data_tables, model, primitives)
game_utils → (ruleset, factories, model_utils, data_tables, model, primitives)
utils → (model_utils, primitives)



```