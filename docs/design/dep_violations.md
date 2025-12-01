# Dependency Violations: lib/model → lib/utils and lib/primitives only

This document lists all violations where `lib/model` imports from directories other than `lib/utils` and `lib/primitives`.

## Rule

`lib/model` is allowed to depend **only** on:
- `lib/utils`
- `lib/primitives`

`lib/model` is **FORBIDDEN** from depending on:
- `lib/ruleset`
- `lib/domain_utils`
- `lib/collections`
- Any other `lib/` subdirectories

## Violations

### 1. lib/model/agents/AgentView.ts → lib/domain_utils (FORBIDDEN)

**File**: `web/src/lib/model/agents/AgentView.ts`  
**Line**: 1  
**Import**:
```typescript
import { effectiveSkill } from '../../domain_utils/actorUtils'
```

**Symbol**: `effectiveSkill` function  
**Rule Violated**: `lib/model -> lib/domain_utils` is forbidden  
**Impact**: AgentView depends on domain_utils, violating the rule that model should only depend on utils and primitives

---

### 2. lib/model/agents/AgentsView.ts → lib/ruleset (FORBIDDEN)

**File**: `web/src/lib/model/agents/AgentsView.ts`  
**Line**: 4  
**Import**:
```typescript
import { getAgentUpkeep, getContractingIncome } from '../../ruleset/moneyRuleset'
```

**Symbols**: `getAgentUpkeep`, `getContractingIncome` functions  
**Rule Violated**: `lib/model -> lib/ruleset` is forbidden  
**Impact**: AgentsView depends on ruleset, violating the rule that model should only depend on utils and primitives

---

### 3. lib/model/agents/AgentsView.ts → lib/ruleset (FORBIDDEN)

**File**: `web/src/lib/model/agents/AgentsView.ts`  
**Line**: 5  
**Import**:
```typescript
import { getEspionageIntel } from '../../ruleset/intelRuleset'
```

**Symbol**: `getEspionageIntel` function  
**Rule Violated**: `lib/model -> lib/ruleset` is forbidden  
**Impact**: AgentsView depends on ruleset, violating the rule that model should only depend on utils and primitives

---

## Summary

**Total Violations**: 3

- **lib/model → lib/domain_utils**: 1 violation
  - `agents/AgentView.ts` imports `effectiveSkill` from `domain_utils/actorUtils`

- **lib/model → lib/ruleset**: 2 violations
  - `agents/AgentsView.ts` imports `getAgentUpkeep`, `getContractingIncome` from `ruleset/moneyRuleset`
  - `agents/AgentsView.ts` imports `getEspionageIntel` from `ruleset/intelRuleset`

## Compliant Dependencies

The following files in `lib/model` correctly only depend on `lib/utils` and `lib/primitives`:

- ✅ `lib/model/model.ts` → `lib/primitives/fixed6Primitives` (type import)
- ✅ `lib/model/turnReportModel.ts` → `lib/primitives/fixed6Primitives` (type and function imports)
- ✅ `lib/model/agents/validateAgentInvariants.ts` → `lib/utils/fixed6Utils`, `lib/primitives/*` (multiple primitives)
- ✅ `lib/model/agents/validateAgents.ts` → (only internal model imports)
- ✅ `lib/model/validateGameStateInvariants.ts` → (only internal model imports)

## Recommendations

To fix these violations:

1. **AgentView.ts → domain_utils/actorUtils:**
   - Move `effectiveSkill` function to `lib/utils/` or `lib/primitives/`
   - Or pass `effectiveSkill` as a parameter to `agV()` function
   - Or create a wrapper in `lib/utils/` that calls `effectiveSkill` from domain_utils

2. **AgentsView.ts → ruleset/moneyRuleset and intelRuleset:**
   - Move `getAgentUpkeep`, `getContractingIncome`, `getEspionageIntel` to `lib/utils/`
   - Or pass these functions as parameters to `agsV()` or the methods that use them
   - Or refactor AgentsView methods to accept these values as parameters instead of computing them internally
