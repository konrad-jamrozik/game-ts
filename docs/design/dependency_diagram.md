# Dependency Diagram

This document shows the actual dependency structure of the codebase, compared to the expected dependencies defined in `about_code_dependencies.md`.

## Expected Dependency Hierarchy

According to `about_code_dependencies.md`, the dependency hierarchy should be:

```text
app
  ↓
components
  ↓
lib/game_utils
  ↓
lib/ruleset
  ↓
lib/model_utils
  ↓
lib/collections
  ↓
lib/model
  ↓
lib/utils
  ↓
lib/primitives
```

**Special rules:**

- `lib/slices` → `lib/game_utils` (and everything below it)
- `lib/selectors` → `lib/model` (and everything below it)

## Actual Dependency Structure

### app/

**Imports from:**
- `lib/slices` (eventsSlice, gameStateSlice, selectionSlice, settingsSlice, reducers/asPlayerAction)
- `lib/collections` (missions)
- `lib/model_utils` (formatModelUtils)
- `lib/primitives` (assertPrimitives)

**Expected:** Can import from all directories below it in the hierarchy.

**Status:** ✅ Compliant - imports are from allowed directories.

### components/

**Imports from:**
- `app/` (hooks, store, persist)
- `lib/slices` (various slices)
- `lib/game_utils` (indirectly through slices)
- `lib/ruleset` (constants, various rulesets)
- `lib/model_utils` (formatModelUtils, agentUtils, missionSiteUtils, validateAgents, turnReportUtils)
- `lib/collections` (missions, leads)
- `lib/model` (various model types)
- `lib/utils` (fixed6Utils)
- `lib/primitives` (fixed6Primitives, formatPrimitives, assertPrimitives, mathPrimitives)
- `styling/` (theme, styleUtils)

**Expected:** Can import from all directories below it in the hierarchy (not from `app/`).

**Status:** ⚠️ Partially compliant - imports from `app/` are allowed for hooks/store access (common React/Redux pattern).

### lib/slices/

**Imports from:**
- `lib/game_utils` (evaluateTurn)
- `lib/ruleset` (initialState, constants)
- `lib/model` (GameState, Agent, etc.)

**Expected:** Can only import from `lib/game_utils` and directories below it.

**Status:** ✅ Compliant - all imports are from allowed directories.

### lib/game_utils/

**Imports from:**
- `lib/ruleset` (constants, missionRuleset, skillRuleset, weaponRuleset, panicRuleset,
  recoveryRuleset, moneyRuleset, intelRuleset, leadRuleset, enemyRuleset)
- `lib/model_utils` (agentUtils, validateGameStateInvariants)
- `lib/collections` (missions, leads)
- `lib/model` (various model types)
- `lib/utils` (fixed6Utils, rolls, fmtAttackLog)
- `lib/primitives` (fixed6Primitives, assertPrimitives, formatPrimitives, mathPrimitives, rand, stringPrimitives)

**Expected:** Can import from all directories below it in the hierarchy.

**Status:** ✅ Compliant - all imports are from allowed directories.

### lib/ruleset/

**Imports from:**
- `lib/model_utils` (validateAgentInvariants)
- `lib/collections` (factions)
- `lib/model` (Agent, GameState)
- `lib/utils` (fixed6Utils)
- `lib/primitives` (various primitives)

**Expected:** Can import from all directories below it in the hierarchy.

**Status:** ✅ Compliant - all imports are from allowed directories.

### lib/model_utils/

**Imports from:**
- `lib/collections` (various collections)
- `lib/model` (various model types)
- `lib/utils` (fixed6Utils)
- `lib/primitives` (various primitives)

**Expected:** Can import from all directories below it in the hierarchy.

**Status:** ✅ Compliant - all imports are from allowed directories.

### lib/collections/

**Imports from:**
- `lib/model` (various model types)
- `lib/utils` (if any)
- `lib/primitives` (if any)

**Expected:** Can import from all directories below it in the hierarchy.

**Status:** ✅ Compliant - imports are from allowed directories.

### lib/model/

**Imports from:**
- `lib/utils` (if any)
- `lib/primitives` (if any)

**Expected:** Can import from all directories below it in the hierarchy.

**Status:** ✅ Compliant - imports are from allowed directories.

### lib/utils/

**Imports from:**
- `lib/primitives` (various primitives)

**Expected:** Can import from all directories below it in the hierarchy.

**Status:** ✅ Compliant - imports are from allowed directories.

### lib/primitives/

**Imports from:**
- (none - base layer)

**Expected:** Cannot import from any other internal directories.

**Status:** ✅ Compliant - no internal imports.

### lib/selectors/

**Imports from:**
- `app/` (store) ⚠️ **VIOLATION**
- `lib/model` (Agent)

**Expected:** Can only import from `lib/model` and directories below it (not from `app/`).

**Status:** ❌ **VIOLATION** - imports `RootState` from `app/store`, which violates the special rule that
`lib/selectors` can only import from `lib/model` and below.

## Dependency Graph Visualization

```text
┌─────────────┐
│     app     │
└──────┬──────┘
       │
       ├─────────────────────────────────────────────┐
       │                                             │
┌──────▼──────┐                              ┌──────▼──────┐
│ components  │                              │lib/selectors│ ❌
└──────┬──────┘                              └──────┬──────┘
       │                                             │
       │                                             │ (violates: imports app/)
       │                                             │
┌──────▼──────┐                              ┌──────▼──────┐
│lib/slices   │                              │ lib/model   │
└──────┬──────┘                              └──────┬──────┘
       │                                             │
       │                                             │
┌──────▼──────────────┐                            │
│ lib/game_utils      │                            │
└──────┬──────────────┘                            │
       │                                            │
┌──────▼──────────────┐                            │
│ lib/ruleset         │                            │
└──────┬──────────────┘                            │
       │                                            │
┌──────▼──────────────┐                            │
│ lib/model_utils     │                            │
└──────┬──────────────┘                            │
       │                                            │
┌──────▼──────────────┐                            │
│ lib/collections     │────────────────────────────┤
└──────┬──────────────┘                            │
       │                                            │
       │                                            │
┌──────▼──────────────┐                            │
│ lib/utils           │────────────────────────────┤
└──────┬──────────────┘                            │
       │                                            │
       │                                            │
┌──────▼──────────────┐                            │
│ lib/primitives      │────────────────────────────┘
└─────────────────────┘
```

## Summary

### Compliance Status

- ✅ **Most directories are compliant** with the dependency rules
- ⚠️ **components/** imports from `app/` - This is a common React/Redux pattern for accessing hooks and
  store, and is generally acceptable
- ❌ **lib/selectors/** violates the dependency rules by importing from `app/store`

### Known Violations

1. **lib/selectors/selectors.ts** imports `RootState` from `app/store`
   - This violates the rule that `lib/selectors` can only import from `lib/model` and directories below it
   - See `dep_violations.md` for details

### Notes

- The `styling/` directory is not explicitly covered in the dependency rules but is imported by `components/`
- The dependency structure generally follows a clean layered architecture with `lib/primitives` as the foundation
- Most violations are minor and follow common React/Redux patterns (e.g., components importing hooks from `app/`)
