---
name: Address KJA2 FAIL FAST todos
overview: "Replace graceful error handling with fail-fast assertions for three cases: two missing faction lookups and one empty mission data array check."
todos:
  - id: "1"
    content: Replace 'Unknown' fallback with assertDefined in MissionDetailsCard.tsx (line 104-105)
    status: completed
  - id: "2"
    content: Replace 'Unknown' fallback with assertDefined in evaluateTurn.ts (line 186-187) and add import
    status: completed
  - id: "3"
    content: Replace early return with assertNotEmpty in evaluateTurn.ts (line 551-554) and add import
    status: completed
---

# Address all KJA2 FAIL FAST todos

Replace graceful error handling (returning 'Unknown' or early returns) with fail-fast assertions using the assert functions from `web/src/lib/primitives/assertPrimitives.ts`.

## Changes

### 1. MissionDetailsCard.tsx (line 104-105)

Replace the ternary that returns 'Unknown' with `assertDefined`:

```104:105:web/src/components/MissionDetails/MissionDetailsCard.tsx
  // KJA2 FAIL FAST Unknown here should fail assertion
  const enemyFaction = faction ? getFactionName(faction) : 'Unknown'
```

Change to:

- Use `assertDefined(faction, ...)` with an error message mentioning the mission ID and faction ID
- Then call `getFactionName(faction)` directly (no ternary needed)

Note: `assertDefined` is already imported in this file.

### 2. evaluateTurn.ts (line 186-187)

Replace the ternary that returns 'Unknown' with `assertDefined`:

```186:187:web/src/lib/game_utils/turn_advancement/evaluateTurn.ts
          // KJA2 FAIL FAST Unknown here should fail assertion
          const factionName = faction ? getFactionName(faction) : 'Unknown'
```

Change to:

- Import `assertDefined` from `'../../primitives/assertPrimitives'`
- Use `assertDefined(faction, ...)` with an error message mentioning the mission ID and faction ID
- Then call `getFactionName(faction)` directly (no ternary needed)

### 3. evaluateTurn.ts (line 551-554)

Replace the early return with `assertNotEmpty`:

```551:554:web/src/lib/game_utils/turn_advancement/evaluateTurn.ts
  if (availableMissionData.length === 0) {
    // KJA2 FAIL FAST - should assert failure instead
    // No mission data available for this operation level - should not happen, but handle gracefully
    return
  }
```

Change to:

- Import `assertNotEmpty` from `'../../primitives/assertPrimitives'`
- Replace the if/return with `assertNotEmpty(availableMissionData, ...)` with an error message mentioning the operation level and faction ID

## Error messages

Use descriptive error messages that include: