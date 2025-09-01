# Plan: Modify evaluateBattle Test with Controllable Random and Weapon System

## Overview

This plan outlines the changes needed to modify the `evaluateBattle -> player wins in 1 round` test to:
1. Use 1 agent instead of 5 agents
2. Create the agent with a weapon that always does 100 damage
3. Implement a controllable random system for deterministic testing
4. Make the agent always roll maximum values when attacking

## Current State Analysis

### Current Test Structure

- Test creates 5 agents with skill 500
- Uses `st.newAgents({ count: 5, skill: 500 })`
- Enemy is created with `st.newEnemyInitiate()`
- Expected result: 2 rounds (commented as should be 1 round)

### Current Random System

- `rollContest()` → `roll1to()` → `rollRange()` → `Math.random()`
- `rollWeaponDamage()` → `rollRange()` → `Math.random()`
- No controllable random system exists

### Current Weapon System

- Weapon type: `{ damage: number, minDamage: number, maxDamage: number }`
- No `constDamage` property exists currently
- `rollWeaponDamage()` rolls between `minDamage` and `maxDamage`

## Implementation Plan

### Phase 1: Extend Weapon Type to Support Constant Damage

#### 1.1 Modify Weapon Type

**File**: `web/src/lib/model/model.ts`
- Add optional `constDamage?: number` property to Weapon type

#### 1.2 Update Weapon Damage Rolling Logic

**File**: `web/src/lib/utils/weaponUtils.ts`
- Modify `rollWeaponDamage()` to check for `constDamage` property first
- If `constDamage` exists, return it directly
- Otherwise, use existing `rollRange()` logic

#### 1.3 Update Weapon Fixture

**File**: `web/test/fixtures/weaponFixture.ts`
- Ensure `wpnFix.new()` supports `constDamage` override

### Phase 2: Implement Controllable Random System

#### 2.1 Create Controllable Random Service

**File**: `web/src/lib/utils/controllableRandom.ts` (new file)
```typescript
type RandomProvider = {
  get(label: string): number
  set(label: string, value: number): void
  reset(): void
}
```

- Create singleton instance `rand` that defaults to `Math.random()` behavior
- Support setting specific values for labeled calls
- Support resetting to default behavior

#### 2.2 Update Roll Functions to Use Controllable Random

**File**: `web/src/lib/turn_advancement/rolls.ts`
- Modify `rollRange()` to accept optional `label` parameter
- Replace `Math.random()` with `rand.get(label)` when label provided
- Fall back to `Math.random()` when no label provided

**File**: `web/src/lib/utils/mathUtils.ts`
- Update any other functions that use `Math.random()` if needed

### Phase 3: Plumb Through Random Labels

#### 3.1 Update Contest Roll Chain

**File**: `web/src/lib/turn_advancement/rolls.ts`
- Add optional `label` parameter to `rollContest()`
- Pass label through to `roll1to()` → `rollRange()`

#### 3.2 Update Attack Evaluation

**File**: `web/src/lib/turn_advancement/evaluateAttack.ts`
- Add optional `label` parameter to `evaluateAttack()`
- Determine if attacker is player agent
- Pass appropriate label ("player_agent_attack_roll" vs "enemy_attack_roll") to `rollContest()`

#### 3.3 Update Combat Round Evaluation

**File**: `web/src/lib/turn_advancement/evaluateBattle.ts`
- Modify `evaluateCombatRound()` to track context (agent vs enemy attacking)
- Pass appropriate labels when calling `evaluateAttack()`
- Agent attacks: use "player_agent_attack_roll" label
- Enemy attacks: no label (default random behavior)

### Phase 4: Update Test Infrastructure

#### 4.1 Create Test Utilities

**File**: `web/test/utils/testUtils.ts`
- Add utilities for setting up controllable random in tests
- Add cleanup utilities for resetting random state

#### 4.2 Update Test Setup

**File**: `web/test/utils/setupAllTests.ts`
- Ensure random state is reset between tests

### Phase 5: Modify the Target Test

#### 5.1 Update Test Case

**File**: `web/test/unit/evaluateBattle.test.ts`

Changes needed:
```typescript
test('evaluateBattle -> player wins in 1 round', () => {
  // Import rand utility and weapon fixture
  import { rand } from '../../src/lib/utils/controllableRandom'
  import { wpnFix } from '../fixtures/weaponFixture'
  
  // Create 1 agent with constant damage weapon
  const agentId = 'agent-001'
  const agent = st.newAgent({ 
    id: agentId,
    weapon: wpnFix.new({ constDamage: 100 })
  })
  const agentsView = agsV([agent])
  const enemy = st.newEnemyInitiate()

  // Set up controllable random to make agent always roll max
  rand.set("player_agent_attack_roll", 1.0) // Max roll value
  
  const report = evaluateBattle(agentsView, [enemy]) // Act
  
  // Clean up
  rand.reset()

  expectReportToBe(report)({
    rounds: 1, // Should now be 1 round as expected
    agentCasualties: 0,
    enemyCasualties: 1,
    retreated: false,
    agentSkillUpdates: { [agentId]: expect.any(Number) },
  })
})
```

## Implementation Order

1. **Phase 1**: Extend weapon system for constant damage
2. **Phase 2**: Create controllable random infrastructure  
3. **Phase 3**: Plumb labels through the call chain
4. **Phase 4**: Set up test infrastructure
5. **Phase 5**: Modify the actual test

## Key Considerations

### Random Label Strategy

- Use descriptive labels: "player_agent_attack_roll", "enemy_attack_roll", "weapon_damage_roll"
- Only apply labels where deterministic behavior is needed
- Default to normal `Math.random()` for unlabeled calls

### Backwards Compatibility

- All existing functionality should work unchanged
- New parameters should be optional
- Default behavior should match current behavior

### Test Isolation

- Each test should reset random state
- Random state should not leak between tests
- Setup/teardown should be automatic

### Error Handling

- Invalid label usage should not break the system
- Clear error messages for debugging
- Graceful fallback to default random behavior

## Files to be Modified

### New Files

- `web/src/lib/utils/controllableRandom.ts`

### Modified Files

- `web/src/lib/model/model.ts` (Weapon type)
- `web/src/lib/utils/weaponUtils.ts` (constDamage support)
- `web/src/lib/turn_advancement/rolls.ts` (labels, controllable random)
- `web/src/lib/turn_advancement/evaluateAttack.ts` (label passing)
- `web/src/lib/turn_advancement/evaluateBattle.ts` (label context)
- `web/test/unit/evaluateBattle.test.ts` (test modification)
- `web/test/utils/testUtils.ts` (test utilities)
- `web/test/utils/setupAllTests.ts` (cleanup setup)

## Expected Test Behavior After Changes

With the controllable random system:
- Agent with `constDamage: 100` weapon will always deal 100 damage
- Agent will always succeed contest rolls (by setting roll to max value)
- Single agent should defeat single enemy in 1 round
- Test expectation changes from 2 rounds to 1 round

## Validation Steps

1. Run existing tests to ensure no regressions
2. Verify new test passes with expected rounds: 1
3. Test random system in isolation
4. Verify weapon constDamage functionality
5. Run full test suite to ensure system stability
