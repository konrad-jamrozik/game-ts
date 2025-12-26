---
name: Add Fixed6-native assert functions and refactor usage
overview: Create additional Fixed6-native assert functions (f6assertEqual, f6assertLessThanOrEqual, f6assertGreaterThan, f6assertGreaterThanOrEqual, f6assertNonNeg) and refactor validateAgentInvariants.ts to use them, replacing manual if/throw patterns and assertEqual calls on .value properties.
todos:
  - id: create-f6assert-functions
    content: Add f6assertEqual, f6assertLessThanOrEqual, f6assertGreaterThan, f6assertGreaterThanOrEqual, and f6assertNonNeg to fixed6assertPrimitives.ts
    status: pending
  - id: refactor-validateBasicStatRanges
    content: Refactor validateBasicStatRanges in validateAgentInvariants.ts to use new Fixed6 assert functions
    status: pending
    dependencies:
      - create-f6assert-functions
  - id: refactor-validateTermination
    content: Refactor validateTermination in validateAgentInvariants.ts to use f6assertEqual instead of assertEqual on .value properties
    status: pending
    dependencies:
      - create-f6assert-functions
  - id: refactor-validateRecoveryMath
    content: Refactor validateRecoveryMath in validateAgentInvariants.ts to use f6assertLessThanOrEqual
    status: pending
    dependencies:
      - create-f6assert-functions
  - id: update-imports
    content: Update imports in validateAgentInvariants.ts to include new Fixed6 assert functions and remove unused assertEqual if applicable
    status: pending
    dependencies:
      - refactor-validateBasicStatRanges
      - refactor-validateTermination
      - refactor-validateRecoveryMath
  - id: verify-tests
    content: Run qcheck to verify all tests pass and no dependency cycles are introduced
    status: pending
    dependencies:
      - update-imports
---

# Add Fixed6-native assert functions and refactor usage

## Overview

Create additional Fixed6-native assert functions in `fixed6assertPrimitives.ts` to match the pattern in `assertPrimitives.ts`, and refactor `validateAgentInvariants.ts` to use them instead of manual if/throw patterns and `assertEqual` calls on `.value` properties.

## New Functions to Create

Add the following functions to `web/src/lib/primitives/fixed6assertPrimitives.ts`:

1. **f6assertEqual** - Asserts two Fixed6 values are equal

- Replaces `assertEqual(agent.hitPoints.value, f6c0.value, ...)` patterns
- Uses `f6eq` for comparison
- Formats both values in error message

2. **f6assertLessThanOrEqual** - Asserts left <= right

- Uses `f6le` for comparison
- Useful for validating `hitPoints <= maxHitPoints`

3. **f6assertGreaterThan** - Asserts left > right

- Uses `f6gt` for comparison
- Useful for validating values are above a threshold

4. **f6assertGreaterThanOrEqual** - Asserts left >= right

- Uses `f6ge` for comparison
- Replaces `f6lt(value, f6c0)` patterns (checking for non-negative)

5. **f6assertNonNeg** - Asserts value >= 0

- Convenience function using `f6ge(value, f6c0)`
- Similar to `assertNonNeg` in assertPrimitives.ts

## Refactoring Opportunities

### Primary Target: `web/src/lib/model_utils/validateAgentInvariants.ts`

1. **validateBasicStatRanges function** (lines 25-40):

- Line 26: Replace `if (f6lt(agent.hitPoints, f6c0) || f6gt(agent.hitPoints, agent.maxHitPoints))` with:
    - `f6assertGreaterThanOrEqual(agent.hitPoints, f6c0, ...)`
    - `f6assertLessThanOrEqual(agent.hitPoints, agent.maxHitPoints, ...)`
- Line 31: Replace `if (f6lt(agent.exhaustionPct, f6c0))` with `f6assertNonNeg(agent.exhaustionPct, ...)`
- Line 34: Replace `if (f6lt(agent.skill, f6c0))` with `f6assertNonNeg(agent.skill, ...)`
- Line 37: Replace `if (f6le(agent.maxHitPoints, f6c0))` with `f6assertAboveZero(agent.maxHitPoints, ...)`

2. **validateTermination function** (lines 42-62):

- Line 45: Replace `assertEqual(agent.hitPoints.value, f6c0.value, ...)` with `f6assertEqual(agent.hitPoints, f6c0, ...)`
- Lines 53-56: Replace `assertEqual(agent.hitPoints.value, agent.maxHitPoints.value, ...)` with `f6assertEqual(agent.hitPoints, agent.maxHitPoints, ...)`

3. **validateRecoveryMath function** (lines 84-105):

- Line 100: Replace `if (agent.state === 'Recovering' && f6gt(agent.hitPoints, agent.maxHitPoints))` with:
    - Keep the state check, but use `f6assertLessThanOrEqual(agent.hitPoints, agent.maxHitPoints, ...)` inside

## Implementation Details

- All functions should follow the same pattern as existing `f6assertAboveZero` and `f6assertLessThan`
- Use `toF()` for formatting Fixed6 values in error messages
- Import necessary Fixed6 comparison functions (`f6eq`, `f6le`, `f6gt`, `f6ge`) from `fixed6.ts`
- Update imports in `validateAgentInvariants.ts` to include the new assert functions
- Remove imports of `assertEqual` if no longer needed (check if used elsewhere in the file)

## Benefits