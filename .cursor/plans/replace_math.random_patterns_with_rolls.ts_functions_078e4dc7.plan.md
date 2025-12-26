---
name: Replace Math.random patterns with rolls.ts functions
overview: Replace all instances of `Math.floor(Math.random() * ...)` patterns with appropriate functions from `rolls.ts` for integer range rolls.
todos:
  - id: replace-faction-operation-level
    content: Replace Math.random pattern in factionOperationLevelRuleset.ts with rollIntIncToInc and add import
    status: completed
  - id: replace-faction-activity-level
    content: Replace Math.random pattern in factionActivityLevelRuleset.ts with rollIntIncToInc and add import
    status: completed
  - id: replace-evaluate-turn
    content: Replace Math.random pattern in evaluateTurn.ts with rollIntIncToExc and add import
    status: completed
---

# Replace Math.random patterns with rolls.ts funct

ionsReplace all instances of `Math.floor(Math.random() * ...)` patterns with appropriate functions from `rolls.ts`.

## Files to modify

### 1. [web/src/lib/ruleset/factionOperationLevelRuleset.ts](web/src/lib/ruleset/factionOperationLevelRuleset.ts)

- **Line 17-18**: Replace `Math.floor(Math.random() * (config.operationFrequencyMax - config.operationFrequencyMin + 1)) + config.operationFrequencyMin` with `rollIntIncToInc(config.operationFrequencyMin, config.operationFrequencyMax).roll`
- **Remove** the KJA1 comment on line 16 since we're fixing it
- **Add import**: `import { rollIntIncToInc } from '../primitives/rolls'`

### 2. [web/src/lib/ruleset/factionActivityLevelRuleset.ts](web/src/lib/ruleset/factionActivityLevelRuleset.ts)

- **Line 24**: Replace `Math.floor(Math.random() * (config.turnsMax - config.turnsMin + 1)) + config.turnsMin` with `rollIntIncToInc(config.turnsMin, config.turnsMax).roll`
- **Add import**: `import { rollIntIncToInc } from '../primitives/rolls'`

### 3. [web/src/lib/game_utils/turn_advancement/evaluateTurn.ts](web/src/lib/game_utils/turn_advancement/evaluateTurn.ts)

- **Line 567**: Replace `candidateMissionData[Math.floor(Math.random() * candidateMissionData.length)]` with `candidateMissionData[rollIntIncToExc(0, candidateMissionData.length).roll]`
- Note: This uses `rollIntIncToExc` because array indices are [0, length) (exclusive end)
- **Add import**: `import { rollIntIncToExc } from '../../primitives/rolls'`
- **Remove** the KJA3 comment on line 566 if appropriate (or leave it if it refers to something else)

## Implementation details

- Use `rollIntIncToInc(min, max)` for integer ranges where both min and max are inclusive