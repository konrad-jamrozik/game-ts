---
name: Address additional fail-fast locations
overview: "Replace graceful error handling with fail-fast assertions in three additional locations: mission lookup in events middleware, faction lookup in evaluateDeployedMissions, and undefined mission data selection."
todos:
  - id: "1"
    content: Replace 'Unknown Mission' fallback with assertDefined in eventsMiddleware.ts (line 98)
    status: pending
  - id: "2"
    content: Replace 'Unknown' fallback with assertDefined in evaluateTurn.ts evaluateDeployedMissions (line 259-264)
    status: pending
  - id: "3"
    content: Replace early return with assertDefined in evaluateTurn.ts spawnDefensiveMission (line 570-573)
    status: pending
---

# Address additional fail-fast locations

Replace graceful error handling (returning 'Unknown' or early returns) with fail-fast assertions in three additional locations found during code review.

## Changes

### 1. eventsMiddleware.ts (line 98)

Replace the ternary that returns 'Unknown Mission' with `assertDefined`:

```97:98:web/src/redux/eventsMiddleware.ts
      const mission = gameState.missions.find((m) => m.id === missionId)
      const missionName = mission ? getMissionDataById(mission.missionDataId).name : 'Unknown Mission'
```

Change to:

- Use `assertDefined(mission, ...)` with an error message mentioning the mission ID
- Then call `getMissionDataById(mission.missionDataId).name` directly (no ternary needed)

Note: `assertDefined` is already imported in this file (line 20).

### 2. evaluateTurn.ts (line 259-264)

Replace the 'Unknown' fallback with `assertDefined`:

```258:264:web/src/lib/game_utils/turn_advancement/evaluateTurn.ts
      // Get faction name from mission data
      let factionName = 'Unknown'
      const { factionId } = missionData
      const faction = state.factions.find((factionItem) => factionItem.id === factionId)
      if (faction !== undefined) {
        factionName = getFactionName(faction)
      }
```

Change to:

- Use `assertDefined(faction, ...)` with an error message mentioning the mission ID and faction ID
- Then call `getFactionName(faction)` directly (no if check needed)
- Remove the `let factionName = 'Unknown'` initialization

Note: `assertDefined` is already imported in this file.

### 3. evaluateTurn.ts (line 570-573)

Replace the early return with `assertDefined` (already marked with KJA3 comment):

```568:574:web/src/lib/game_utils/turn_advancement/evaluateTurn.ts
  // KJA3 put this random into an until function
  const selectedMissionData = candidateMissionData[Math.floor(Math.random() * candidateMissionData.length)]
  if (selectedMissionData === undefined) {
    // KJA3 should assert fail. Also search for other palaces like that and update Agents.md
    // Should not happen, but handle gracefully
    return
  }
```

Change to:

- Use `assertDefined(selectedMissionData, ...)` with an error message mentioning the operation level, faction ID, and candidate mission data length
- Remove the if/return block