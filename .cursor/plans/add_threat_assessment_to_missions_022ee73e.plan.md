---
name: Add Threat Assessment to Missions
overview: Add threat assessment calculation and display to missions data grid and mission details screen, replacing enemy average skill in details.
todos:
  - id: add-threat-function
    content: Add calculateMissionThreatAssessment function to missionRuleset.ts
    status: completed
  - id: add-column-width
    content: Add 'missions.threat' column width constant to columnWidths.ts
    status: completed
  - id: add-threat-column
    content: Add 'Threat' column to missions data grid before 'Mission ID' column
    status: completed
    dependencies:
      - add-threat-function
      - add-column-width
  - id: update-details-screen
    content: Replace 'Enemy avg. skill' with 'Threat assessment' in mission details screen
    status: completed
    dependencies:
      - add-threat-function
---

# Add Threat Assessment to Missions

## Overview

Add threat assessment calculation and display to the missions data grid and mission details screen. The threat assessment shows the total danger level of a mission based on enemy skill, hit points, and weapon damage.

## Implementation Plan

### 1. Create threat assessment calculation function

Add `calculateMissionThreatAssessment` function to [`web/src/lib/ruleset/missionRuleset.ts`](web/src/lib/ruleset/missionRuleset.ts):

- Takes a `Mission` as input
- For each enemy in the mission:
- Calculate: `enemy.skill * (1 + (enemy.hitPoints / 100) + (enemy.weapon.damage * 2 / 100))`
- Use Fixed6 arithmetic for calculations
- Sum all enemy threat assessments
- Round to nearest integer using `Math.round()`
- Return the integer result

### 2. Add column width constant

Add `'missions.threat': 80` to [`web/src/components/Common/columnWidths.ts`](web/src/components/Common/columnWidths.ts) in the missions section.

### 3. Add Threat column to missions data grid

Update [`web/src/components/MissionsDataGrid/getMissionsColumns.tsx`](web/src/components/MissionsDataGrid/getMissionsColumns.tsx):

- Import `calculateMissionThreatAssessment` from missionRuleset
- Add a new column definition before the "Mission ID" column:
- `field: 'threat'`
- `headerName: 'Threat'`
- Use `columnWidths['missions.threat']` for width
- Use `valueGetter` to calculate threat assessment from `params.row`
- Render as integer in `renderCell`

### 4. Update mission details screen

Update [`web/src/components/MissionDetails/MissionDetailsCard.tsx`](web/src/components/MissionDetails/MissionDetailsCard.tsx):

- Import `calculateMissionThreatAssessment` from missionRuleset
- Remove the `enemyAverageSkill` calculation (lines 110-116)
- Calculate `missionThreatAssessment` using the new function
- In `detailsRows` array, replace the "Enemy avg. skill" entry (line 137) with:
- `{ id: 8, key: 'Threat', value: String(missionThreatAssessment) }`

## Formula Reference

From `docs/design/about_mission_threat_assessment.md`:

- Enemy threat = `enemy skill * (1 + (enemy hit points / 100) + (enemy weapon base damage * 2 / 100))`
- Mission threat = sum of all enemy threats, rounded to nearest integer

## Notes

- Use Fixed6 arithmetic for intermediate calculations (enemy.skill, enemy.hitPoints are Fixed6)