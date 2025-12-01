# Dependency violations

This document lists violations of the dependency constraints defined in `about_code_dependencies.md`.

## Violations

### 1. `lib/ruleset` importing from `lib/turn_advancement`

**File**: `web/src/lib/ruleset/missionRuleset.ts`

**Violation**: Line 1 imports `AgentCombatStats` type from `../turn_advancement/evaluateAttack`

```typescript
import type { AgentCombatStats } from '../turn_advancement/evaluateAttack'
```

**Rule violated**: According to the dependency hierarchy, `lib/ruleset` can only depend on:
- `lib/model_utils`
- `lib/collections`
- `lib/model`
- `lib/utils`
- `lib/primitives`

`lib/ruleset` cannot depend on `lib/turn_advancement` (which is higher in the dependency hierarchy).

### 2. `lib/component_utils` importing from `components`

**File**: `web/src/lib/component_utils/dataGridUtils.ts`

**Violation**: Lines 2-3 import types from `components` directory

```typescript
import type { AgentRow } from '../../components/AgentsDataGrid/AgentsDataGrid'
import type { LeadInvestigationRow } from '../../components/LeadInvestigationsDataGrid'
```

**Rule violated**: `lib/component_utils` is not listed in the dependency rules, so it follows default rules.
According to default rules, code in `lib/component_utils` cannot import from other directories (like `components`).
Additionally, `lib/*` directories should not import from `components` directory.

### 3. `lib/selectors` importing from `app`

**File**: `web/src/lib/selectors/selectors.ts`

**Violation**: Line 2 imports `RootState` type from `app/store`

```typescript
import type { RootState } from '../../app/store'
```

**Rule violated**: `lib/selectors` is not listed in the dependency rules, so it follows default rules.
According to default rules, code in `lib/selectors` cannot import from other directories (like `app`).
Additionally, `lib/*` directories should not import from `app` directory.

### 4. `lib/slices` not listed in dependency rules

**Directory**: `web/src/lib/slices`

**Issue**: The `lib/slices` directory is not listed in the dependency hierarchy rules, but it is being imported by:
- `app` directory (e.g., `app/store.ts`, `app/eventsMiddleware.ts`)
- `components` directory (multiple files)

**Current imports in `lib/slices`**: Files in `lib/slices` import from:
- `lib/ruleset`
- `lib/model`
- `lib/collections`
- `lib/utils`
- `lib/model_utils`
- `lib/turn_advancement` (in `lib/slices/reducers/gameControlsReducers.ts`)

**Recommendation**: Either:
1. Add `lib/slices` to the dependency hierarchy rules with appropriate position, or
2. If `lib/slices` should follow default rules, it should only import from itself and external code,
   which would require significant refactoring.
