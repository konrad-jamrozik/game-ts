# Code Dependency Diagram: Full Architecture

This document shows the dependency relationships between files across all layers of the codebase, and analyzes compliance with the dependency rules
outlined in `docs/design/about_code_dependencies.md`.

## Legend

- `→` means "depends on" (imports from)
- Files are grouped by layer/directory
- External dependencies (like `@mui/*`, `radash`, etc.) are not shown
- Only cross-directory dependencies are shown (dependencies within the same directory are omitted for brevity)

## Dependency Rules

According to `docs/design/about_code_dependencies.md`, the following directory import rules apply:

```text
app              -> components
components       -> lib
lib/collections  -> lib/model
lib/model        -> lib/domain_utils
lib/domain_utils -> lib/ruleset
lib/ruleset      -> lib/utils
lib/utils        -> lib/primitives
```

This means:
- Code in `app/` **can** import from `components/`
- Code in `components/` **can** import from `lib/` (any subdirectory)
- Code in `lib/collections/` **can** import from `lib/model/`
- Code in `lib/model/` **can** import from `lib/domain_utils/`
- Code in `lib/domain_utils/` **can** import from `lib/ruleset/`
- Code in `lib/ruleset/` **can** import from `lib/utils/` (and transitively from `lib/primitives/`)
- Code in `lib/utils/` **can** import from `lib/primitives/`
- Code in `lib/primitives/` **should NOT** import from other `lib/` directories

## Dependency Graph

### Layer 0: Primitives (Foundation)

```text
lib/primitives/
  assertPrimitives.ts
    → (no internal dependencies)

  mathPrimitives.ts
    → assertPrimitives.ts

  formatPrimitives.ts
    → mathPrimitives.ts

  stringPrimitives.ts
    → assertPrimitives.ts

  rand.ts
    → assertPrimitives.ts

  fixed6Primitives.ts
    → assertPrimitives.ts
    → mathPrimitives.ts
```

### Layer 1: Utils

```text
lib/utils/
  assertUtils.ts
    → mathPrimitives.ts (primitives)

  fixed6Utils.ts
    → fixed6Primitives.ts (primitives)
    → formatPrimitives.ts (primitives)
    → assertUtils.ts
```

### Layer 2: Ruleset

```text
lib/ruleset/
  constants.ts
    → fixed6Utils.ts (utils)

  skillRuleset.ts
    → fixed6Primitives.ts (primitives)

  recoveryRuleset.ts
    → mathPrimitives.ts (primitives)
    → assertPrimitives.ts (primitives)

  panicRuleset.ts
    → fixed6Utils.ts (utils)
    → fixed6Primitives.ts (primitives)
    → constants.ts

  moneyRuleset.ts
    → fixed6Primitives.ts (primitives)
    → constants.ts
    → skillRuleset.ts

  intelRuleset.ts
    → fixed6Primitives.ts (primitives)
    → constants.ts
    → skillRuleset.ts

  leadRuleset.ts
    → mathPrimitives.ts (primitives)
    → fixed6Primitives.ts (primitives)
    → constants.ts
    → skillRuleset.ts

  missionRuleset.ts
    → fixed6Utils.ts (utils)
    → fixed6Primitives.ts (primitives)
    → constants.ts

  initialState.ts
    → fixed6Utils.ts (utils)

  debugInitialState.ts
    → fixed6Utils.ts (utils)
```

### Layer 3: Domain Utils

```text
lib/domain_utils/
  actorUtils.ts
    → fixed6Utils.ts (utils)
    → fixed6Primitives.ts (primitives)
    → constants.ts (ruleset)
    → assertPrimitives.ts (primitives)
    → mathPrimitives.ts (primitives)
    → stringPrimitives.ts (primitives)

  weaponUtils.ts
    → constants.ts (ruleset)
    → mathPrimitives.ts (primitives)

  enemyUtils.ts
    → collections/enemyUnits.ts (collections)
    → model/model.ts (model)

  missionSiteUtils.ts
    → collections/missions.ts (collections)
    → model/model.ts (model)
    → formatPrimitives.ts (primitives)

  formatDomainUtils.ts
    → model/model.ts (model)
    → mathPrimitives.ts (primitives)
    → fixed6Primitives.ts (primitives)
    → model/turnReportModel.ts (model)
    → fixed6Utils.ts (utils)

  fmtAttackLog.ts
    → formatPrimitives.ts (primitives)

  turnReportUtils.ts
    → model/turnReportModel.ts (model)
```

