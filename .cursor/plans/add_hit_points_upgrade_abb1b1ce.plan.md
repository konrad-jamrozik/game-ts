---
name: Add Hit Points Upgrade
overview: Add a new upgrade type "Hit points" that increases the max hit points for newly hired agents by 1 for 500 cost, displays in UI above "Weapon damage", and is included in the Basic Intellect's round-robin purchasing logic.
todos:
  - id: data-layer
    content: Add 'Hit points' to UpgradeName, UPGRADE_PRICES (500), UPGRADE_INCREMENTS (1)
    status: completed
  - id: game-state-model
    content: Add agentMaxHitPoints property to GameState type
    status: completed
    dependencies:
      - data-layer
  - id: game-state-factory
    content: Initialize agentMaxHitPoints to 30 in initialGameState
    status: completed
    dependencies:
      - game-state-model
  - id: upgrade-reducer
    content: Handle 'Hit points' case in buyUpgrade reducer
    status: completed
    dependencies:
      - data-layer
      - game-state-model
  - id: hire-agent-reducer
    content: Use state.agentMaxHitPoints when creating new agents
    status: completed
    dependencies:
      - game-state-model
  - id: ai-state-slice
    content: Add desiredHitPointsUpgrades, actualHitPointsUpgrades and increment actions
    status: completed
    dependencies:
      - data-layer
  - id: play-turn-api-types
    content: Add incrementActualHitPointsUpgrades method to PlayTurnAPI type
    status: completed
    dependencies:
      - ai-state-slice
  - id: play-turn-api
    content: Implement incrementActualHitPointsUpgrades in getPlayTurnApi
    status: completed
    dependencies:
      - play-turn-api-types
  - id: purchasing-logic
    content: Add 'Hit points' to Basic Intellect round-robin purchasing logic
    status: completed
    dependencies:
      - ai-state-slice
      - play-turn-api
  - id: ui-upgrades-grid
    content: Add 'Hit points' row above 'Weapon damage' in UpgradesDataGrid
    status: completed
    dependencies:
      - game-state-model
---

# Add Hit Points Upgrade

This feature adds a new upgrade type that increases agent hit points. Similar to "Weapon damage" upgrade, this affects all existing agents when purchased, and all newly hired agents will have the upgraded value.

## Key Files to Modify

### Data Layer

- [`web/src/lib/data_tables/upgrades.ts`](web/src/lib/data_tables/upgrades.ts): Add "Hit points" to `UpgradeName`, `UPGRADE_PRICES` (500), and `UPGRADE_INCREMENTS` (1)
- [`web/src/lib/model/gameStateModel.ts`](web/src/lib/model/gameStateModel.ts): Add `agentMaxHitPoints: number` property

### Factories

- [`web/src/lib/factories/gameStateFactory.ts`](web/src/lib/factories/gameStateFactory.ts): Initialize `agentMaxHitPoints` to 30 (from `initialAgent.maxHitPoints`)

### Redux Reducers

- [`web/src/redux/reducers/upgradeReducers.ts`](web/src/redux/reducers/upgradeReducers.ts): Handle "Hit points" case - increment `agentMaxHitPoints` and update all agents' `maxHitPoints` (and `hitPoints` if at full health)
- [`web/src/redux/reducers/agentReducers.ts`](web/src/redux/reducers/agentReducers.ts): Set new agents' `maxHitPoints` to `state.agentMaxHitPoints` in `hireAgent`

### AI State (Basic Intellect)

- [`web/src/redux/slices/aiStateSlice.ts`](web/src/redux/slices/aiStateSlice.ts): Add `desiredHitPointsUpgrades`, `actualHitPointsUpgrades`, and increment actions
- [`web/src/ai/intellects/basic/purchasing.ts`](web/src/ai/intellects/basic/purchasing.ts): Add "Hit points" to round-robin logic (5 upgrades in rotation instead of 4)
- [`web/src/ai/intellects/basic/constants.ts`](web/src/ai/intellects/basic/constants.ts): Add `MAX_HIT_POINTS` constant (optional, for capping like `MAX_WEAPON_DAMAGE`)

### API Types

- [`web/src/lib/model_utils/playTurnApiTypes.ts`](web/src/lib/model_utils/playTurnApiTypes.ts): Add `incrementActualHitPointsUpgrades()` method
- [`web/src/redux/playTurnApi.ts`](web/src/redux/playTurnApi.ts): Implement the new increment method

### UI

- [`web/src/components/Assets/UpgradesDataGrid.tsx`](web/src/components/Assets/UpgradesDataGrid.tsx): Add "Hit points" row with id 11 (or adjust existing ids) positioned above "Weapon damage"

## Implementation Notes

- The upgrade follows the same pattern as "Weapon damage" - when purchased, it updates `state.agentMaxHitPoints` and all existing agents
- When upgrading an agent's `maxHitPoints`, also increase `hitPoints` by the same amount if the agent is at full health (similar to weapon upgrade pattern)
- Newly hired agents get their `maxHitPoints` from `state.agentMaxHitPoints` via `bldAgent`
- The initial value of `agentMaxHitPoints` is 30 (matching `initialAgent.maxHitPoints`)
