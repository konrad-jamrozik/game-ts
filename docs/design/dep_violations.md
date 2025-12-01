# Dependency Violations

This document lists violations of the dependency constraints defined in `about_code_dependencies.md`.

## Violations

### 1. `lib/turn_advancement` imports from `lib/domain_utils` (VIOLATION)

According to the dependency rules, `lib/turn_advancement` is below `lib/domain_utils` in the hierarchy,
so it cannot depend on `lib/domain_utils`.

**Violating files:**

- `web/src/lib/turn_advancement/evaluateAttack.ts`
  - Imports from `../domain_utils/actorUtils`
  - Imports from `../domain_utils/fmtAttackLog`
  - Imports from `../domain_utils/weaponUtils`

- `web/src/lib/turn_advancement/updateAgents.ts`
  - Imports from `../domain_utils/actorUtils`

- `web/src/lib/turn_advancement/updateLeadInvestigations.ts`
  - Imports from `../domain_utils/enemyUtils`

- `web/src/lib/turn_advancement/evaluateDeployedMissionSite.ts`
  - Imports from `../domain_utils/actorUtils`

- `web/src/lib/turn_advancement/evaluateBattle.ts`
  - Imports from `../domain_utils/actorUtils`

### 2. `lib/ruleset` imports from `lib/domain_utils` (VIOLATION)

According to the dependency rules, `lib/ruleset` is below `lib/domain_utils` in the hierarchy, so it cannot depend on `lib/domain_utils`.

**Violating files:**

- `web/src/lib/ruleset/skillRuleset.ts`
  - Imports from `../domain_utils/actorUtils`

- `web/src/lib/ruleset/missionRuleset.ts`
  - Imports from `../domain_utils/actorUtils`

- `web/src/lib/ruleset/initialState.ts`
  - Imports from `../domain_utils/weaponUtils`

- `web/src/lib/ruleset/debugInitialState.ts`
  - Imports from `../domain_utils/weaponUtils`
  - Imports from `../domain_utils/enemyUtils`

### 3. `lib/selectors` imports from `app` (VIOLATION)

According to the dependency rules, `lib/selectors` is not in the allowed list of directories,
so by default it can only import from itself and subdirectories. It cannot import from `app/`.

**Violating files:**

- `web/src/lib/selectors/selectors.ts`
  - Imports from `../../app/store`

### 4. `lib/component_utils` imports from `components` (VIOLATION)

According to the dependency rules, `lib/component_utils` is not in the allowed list of directories,
so by default it can only import from itself and subdirectories. It cannot import from `components/`.

**Violating files:**

- `web/src/lib/component_utils/dataGridUtils.ts`
  - Imports from `../../components/AgentsDataGrid/AgentsDataGrid`
  - Imports from `../../components/LeadInvestigationsDataGrid`