### Layer 4: Model

```text
lib/model/
  model.ts
    → fixed6Primitives.ts (primitives)

  turnReportModel.ts
    → fixed6Primitives.ts (primitives)

  agents/AgentView.ts
    → actorUtils.ts (domain_utils)
    → model.ts (model)
    → fixed6Primitives.ts (primitives)

  agents/AgentsView.ts
    → model.ts (model)
    → fixed6Primitives.ts (primitives)
    → moneyRuleset.ts (ruleset)
    → intelRuleset.ts (ruleset)

  agents/validateAgentInvariants.ts
    → model.ts (model)
    → fixed6Utils.ts (utils)
    → fixed6Primitives.ts (primitives)
    → assertPrimitives.ts (primitives)
    → mathPrimitives.ts (primitives)

  agents/validateAgents.ts
    → model.ts (model)

  validateGameStateInvariants.ts
    → (not analyzed - may have dependencies)
```

### Layer 5: Collections

```text
lib/collections/
  missions.ts
    → fixed6Utils.ts (utils)
    → model.ts (model)
    → assertPrimitives.ts (primitives)

  factions.ts
    → fixed6Utils.ts (utils)
    → model.ts (model)

  enemyUnits.ts
    → fixed6Utils.ts (utils)
    → fixed6Primitives.ts (primitives)

  upgrades.ts
    → fixed6Utils.ts (utils)
    → fixed6Primitives.ts (primitives)

  leads.ts
    → model.ts (model)
    → assertPrimitives.ts (primitives)
```

### Layer 6: Additional Lib Directories

```text
lib/slices/
  (Redux slices - depends on model, ruleset, domain_utils, collections, utils, primitives)
  Examples:
    gameStateSlice.ts → ruleset/initialState.ts
    reducers/agentReducers.ts → model.ts, AgentView.ts, fixed6Utils.ts, weaponUtils.ts
    reducers/missionReducers.ts → model.ts, collections/missions.ts, enemyUtils.ts
    reducers/leadReducers.ts → model.ts, assertPrimitives.ts
    selectionSlice.ts → model.ts, collections/upgrades.ts
    eventsSlice.ts → model.ts

lib/turn_advancement/
  (Turn advancement logic - depends on collections, model, ruleset, domain_utils, utils, primitives)
  Examples:
    evaluateTurn.ts → collections/missions.ts, AgentsView.ts, fixed6Utils.ts, fixed6Primitives.ts,
                      model.ts, panicRuleset.ts, validateGameStateInvariants.ts
    evaluateBattle.ts → AgentsView.ts, AgentView.ts, fixed6Utils.ts, fixed6Primitives.ts,
                        model.ts, constants.ts, missionRuleset.ts, actorUtils.ts, assertPrimitives.ts,
                        formatPrimitives.ts
    evaluateAttack.ts → model.ts, fixed6Utils.ts, fixed6Primitives.ts, actorUtils.ts, assertPrimitives.ts,
                        fmtAttackLog.ts, weaponUtils.ts, formatPrimitives.ts
    updateAgents.ts → constants.ts, assertPrimitives.ts, mathPrimitives.ts, model.ts, AgentsView.ts, actorUtils.ts
    updateLeadInvestigations.ts → collections/leads.ts, collections/missions.ts, AgentsView.ts, model.ts,
                                   constants.ts, leadRuleset.ts, turnReportModel.ts, assertPrimitives.ts,
                                   enemyUtils.ts
    rolls.ts → fixed6Utils.ts, fixed6Primitives.ts, assertPrimitives.ts, formatPrimitives.ts,
               mathPrimitives.ts, rand.ts
    selectTarget.ts → fixed6Primitives.ts, model.ts, assertPrimitives.ts, mathPrimitives.ts, rand.ts,
                      stringPrimitives.ts

lib/component_utils/
  dataGridUtils.ts
    → components/AgentsDataGrid/AgentsDataGrid.tsx (components)
    → components/LeadInvestigationsDataGrid.tsx (components)

lib/selectors/
  selectors.ts
    → app/store.ts (app)
    → model/agents/AgentsView.ts (model)
    → model/model.ts (model)
```

