---
name: Migrate direct agent creations to bldAgent
overview: Find and migrate all direct Agent object literal creations in unit test files to use the `bldAgent` factory function instead.
todos: []
---

# Migrate Direct Agent Creations to bldAgent

## Overview

Replace all direct Agent object literal creations in unit test files with calls to `bldAgent` factory function. This ensures consistency and leverages the factory pattern established in the codebase.

## Files to Update

### 1. `web/test/unit/evaluateDeployedMission.test.ts`

This file contains 3 direct agent creations that need to be migrated:**Test 1: 'evaluateDeployedMission succeeds' (lines 23-35)**

- Current: Direct object literal with `id: 'agent-001'`, `state: 'OnMission'`, `assignment: 'mission-001'`, `skill: toF6(200)`, etc.
- Migration: Replace with `bldAgent({ id: 'agent-001', state: 'OnMission', assignment: 'mission-001', skill: toF6(200), skillFromTraining: toF6(0), exhaustionPct: 0, missionsTotal: 1 })`
- Note: `hitPoints`, `maxHitPoints`, and `weapon` will use defaults from `initialAgent` via `bldAgent`

**Test 2: 'agent KIA' (lines 98-110)**

- Current: Direct object literal with `id: 'agent-001'`, low skill and hit points
- Migration: Replace with `bldAgent({ id: 'agent-001', state: 'OnMission', assignment: 'mission-001', skill: toF6(50), skillFromTraining: toF6(0), exhaustionPct: 0, hitPoints: toF6(10), maxHitPoints: initialAgent.maxHitPoints, missionsTotal: 0 })`

**Test 3: 'failure: all agents terminated' (lines 171-197)**

- Current: Two direct object literals (`agent1` and `agent2`)
- Migration: Replace both with `bldAgent` calls:
- `agent1`: `bldAgent({ id: 'agent-001', state: 'OnMission', assignment: 'mission-001', skill: toF6(60), skillFromTraining: toF6(0), exhaustionPct: 0, hitPoints: toF6(10), maxHitPoints: 10, missionsTotal: 0 })`
- `agent2`: `bldAgent({ id: 'agent-002', state: 'OnMission', assignment: 'mission-001', skill: toF6(50), skillFromTraining: toF6(0), exhaustionPct: 0, hitPoints: toF6(10), maxHitPoints: 10, missionsTotal: 0 })`

## Implementation Steps

1. Add import for `bldAgent` in `evaluateDeployedMission.test.ts` (if not already present)
2. Replace the first `testAgent` object literal (line 23) with `bldAgent` call
3. Replace the second `testAgent` object literal (line 98) with `bldAgent` call
4. Replace `agent1` object literal (line 171) with `bldAgent` call
5. Replace `agent2` object literal (line 185) with `bldAgent` call
6. Remove the `initialAgent` import if it's no longer needed (it's only used for `initialAgent.hitPoints`, `initialAgent.maxHitPoints`, and `initialAgent.weapon` which will come from defaults)
7. Run `qcheck` to verify all tests still pass

## Notes

- The `bldAgent` function uses `initialAgent` as a prototype, so properties not explicitly provided will use defaults
- All three test cases use explicit IDs (`'agent-001'`, `'agent-002'`), so we use the `{ id: ... }` form of `CreateAgentParams`
- The `weapon` property can be omitted as it will default to `initialWeapon` from the factory
- The `hitPoints` and `maxHitPoints` can be explicitly set where needed (test 2 and 3), or will use defaults (test 1)

## Verification

After migration, verify:

- All tests in `evaluateDeployedMission.test.ts` still pass
- No TypeScript compilation errors