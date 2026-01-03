# About Agent Skill Distribution Chart

This document explains how the agent skill distribution chart computes and displays skill bands based on distinct skill values above baseline.

## Overview

The agent skill distribution chart displays agent skills grouped into 1-4 bands (green, yellow, orange, red) based on **distinct skill values above baseline**. The algorithm ensures that bands are determined by the number of distinct skill values rather than agent counts, providing a stable and intuitive visualization of skill distribution.

## Banding Algorithm

### Core Principles

1. **Baseline filtering**: Only skills above baseline skill (typically 100) are considered
2. **Distinct value grouping**: Bands are determined by distinct skill values, not agent counts
3. **Progressive band visibility**: Number of visible bands depends on number of distinct skill values above baseline
4. **Equal distribution**: When 4+ distinct values exist, they are divided equally among bands with remainders distributed to lower bands first

### Algorithm Steps

1. **Filter skills above baseline**: Only consider agents with skills > baseline (100)
2. **Get distinct skill values**: Extract unique skill values above baseline, sorted ascending
3. **Determine number of bands**:
   - 1 distinct value → 1 band (green only)
   - 2 distinct values → 2 bands (green, yellow)
   - 3 distinct values → 3 bands (green, yellow, orange)
   - 4+ distinct values → 4 bands (green, yellow, orange, red)
4. **Distribute distinct values** (when 4+ distinct values):
   - Divide count by 4: `baseQuota = floor(distinctCount / 4)`
   - Calculate remainder: `remainder = distinctCount % 4`
   - Distribute remainder greedily to lower bands:
     - Green: `baseQuota + (remainder >= 1 ? 1 : 0)`
     - Yellow: `baseQuota + (remainder >= 2 ? 1 : 0)`
     - Orange: `baseQuota + (remainder >= 3 ? 1 : 0)`
     - Red: `baseQuota`
5. **Assign distinct values to bands**: Iterate from lowest skill above baseline, assigning each distinct value to its band according to quota
6. **Expand band ranges**: Set each band's upper range to `next_band_bottom - 1` (or use maxSkill for the highest band)

### Example from Specification

Given distinct skill values: `110, 125, 150, 175, 200, 210, 230, 250, 270, 290` (10 values):

- `10 / 4 = 2`, remainder `2`
- Green: 3 values (`110, 125, 150`) → final range: `[101, 174]`
- Yellow: 3 values (`175, 200, 210`) → final range: `[175, 229]`
- Orange: 2 values (`230, 250`) → final range: `[230, 269]`
- Red: 2 values (`270, 290`) → final range: `[270, 290]`

### Tie Handling

When multiple agents share the same distinct skill value, **all agents with that skill are grouped into the same band**. This ensures stable, intuitive banding that behaves correctly with ties.

**Example**: If there are agents with skills `110, 110, 110, 125, 125, 150`:
- All 3 agents with skill 110 go to green band
- All 2 agents with skill 125 go to green band (if green has quota for both distinct values)
- All agents with skill 150 go to their assigned band

### Band Display

- **Green band (lowest)**: Displayed as `[minSkill, maxSkill]` (closed interval), starts at `baseline + 1`
- **Yellow, Orange, Red bands**: Displayed as `(minSkill, maxSkill]` (half-open interval)
- **Empty bands**: Not displayed (zero height in the stacked chart)
- **Band colors**: Green → Yellow → Orange → Red (from lowest to highest skills)

## Interpretation

### Skill Range Boundaries

Skill range boundaries represent the **expanded ranges** used for visual display:
- Each band's range extends from its minimum distinct skill value (or `baseline + 1` for green) to `next_band_bottom - 1`
- The highest band (red) extends to its maximum distinct skill value
- These ranges ensure bands stack correctly in the chart without gaps

### Band Semantics

Each band represents:
- **Band name**: Color identifier (green, yellow, orange, red)
- **Distinct skill values**: The unique skill values assigned to this band
- **Skill range**: The expanded min/max range for visual display
- **Agent count**: The number of agents with skills matching this band's distinct values

Bands are displayed as stacked areas in the chart, where:
- The height of each band represents the expanded skill range it covers
- Empty bands have zero height and are not visible
- The chart starts at the baseline skill (initial agent skill) rather than zero

## Edge Cases

### No Skills Above Baseline

If all agents have skills at or below baseline, no bands are displayed (empty chart).

### Single Distinct Value Above Baseline

All agents above baseline are grouped into a single green band.

### Fewer Than 4 Distinct Values

When there are 1-3 distinct values, only that many bands are displayed (green, yellow, orange as needed).

### Many Distinct Values

When there are 4+ distinct values, they are divided equally among the 4 bands, with remainders distributed to lower bands first (green, yellow, orange).

## Implementation Details

The banding algorithm is implemented in `computeDistinctSkillBands()` in `web/src/lib/primitives/mathPrimitives.ts`. The chart component uses this function to compute bands and then maps them to the chart's data structure for display.

The function signature:
```typescript
export function computeDistinctSkillBands(
  skills: readonly number[],
  baselineSkill: number
): DistinctSkillBand[]
```

Where `DistinctSkillBand` contains:
- `band`: Color identifier ('green' | 'yellow' | 'orange' | 'red')
- `minSkill`: Actual minimum skill in this band
- `maxSkill`: Actual maximum skill in this band
- `skillRangeMin`: Expanded range minimum (for visual display)
- `skillRangeMax`: Expanded range maximum (for visual display)
- `count`: Number of agents in this band