### Layer 7: Components

```text
components/
  (React components - depends on app, lib/*)
  Examples:
    App.tsx → components/* (various components)
    AgentsDataGrid/AgentsDataGrid.tsx → app/hooks.ts, model.ts, selectionSlice.ts, component_utils/dataGridUtils.ts
    CapabilitiesDataGrid.tsx → app/hooks.ts, collections/upgrades.ts, selectionSlice.ts,
                               fixed6Primitives.ts, fixed6Utils.ts
    AssetsDataGrid.tsx → app/hooks.ts, moneyRuleset.ts, intelRuleset.ts, AgentsView.ts
    SituationReportCard.tsx → app/hooks.ts, formatDomainUtils.ts, fixed6Utils.ts, fixed6Primitives.ts,
                              constants.ts, panicRuleset.ts, assertPrimitives.ts, formatPrimitives.ts
    PlayerActions.tsx → app/hooks.ts, collections/leads.ts, formatDomainUtils.ts, missionSiteUtils.ts,
                        AgentsView.ts, constants.ts
    LeadInvestigationsDataGrid.tsx → app/hooks.ts, collections/leads.ts, AgentsView.ts, AgentView.ts,
                                     fixed6Primitives.ts, model.ts, constants.ts, leadRuleset.ts,
                                     skillRuleset.ts, component_utils/dataGridUtils.ts, formatPrimitives.ts,
                                     turnReportUtils.ts
    GameControls.tsx → app/hooks.ts, gameStateSlice.ts, fixed6Utils.ts, fixed6Primitives.ts
    EventLog.tsx → app/hooks.ts, eventsSlice.ts, assertPrimitives.ts, formatDomainUtils.ts
    TurnReport/* → app/hooks.ts, fixed6Utils.ts, fixed6Primitives.ts, turnReportModel.ts,
                   formatPrimitives.ts, formatDomainUtils.ts, panicRuleset.ts
```

### Layer 8: App

```text
app/
  App.tsx
    → components/* (various components)

  eventsMiddleware.ts
    → collections/missions.ts
    → slices/eventsSlice.ts
    → slices/reducers/asPlayerAction.ts
    → domain_utils/formatDomainUtils.ts
    → assertPrimitives.ts

  hooks.ts
    → store.ts

  persist.ts
    → (not analyzed - may have dependencies)

  store.ts
    → slices/eventsSlice.ts
    → slices/gameStateSlice.ts
    → slices/reducers/asPlayerAction.ts
    → slices/selectionSlice.ts
    → slices/settingsSlice.ts
```

## Dependency Summary

### Circular Dependencies

- None ✅

### Most Depended-Upon Files

1. **fixed6Primitives.ts** (primitives) - Used extensively across all layers
2. **fixed6Utils.ts** (utils) - Used by ruleset, domain_utils, collections, components
3. **model.ts** (model) - Used by domain_utils, collections, slices, turn_advancement, components
4. **assertPrimitives.ts** (primitives) - Used by many files for validation
5. **mathPrimitives.ts** (primitives) - Used by utils, ruleset, domain_utils
6. **constants.ts** (ruleset) - Used by ruleset, domain_utils, turn_advancement, components
7. **formatPrimitives.ts** (primitives) - Used by domain_utils, components, turn_advancement

### Dependency Layers Summary

**Layer 0 (Foundation):**
- `lib/primitives/` - Core primitive types and utilities

**Layer 1 (Utils):**
- `lib/utils/` - Utility functions built on primitives

**Layer 2 (Ruleset):**
- `lib/ruleset/` - Game rules and calculations

**Layer 3 (Domain Utils):**
- `lib/domain_utils/` - Domain-specific utility functions

**Layer 4 (Model):**
- `lib/model/` - Data models and views

**Layer 5 (Collections):**
- `lib/collections/` - Static game data collections

**Layer 6 (Additional Lib Directories):**
- `lib/slices/` - Redux state management
- `lib/turn_advancement/` - Turn advancement logic
- `lib/component_utils/` - Component-specific utilities
- `lib/selectors/` - Redux selectors

