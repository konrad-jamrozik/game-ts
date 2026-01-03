# About Agent Skill Distribution Chart

This document explains how the agent skill distribution chart computes and displays skill bands based on agent percentiles.

## Overview

The agent skill distribution chart displays agent skills grouped into 1-4 bands (green, yellow, orange, red) based on **agent percentiles**. The algorithm groups agents by count (not distinct skill values), ensuring that each band represents approximately 25% of agents, with tie preservation at boundaries.

## Banding Algorithm

### Core Principles

1. **Baseline filtering**: Only skills at or above baseline skill (typically 100) are considered
2. **Agent percentile grouping**: Bands are determined by agent count, not distinct skill values
3. **Tie preservation**: When a band boundary would split agents with identical skill values, all tied agents are included in the current band
4. **Progressive band visibility**: Empty bands are not displayed

### Algorithm Steps

1. **Filter skills at or above baseline**: Only consider agents with skills >= baseline (100)
2. **Sort agents by skill**: Sort all agents by skill in ascending order
3. **Compute band size**: Calculate `N = max(1, floor(n / 4))` where `n` is the total number of agents
4. **Assign percentile bands**:
   - Process bands in order: **Green (bottom 25%)**, **Yellow (25–50%)**, **Orange (50–75%)**
   - For each of these three bands:
     - If no agents remain, the band is empty (not included in result)
     - Otherwise, take the next `N` lowest-skill agents from the remaining set
     - If this cutoff would split a tie (i.e., the next agent has the same skill value as the last taken agent), include **all** remaining agents with that same skill value in the current band
   - The **Red (top 25%)** band contains all remaining agents
5. **Rendering rule**: Do not display bands that are empty

### Examples

**Example 1**

Agent skills: `100 100 100 100 100 400 400 400 400 400` (10 agents)

- `N = floor(10 / 4) = 2`
- Green: Take 2, but all 5 have skill 100, so take all 5 (tie preservation)
- Yellow: Remaining 5 have skill 400, take all 5 (ties)
- Orange: absent (no agents remain)
- Red: absent (no agents remain)

Result:
- Green: `100 100 100 100 100` (5 agents)
- Yellow: `400 400 400 400 400` (5 agents)

**Example 2**

Agent skills: `100 100 200 200 200 300 300 400 400 400` (10 agents)

- `N = floor(10 / 4) = 2`
- Green: Take 2 (`100 100`), no tie at boundary
- Yellow: Take 2, but boundary is 200 and there's a 3rd 200, so take all 3 with 200 (tie preservation)
- Orange: Take 2 (`300 300`)
- Red: Remaining 3 (`400 400 400`)

Result:
- Green: `100 100` (2 agents)
- Yellow: `200 200 200` (3 agents)
- Orange: `300 300` (2 agents)
- Red: `400 400 400` (3 agents)

### Tie Handling

When a band boundary would split agents with identical skill values, **all tied agents are included in the current band**. This ensures stable, intuitive banding that behaves correctly with ties.

**Example**: With skills `100 100 100 200 200` and `N = 1`:
- Green would normally take 1 agent (`100`)
- But the next agent also has skill 100, so all 3 agents with skill 100 go to green band
- Yellow gets the remaining 2 agents with skill 200

### Band Display

- **Green band (bottom 25%)**: Displayed as `[minSkill, maxSkill]` (closed interval), starts at `baseline`
- **Yellow, Orange, Red bands**: Displayed as `(minSkill, maxSkill]` (half-open interval)
- **Empty bands**: Not displayed (zero height in the stacked chart)
- **Band colors**: Green → Yellow → Orange → Red (from lowest to highest skills)

## Interpretation

### Skill Range Boundaries

Skill range boundaries represent the **expanded ranges** used for visual display:
- Each band's range extends from its minimum skill value (or `baseline` for green) to `next_band_bottom - 1`
- The highest band (red) extends to its maximum skill value
- These ranges ensure bands stack correctly in the chart without gaps

### Band Semantics

Each band represents:
- **Band name**: Color identifier (green, yellow, orange, red)
- **Percentile range**: Bottom 25%, 25–50%, 50–75%, or Top 25% of agents
- **Skill range**: The expanded min/max range for visual display
- **Agent count**: The number of agents in this percentile band

Bands are displayed as stacked areas in the chart, where:
- The height of each band represents the expanded skill range it covers
- Empty bands have zero height and are not visible
- The chart starts at the baseline skill (initial agent skill) rather than zero
- Percentages refer to **percentiles of agents**, not percentages of skill values

## Edge Cases

### No Skills At Or Above Baseline

If all agents have skills below baseline, no bands are displayed (empty chart).

### Single Agent At Or Above Baseline

The single agent is grouped into a green band.

### Fewer Than 4 Agents

When there are fewer than 4 agents, bands are still processed in order, but some bands may be empty and not displayed.

### Many Agents With Same Skill

When many agents share the same skill value, tie preservation may cause a band to contain more than 25% of agents.

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
