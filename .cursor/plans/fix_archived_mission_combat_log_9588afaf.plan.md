---
name: Fix Archived Mission Combat Log
overview: Create a helper hook to find mission reports from past turns, fixing the empty combat log issue for archived mission sites.
todos:
  - id: create-hook
    content: Create useMissionReport hook in web/src/redux/selectors/
    status: in_progress
  - id: update-combat-log
    content: Update CombatLogCard to use new hook
    status: pending
  - id: update-battle-log
    content: Update BattleLogCard to use new hook
    status: pending
---

# Fix Empty Combat Log for Archived Missions

## Problem

Both `CombatLogCard` and `BattleLogCard` always read from `state.undoable.present.gameState.turnStartReport`. For archived missions completed in previous turns, the mission report (containing `attackLogs` and `roundLogs`) exists in a past turn's report, not the current one.

## Solution

Create a custom hook `useMissionReport` that searches through current and past turn reports to find the mission report for a given mission site ID.

## Implementation

### 1. Create new hook file: [web/src/redux/selectors/useMissionReport.ts](web/src/redux/selectors/useMissionReport.ts)

```typescript
export function useMissionReport(missionSiteId: MissionSiteId): MissionReport | undefined {
  return useAppSelector((state) => {
    // Search current turn report first
    const currentReport = state.undoable.present.gameState.turnStartReport
    const found = currentReport?.missions.find((m) => m.missionSiteId === missionSiteId)
    if (found) return found

    // Search past turn reports
    for (const pastState of state.undoable.past) {
      const pastReport = pastState.gameState.turnStartReport
      const pastFound = pastReport?.missions.find((m) => m.missionSiteId === missionSiteId)
      if (pastFound) return pastFound
    }
    return undefined
  })
}
```

### 2. Update [web/src/components/MissionDetails/CombatLogCard.tsx](web/src/components/MissionDetails/CombatLogCard.tsx)

Replace direct selector with the new hook:

```diff
- const turnStartReport = useAppSelector((state) => state.undoable.present.gameState.turnStartReport)
- const missionReport = turnStartReport?.missions.find((m) => m.missionSiteId === missionSiteId)
+ const missionReport = useMissionReport(missionSiteId)
```

### 3. Update [web/src/components/MissionDetails/BattleLogCard.tsx](web/src/components/MissionDetails/BattleLogCard.tsx)

Apply the same change:

```diff
- const turnStartReport = useAppSelector((state) => state.undoable.present.gameState.turnStartReport)
- const missionReport = turnStartReport?.missions.find((m) => m.missionSiteId === missionSiteId)
+ const missionReport = useMissionReport(missionSiteId)
```

## Notes

- This approach searches through all past states (up to 100 per `UNDO_LIMIT`) but is acceptable since it only runs when viewing mission details
- The search short-circuits as soon as the mission report is found
- No model changes required