**Layer 7 (Components):**
- `components/` - React UI components

**Layer 8 (App):**
- `app/` - Application setup and configuration

## Compliance with Dependency Rules

### Allowed Dependency Rules

According to `about_code_dependencies.md`, the following directory import rules apply:

```text
app              -> components
components       -> lib
lib/collections  -> lib/model
lib/model        -> lib/domain_utils
lib/domain_utils -> lib/ruleset
lib/ruleset      -> lib/utils
lib/utils        -> lib/primitives
```

### Compliance Analysis

#### ✅ Compliant Dependencies

1. **Utils → Primitives** (✅ Allowed)
   - `assertUtils.ts` → `mathPrimitives.ts` ✅
   - `fixed6Utils.ts` → `fixed6Primitives.ts`, `formatPrimitives.ts` ✅

2. **Ruleset → Utils** (✅ Allowed)
   - All ruleset files that import from utils are compliant ✅
   - Examples: `constants.ts`, `panicRuleset.ts`, `missionRuleset.ts`, `initialState.ts`, `debugInitialState.ts`

3. **Ruleset → Primitives** (✅ Allowed, transitively through utils rule)
   - All ruleset files that import from primitives are compliant ✅

4. **Domain Utils → Ruleset** (✅ Allowed)
   - `actorUtils.ts` → `constants.ts` ✅
   - `weaponUtils.ts` → `constants.ts` ✅

5. **Domain Utils → Primitives** (✅ Allowed, transitively through ruleset rule)
   - All domain_utils files that import from primitives are compliant ✅

6. **Model → Domain Utils** (✅ Allowed)
   - `agents/AgentView.ts` → `actorUtils.ts` ✅

7. **Model → Primitives** (✅ Allowed, transitively through domain_utils rule)
   - All model files that import from primitives are compliant ✅

8. **Collections → Model** (✅ Allowed)
   - All collections files that import from model are compliant ✅
   - Examples: `missions.ts`, `factions.ts`, `enemyUnits.ts`, `leads.ts`

9. **Collections → Utils/Primitives** (✅ Allowed, transitively through model rule)
   - Collections files importing from utils/primitives are compliant ✅

10. **Components → Lib** (✅ Allowed)
    - All components importing from lib are compliant ✅

11. **App → Components** (✅ Allowed)
    - `App.tsx` → components ✅

12. **No Import Cycles** (✅ Fully Compliant)
    - No cycles within any layer ✅
    - No circular dependencies between layers ✅

#### ⚠️ Direct Dependencies Not Explicitly Covered by Rules

The following dependencies exist but are not explicitly covered by the rules (they may be allowed by the general "same directory and subdirectories"
rule):

1. **Slices → Various Lib Directories** (⚠️ Not explicitly in rules)
   - Slices import from model, ruleset, domain_utils, collections, utils, primitives
   - **Analysis**: Slices are not explicitly mentioned in the rules. They appear to be at the same level as components (both can import from
     lib).

2. **Turn Advancement → Various Lib Directories** (⚠️ Not explicitly in rules)
   - Turn advancement imports from collections, model, ruleset, domain_utils, utils, primitives
   - **Analysis**: Similar to slices, turn_advancement is not explicitly mentioned in the rules.

#### ❌ Forbidden Dependencies (Violations)

The following dependencies are **FORBIDDEN** by the rules but exist in the codebase:

1. **lib/domain_utils → lib/collections** (❌ FORBIDDEN)
   - `lib/domain_utils/enemyUtils.ts` line 1:
     ```typescript
     import { ENEMY_STATS } from '../collections/enemyUnits'
     ```
   - `lib/domain_utils/missionSiteUtils.ts` line 1:
     ```typescript
     import { getMissionById } from '../collections/missions'
     ```
   - **Rule Violated**: `lib/domain_utils -> lib/collections` is forbidden
   - **Impact**: Domain utils bypass the model layer to access collections directly

