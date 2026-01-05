---
name: Fix Percentile Calculation
overview: Fix the mission CR percentile calculation by adding `turnDiscovered` to Mission type and using it to correctly count missions.
todos:
  - id: add-turn-discovered
    content: Add turnDiscovered field to Mission type in missionModel.ts
    status: completed
  - id: update-mission-factory
    content: Add turnDiscovered to initialMission and bldMission params
    status: completed
  - id: update-call-sites
    content: Pass current turn as turnDiscovered at all bldMission call sites
    status: completed
  - id: fix-chart-calc
    content: Fix CombatRatingChart to use mission.turnDiscovered for percentile calculation
    status: completed
---

# Fix Mission CR Percentile Calculation Bug

## Problem

The current implementation populates `missionCRsByTurn` by iterating through `gameState.missions` for each turn. However, `gameState.missions` contains **all currently visible missions**, not just missions discovered at that turn. This causes missions to be counted multiple times across the 20-turn window.

## Step 1: Add `turnDiscovered` to Mission type

In [web/src/lib/model/missionModel.ts](web/src/lib/model/missionModel.ts), add:

```typescript
/**
 * The turn at which this mission was discovered/created.
 * Used for historical analysis like computing mission CR percentiles over time.
 */
turnDiscovered: number
```

## Step 2: Update mission factory

In [web/src/lib/factories/missionFactory.ts](web/src/lib/factories/missionFactory.ts):

1. Add `turnDiscovered: 0` to `initialMission`
2. Add `turnDiscovered` to `BaseCreateMissionParams` (required field)

## Step 3: Update all `bldMission` call sites

Pass `turnDiscovered: <current turn>` at each call site:

- [web/src/ai/intellects/basic/leadInvestigation.ts](web/src/ai/intellects/basic/leadInvestigation.ts) (2 calls)
- [web/src/lib/factories/debugGameStateFactory.ts](web/src/lib/factories/debugGameStateFactory.ts) (2 calls)
- [web/src/lib/game_utils/turn_advancement/evaluateTurn.ts](web/src/lib/game_utils/turn_advancement/evaluateTurn.ts) (1 call)
- [web/src/redux/reducers/debugReducers.ts](web/src/redux/reducers/debugReducers.ts) (1 call)
- [web/src/lib/game_utils/turn_advancement/updateLeadInvestigations.ts](web/src/lib/game_utils/turn_advancement/updateLeadInvestigations.ts) (1 call)

## Step 4: Fix chart calculation

In [web/src/components/Charts/CombatRatingChart.tsx](web/src/components/Charts/CombatRatingChart.tsx):

Use `mission.turnDiscovered` to group missions by discovery turn:

```typescript
// New approach: collect missions once, indexed by turnDiscovered
const missionsByDiscoveryTurn = new Map<number, number[]>()

// Use latest gameState to get all historical missions
const latestGameState = gameStates[gameStates.length - 1]
for (const mission of latestGameState.missions) {
  const crs = missionsByDiscoveryTurn.get(mission.turnDiscovered) ?? []
  crs.push(mission.combatRating)
  missionsByDiscoveryTurn.set(mission.turnDiscovered, crs)
}
```

This ensures each mission is counted exactly once, based on when it was discovered.
