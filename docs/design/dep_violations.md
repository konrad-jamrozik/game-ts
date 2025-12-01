# Dependency Violations for lib/ruleset

According to the dependency rules in `about_code_dependencies.md`, `lib/ruleset` can only depend on:
- `lib/collections`
- `lib/model`
- `lib/utils`
- `lib/primitives`

`lib/ruleset` CANNOT depend on:
- `app`
- `components`
- `lib/domain_utils`
- `lib/turn_advancement`
- `lib/model_utils`

## Violations Found

### debugInitialState.ts

- **Line 5**: `import { newWeapon } from '../domain_utils/weaponUtils'`
  - Violates: Cannot import from `lib/domain_utils`

- **Line 6**: `import { newEnemiesFromSpec } from '../domain_utils/enemyUtils'`
  - Violates: Cannot import from `lib/domain_utils`

### initialState.ts

- **Line 5**: `import { validateAgentInvariants } from '../model_utils/validateAgentInvariants'`
  - Violates: Cannot import from `lib/model_utils`

- **Line 19**: `import { newWeapon } from '../domain_utils/weaponUtils'`
  - Violates: Cannot import from `lib/domain_utils`

### intelRuleset.ts

- **Line 1**: `import { agsV, type AgentsView } from '../model_utils/AgentsView'`
  - Violates: Cannot import from `lib/model_utils`

### leadRuleset.ts

- **Line 2**: `import { agV } from '../model_utils/AgentView'`
  - Violates: Cannot import from `lib/model_utils`

### missionRuleset.ts

- **Line 1**: `import type { AgentCombatStats } from '../turn_advancement/evaluateAttack'`
  - Violates: Cannot import from `lib/turn_advancement`

- **Line 2**: `import { effectiveSkill } from '../domain_utils/actorUtils'`
  - Violates: Cannot import from `lib/domain_utils`

- **Line 3**: `import { agV } from '../model_utils/AgentView'`
  - Violates: Cannot import from `lib/model_utils`

### moneyRuleset.ts

- **Line 1**: `import { agsV, type AgentsView } from '../model_utils/AgentsView'`
  - Violates: Cannot import from `lib/model_utils`

### skillRuleset.ts

- **Line 1**: `import type { AgentView } from '../model_utils/AgentView'`
  - Violates: Cannot import from `lib/model_utils`

## Summary

Total violations: **11**

Breakdown by forbidden directory:
- `lib/model_utils`: **6 violations**
- `lib/domain_utils`: **4 violations**
- `lib/turn_advancement`: **1 violation**

Files with violations:
- `debugInitialState.ts`: 2 violations
- `initialState.ts`: 2 violations
- `intelRuleset.ts`: 1 violation
- `leadRuleset.ts`: 1 violation
- `missionRuleset.ts`: 3 violations
- `moneyRuleset.ts`: 1 violation
- `skillRuleset.ts`: 1 violation
