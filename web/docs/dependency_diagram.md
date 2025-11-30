# Code Dependency Diagram: Utils, Ruleset, and Primitives

This document shows the dependency relationships between files in:
- `web/src/lib/utils/` (12 files)
- `web/src/lib/model/ruleset/` (10 files)
- `web/src/lib/primitives/` (2 files)

## Legend

- `→` means "depends on" (imports from)
- Files are grouped by category
- External dependencies (like `../model/model`, `../collections/`, etc.) are not shown

## Dependency Graph

### Primitives Layer (Foundation)

```text
fixed6.ts
  → assert.ts
  → formatUtils.ts
  → mathUtils.ts

f6fmtUtils.ts
  → mathUtils.ts
  → fixed6.ts
```

### Utils Layer

```text
mathUtils.ts
  → assert.ts

assert.ts
  → mathUtils.ts (circular dependency!)

formatUtils.ts
  → mathUtils.ts

actorUtils.ts
  → fixed6.ts (primitives)
  → constants.ts (ruleset)
  → assert.ts
  → mathUtils.ts
  → stringUtils.ts

stringUtils.ts
  → assert.ts

weaponUtils.ts
  → constants.ts (ruleset)
  → mathUtils.ts

enemyUtils.ts
  → weaponUtils.ts

fmtAttackLog.ts
  → formatUtils.ts

missionSiteUtils.ts
  → formatUtils.ts

rand.ts
  → assert.ts

dataGridUtils.ts
  → (no internal dependencies)

turnReportUtils.ts
  → (no internal dependencies)
```

### Ruleset Layer

```text
constants.ts
  → fixed6.ts (primitives)

skillRuleset.ts
  → fixed6.ts (primitives)

recoveryRuleset.ts
  → mathUtils.ts (utils)
  → assert.ts (utils)

panicRuleset.ts
  → fixed6.ts (primitives)
  → constants.ts

moneyRuleset.ts
  → fixed6.ts (primitives)
  → skillRuleset.ts
  → constants.ts

intelRuleset.ts
  → fixed6.ts (primitives)
  → skillRuleset.ts
  → constants.ts

leadRuleset.ts
  → mathUtils.ts (utils)
  → assert.ts (utils)
  → fixed6.ts (primitives)
  → skillRuleset.ts
  → constants.ts

missionRuleset.ts
  → actorUtils.ts (utils)
  → fixed6.ts (primitives)
  → constants.ts

initialState.ts
  → fixed6.ts (primitives)
  → constants.ts
  → weaponUtils.ts (utils)

debugInitialState.ts
  → fixed6.ts (primitives)
  → weaponUtils.ts (utils)
  → enemyUtils.ts (utils)
```

## Dependency Summary

### Circular Dependencies

- `assert.ts` ↔ `mathUtils.ts` (circular dependency)

### Most Depended-Upon Files

1. **fixed6.ts** (primitives) - Used by:
   - All ruleset files (except recoveryRuleset.ts)
   - actorUtils.ts, f6fmtUtils.ts
   - constants.ts

2. **mathUtils.ts** (utils) - Used by:
   - assert.ts, formatUtils.ts, actorUtils.ts, weaponUtils.ts
   - recoveryRuleset.ts, leadRuleset.ts
   - fixed6.ts, f6fmtUtils.ts

3. **assert.ts** (utils) - Used by:
   - mathUtils.ts, actorUtils.ts, stringUtils.ts, rand.ts
   - recoveryRuleset.ts, leadRuleset.ts
   - fixed6.ts

4. **constants.ts** (ruleset) - Used by:
   - actorUtils.ts, weaponUtils.ts
   - All ruleset files (except recoveryRuleset.ts)

5. **skillRuleset.ts** (ruleset) - Used by:
   - moneyRuleset.ts, intelRuleset.ts, leadRuleset.ts

### Dependency Layers

**Layer 0 (Foundation):**
- `fixed6.ts` (primitives) - Core type system
- `mathUtils.ts` (utils) - Basic math operations
- `assert.ts` (utils) - Assertion utilities

**Layer 1 (Basic Utils):**
- `formatUtils.ts` - Formatting utilities
- `stringUtils.ts` - String manipulation
- `f6fmtUtils.ts` - Fixed6 formatting

**Layer 2 (Domain Utils):**
- `actorUtils.ts` - Actor/agent operations
- `weaponUtils.ts` - Weapon operations
- `enemyUtils.ts` - Enemy operations
- `missionSiteUtils.ts` - Mission site operations
- `fmtAttackLog.ts` - Attack log formatting
- `rand.ts` - Random number generation

**Layer 3 (Ruleset Constants):**
- `constants.ts` - Game constants

**Layer 4 (Ruleset Logic):**
- `skillRuleset.ts` - Skill calculations
- `recoveryRuleset.ts` - Recovery calculations
- `panicRuleset.ts` - Panic calculations

**Layer 5 (Composite Rulesets):**
- `moneyRuleset.ts` - Money calculations (uses skillRuleset)
- `intelRuleset.ts` - Intel calculations (uses skillRuleset)
- `leadRuleset.ts` - Lead calculations (uses skillRuleset, mathUtils)
- `missionRuleset.ts` - Mission calculations (uses actorUtils)

**Layer 6 (State Initialization):**
- `initialState.ts` - Initial game state
- `debugInitialState.ts` - Debug game state

### Standalone Files (No Internal Dependencies)

- `dataGridUtils.ts` - Only depends on external MUI types
- `turnReportUtils.ts` - Only depends on external model types