2. **lib/domain_utils → lib/model** (❌ FORBIDDEN)
   - `lib/domain_utils/formatDomainUtils.ts` line 2:
     ```typescript
     import type { MissionSiteId } from '../model/model'
     ```
   - `lib/domain_utils/formatDomainUtils.ts` line 5:
     ```typescript
     import type { ValueChange } from '../model/turnReportModel'
     ```
   - `lib/domain_utils/weaponUtils.ts` line 2:
     ```typescript
     import type { Weapon } from '../model/model'
     ```
   - `lib/domain_utils/actorUtils.ts` line 3:
     ```typescript
     import type { Actor, Agent, Enemy } from '../model/model'
     ```
   - `lib/domain_utils/enemyUtils.ts` line 2:
     ```typescript
     import { ENEMY_TYPES, type Enemy, type EnemyType } from '../model/model'
     ```
   - `lib/domain_utils/missionSiteUtils.ts` line 2:
     ```typescript
     import type { MissionSite, MissionSiteState } from '../model/model'
     ```
   - `lib/domain_utils/turnReportUtils.ts` line 1:
     ```typescript
     import type { TurnReport } from '../model/turnReportModel'
     ```
   - **Rule Violated**: `lib/domain_utils -> lib/model` is forbidden
   - **Impact**: Domain utils should only depend on ruleset, not model

3. **lib/ruleset → lib/collections** (❌ FORBIDDEN)
   - `lib/ruleset/initialState.ts` line 2:
     ```typescript
     import { factions } from '../collections/factions'
     ```
   - `lib/ruleset/debugInitialState.ts` line 5:
     ```typescript
     import { getMissionById } from '../collections/missions'
     ```
   - **Rule Violated**: `lib/ruleset -> lib/collections` is forbidden
   - **Impact**: Ruleset bypasses model and domain_utils layers to access collections directly

4. **lib/ruleset → lib/model** (❌ FORBIDDEN)
   - `lib/ruleset/leadRuleset.ts` line 2:
     ```typescript
     import { agV } from '../model/agents/AgentView'
     ```
   - `lib/ruleset/leadRuleset.ts` line 4:
     ```typescript
     import type { Agent } from '../model/model'
     ```
   - `lib/ruleset/skillRuleset.ts` line 1:
     ```typescript
     import type { AgentView } from '../model/agents/AgentView'
     ```
   - `lib/ruleset/initialState.ts` line 3:
     ```typescript
     import type { Agent, GameState } from '../model/model'
     ```
   - `lib/ruleset/initialState.ts` line 4:
     ```typescript
     import { validateAgentInvariants } from '../model/agents/validateAgentInvariants'
     ```
   - `lib/ruleset/debugInitialState.ts` line 1:
     ```typescript
     import type { Agent, GameState, MissionSiteId } from '../model/model'
     ```
   - `lib/ruleset/panicRuleset.ts` line 3:
     ```typescript
     import type { GameState } from '../model/model'
     ```
   - `lib/ruleset/moneyRuleset.ts` line 1:
     ```typescript
     import { agsV, type AgentsView } from '../model/agents/AgentsView'
     ```
   - `lib/ruleset/moneyRuleset.ts` line 3:
     ```typescript
     import type { GameState } from '../model/model'
     ```
   - `lib/ruleset/intelRuleset.ts` line 1:
     ```typescript
     import { agsV, type AgentsView } from '../model/agents/AgentsView'
     ```
   - `lib/ruleset/intelRuleset.ts` line 3:
     ```typescript
     import type { GameState } from '../model/model'
     ```
   - `lib/ruleset/missionRuleset.ts` line 3:
     ```typescript
     import { agV } from '../model/agents/AgentView'
     ```
   - `lib/ruleset/missionRuleset.ts` line 6:
     ```typescript
     import type { Agent, Enemy, MissionSite } from '../model/model'
     ```
   - **Rule Violated**: `lib/ruleset -> lib/model` is forbidden
   - **Impact**: Ruleset bypasses domain_utils layer to access model directly

