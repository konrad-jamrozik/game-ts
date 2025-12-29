---
name: Refactor increaseDesiredCounts
overview: ""
todos:
  - id: slice-reducers
    content: Add 8 simple incrementDesired* reducers and DesiredCountName type to aiStateSlice
    status: pending
  - id: slice-cleanup
    content: Remove increaseDesiredCounts reducer and helper functions from aiStateSlice
    status: pending
    dependencies:
      - slice-reducers
  - id: api-types
    content: "Update PlayTurnAPI type to use increaseDesiredCount(name: DesiredCountName)"
    status: pending
  - id: api-impl
    content: Implement routing logic in playTurnApi.ts
    status: pending
    dependencies:
      - slice-reducers
      - api-types
  - id: intellect
    content: Move decision logic to purchasing.ts decideSomeDesiredCount function
    status: pending
    dependencies:
      - api-impl
---

# Refactor Decision-Making Logic for Desired Counts

## Overview

Move nontrivial decision-making from `aiStateSlice.ts` reducers to the basic intellect (`purchasing.ts`), with PlayTurnAPI serving as a routing layer to simple increment reducers.

## Architecture

```mermaid
flowchart LR
    subgraph intellect [Basic Intellect]
        DC[decideSomeDesiredCount]
    end
    subgraph api [PlayTurnAPI]
        IDC[increaseDesiredCount string]
    end
    subgraph slice [aiStateSlice Reducers]
        R1[incrementDesiredAgentCount]
        R2[incrementDesiredAgentCapUpgrades]
        R3[incrementDesiredTransportCapUpgrades]
        R4[incrementDesiredTrainingCapUpgrades]
        R5[incrementDesiredWeaponDamageUpgrades]
        R6[other increment reducers...]
    end
    DC -->|calls with name| IDC
    IDC -->|routes to| R1
    IDC -->|routes to| R2
    IDC -->|routes to| R3
    IDC -->|routes to| R4
    IDC -->|routes to| R5
    IDC -->|routes to| R6
```



## Changes

### 1. [`web/src/redux/slices/aiStateSlice.ts`](web/src/redux/slices/aiStateSlice.ts)

- **Remove**: `increaseDesiredCounts` reducer and `increaseSomeDesiredCount`, `increaseDesiredAgentCount` helper functions
- **Add** 8 simple increment reducers (no validation, just +1):
- `incrementDesiredAgentCount`
- `incrementDesiredAgentCapUpgrades`
- `incrementDesiredTransportCapUpgrades`
- `incrementDesiredTrainingCapUpgrades`
- `incrementDesiredWeaponDamageUpgrades`
- `incrementDesiredTrainingSkillGainUpgrades`
- `incrementDesiredExhaustionRecoveryUpgrades`
- `incrementDesiredHitPointsRecoveryUpgrades`
- **Modify** `createInitialState()`: directly set `desiredAgentCount` to `initialGameState.agents.length + 1` instead of calling `increaseSomeDesiredCount`
- **Export** new type `DesiredCountName` for the string union

### 2. [`web/src/lib/model_utils/playTurnApiTypes.ts`](web/src/lib/model_utils/playTurnApiTypes.ts)

- **Replace** `increaseDesiredCounts(): void` with `increaseDesiredCount(name: DesiredCountName): void`

### 3. [`web/src/redux/playTurnApi.ts`](web/src/redux/playTurnApi.ts)

- **Replace** `increaseDesiredCounts()` method with `increaseDesiredCount(name: DesiredCountName)` that routes to the appropriate reducer via switch statement

### 4. [`web/src/ai/intellects/basic/purchasing.ts`](web/src/ai/intellects/basic/purchasing.ts)

- **Add** new function `decideSomeDesiredCount(api: PlayTurnAPI): void` containing all the decision logic currently in `increaseSomeDesiredCount`