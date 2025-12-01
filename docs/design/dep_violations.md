# Dependency Violations for lib/model_utils

According to the dependency rules in `about_code_dependencies.md`, `lib/model_utils` can only depend on:
- `lib/collections`
- `lib/model`
- `lib/utils`
- `lib/primitives`

`lib/model_utils` CANNOT depend on:
- `app`
- `components`
- `lib/domain_utils`
- `lib/turn_advancement`
- `lib/ruleset`

## Violations Found

### Current Status

**No violations found.** ✅

All files in `lib/model_utils` have been checked and none import from `lib/ruleset`:

- `AgentsView.ts` - No imports from `lib/ruleset`
- `AgentView.ts` - No imports from `lib/ruleset`
- `gameStateUtils.ts` - No imports from `lib/ruleset`
- `validateAgentInvariants.ts` - No imports from `lib/ruleset`
- `validateAgents.ts` - No imports from `lib/ruleset`
- `validateGameStateInvariants.ts` - No imports from `lib/ruleset`

## Historical Context

Previously, `AgentsView.ts` had dependencies on `lib/ruleset`:
- `import { getContractingIncome } from '../ruleset/moneyRuleset'`
- `import { getEspionageIntel } from '../ruleset/intelRuleset'`

These were removed by:
1. Creating V2 versions of the ruleset functions (`getContractingIncomeV2`, `getEspionageIntelV2`) that take `GameState` directly
2. Removing the `contractingIncome()` and `espionageIntel()` methods from `AgentsView`
3. Updating all callers to use the V2 functions instead

## Summary

Total violations: **0**