5. **lib/ruleset → lib/domain_utils** (❌ FORBIDDEN)
   - `lib/ruleset/initialState.ts` line 18:
     ```typescript
     import { newWeapon } from '../domain_utils/weaponUtils'
     ```
   - `lib/ruleset/debugInitialState.ts` line 3:
     ```typescript
     import { newWeapon } from '../domain_utils/weaponUtils'
     ```
   - `lib/ruleset/debugInitialState.ts` line 4:
     ```typescript
     import { newEnemiesFromSpec } from '../domain_utils/enemyUtils'
     ```
   - `lib/ruleset/missionRuleset.ts` line 2:
     ```typescript
     import { effectiveSkill } from '../domain_utils/actorUtils'
     ```
   - **Rule Violated**: `lib/ruleset -> lib/domain_utils` is forbidden
   - **Impact**: Ruleset should only depend on utils/primitives, not domain_utils

#### ⚠️ Additional Issues Not Explicitly Forbidden

1. **Component Utils → Components** (⚠️ Reverse Dependency)
   - `lib/component_utils/dataGridUtils.ts` line 2-3:
     ```typescript
     import type { AgentRow } from '../../components/AgentsDataGrid/AgentsDataGrid'
     import type { LeadInvestigationRow } from '../../components/LeadInvestigationsDataGrid'
     ```
   - **Issue**: Creates reverse dependency (lib → components)
   - **Impact**: Could cause circular dependencies

2. **Selectors → App** (⚠️ Reverse Dependency)
   - `lib/selectors/selectors.ts` line 2:
     ```typescript
     import type { RootState } from '../../app/store'
     ```
   - **Issue**: Creates reverse dependency (lib → app)
   - **Impact**: Could cause circular dependencies

### Summary

#### Overall Compliance: ❌ NON-COMPLIANT

- **No circular dependencies** ✅
- **5 categories of forbidden dependencies** found with **multiple violations**:
  1. `lib/domain_utils` → `lib/collections` (2 violations)
  2. `lib/domain_utils` → `lib/model` (7 violations)
  3. `lib/ruleset` → `lib/collections` (2 violations)
  4. `lib/ruleset` → `lib/model` (12 violations)
  5. `lib/ruleset` → `lib/domain_utils` (4 violations)
- **2 additional reverse dependency issues**:
  1. `lib/component_utils/` → `components/` (reverse dependency)
  2. `lib/selectors/` → `app/` (reverse dependency)

### Recommendations

To achieve full compliance, resolve all forbidden dependencies:

#### Priority 1: Fix Forbidden Dependencies

1. **Resolve lib/domain_utils → lib/collections:**
   - Move collection accessors (`getMissionById`, `ENEMY_STATS`) to model layer
   - Have domain_utils import from model instead of collections
   - Example: Create `lib/model/collections.ts` that re-exports collection functions

2. **Resolve lib/domain_utils → lib/model:**
   - Move type definitions to a shared location that domain_utils can access
   - Or restructure so domain_utils doesn't need model types directly
   - Consider if domain_utils should be split into different layers

3. **Resolve lib/ruleset → lib/collections:**
   - Pass collections data as parameters instead of importing directly
   - Move collection access to a higher layer (e.g., in initialState creation)
   - Example: Have initialState.ts receive factions as a parameter

4. **Resolve lib/ruleset → lib/model:**
   - Pass model types/views as parameters instead of importing directly
   - Create adapter functions in domain_utils that ruleset can use
   - Example: Instead of importing `AgentView`, pass agent data as parameters

5. **Resolve lib/ruleset → lib/domain_utils:**
   - Move domain_utils functions that ruleset needs into utils layer
   - Or restructure so ruleset doesn't need domain_utils functions
   - Example: Move `newWeapon`, `newEnemiesFromSpec` to utils or ruleset

#### Priority 2: Fix Reverse Dependencies

1. **Resolve Component Utils → Components:**
   - Move `dataGridUtils.ts` to `components/` directory
   - Or create shared types in `lib/model/` that both can use
   - Or refactor to pass types as parameters

2. **Resolve Selectors → App:**
   - Move `selectors.ts` to `app/` directory
   - Or move `RootState` type to `lib/model/` or a shared location
   - Or create a `lib/types/` directory for shared types

#### Additional Considerations

1. **Clarify rules for additional directories:**
   - Add explicit rules for `lib/slices/`, `lib/turn_advancement/`, `lib/component_utils/`, `lib/selectors/`
   - Determine their position in the dependency hierarchy
   - Consider if these directories should be restructured to fit the existing rules
