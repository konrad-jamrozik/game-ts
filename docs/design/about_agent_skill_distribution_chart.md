# About Agent Skill Distribution Chart

This document explains how the agent skill distribution chart computes and displays skill bands based on agent percentiles.

## Overview

The agent skill distribution chart displays agent skills grouped into 1-4 bands (green, yellow, orange, red) based on **agent percentiles**. The algorithm uses fixed percentile cutpoint thresholds derived from rank positions to assign agents to bands. This approach prevents changes at the bottom from cascading upward and affecting the top band.

## Banding Algorithm

### Core Principles

1. **Baseline filtering**: Only skills at or above baseline skill (typically 100) are considered (handled by the chart component)
2. **Agent percentile grouping**: Bands are determined by agent count, not distinct skill values
3. **Percentile-threshold assignment**: Agents are assigned to bands based on fixed percentile cutpoints
4. **Progressive band visibility**: Empty bands are not displayed

### Algorithm Steps

Given an array of agent skills `s`:

1. **Sort ascending**: `sSorted = sort(s)`
2. **Handle empty**: If `n === 0`, return no bands
3. **Compute nearest-rank indices** (0-based):
   - `i25 = ceil(0.25 * n) - 1`
   - `i50 = ceil(0.50 * n) - 1`
   - `i75 = ceil(0.75 * n) - 1`
4. **Compute threshold values**:
   - `p25 = sSorted[i25]`
   - `p50 = sSorted[i50]`
   - `p75 = sSorted[i75]`
5. **Assign each agent to exactly one band** using these rules (value-based, tie-safe):
   - **Green**: `skill <= p25`
   - **Yellow**: `p25 < skill <= p50`
   - **Orange**: `p50 < skill < p75`
   - **Red**: `skill >= p75`
6. **For each band**, compute:
   - `count` (number of agents in band)
   - `minSkill` / `maxSkill` from the skills in that band
7. **Rendering rule**: Do not render bands with `count === 0`

### Examples

**Example 1: Two-cluster case**

Agent skills: `1 1 1 1 1 4 4 4 4 4` (10 agents)

- `n = 10`
- `i25 = ceil(2.5) - 1 = 2`, `i50 = ceil(5) - 1 = 4`, `i75 = ceil(7.5) - 1 = 7`
- Sorted: `[1, 1, 1, 1, 1, 4, 4, 4, 4, 4]`
- `p25 = 1`, `p50 = 1`, `p75 = 4`
- Green: `skill <= 1` → all 1s (5 agents)
- Yellow: `1 < skill <= 1` → impossible (0 agents)
- Orange: `1 < skill < 4` → no values (0 agents)
- Red: `skill >= 4` → all 4s (5 agents)

Result:

- Green: `1 1 1 1 1` (5 agents)
- Red: `4 4 4 4 4` (5 agents)

**Example 2: Four distinct values**

Agent skills: `100 100 200 200 200 300 300 400 400 400` (10 agents)

- `n = 10`
- `i25 = 2`, `i50 = 4`, `i75 = 7`
- Sorted: `[100, 100, 200, 200, 200, 300, 300, 400, 400, 400]`
- `p25 = 200`, `p50 = 200`, `p75 = 400`
- Green: `skill <= 200` → 100, 100, 200, 200, 200 (5 agents)
- Yellow: `200 < skill <= 200` → impossible (0 agents)
- Orange: `200 < skill < 400` → 300, 300 (2 agents)
- Red: `skill >= 400` → 400, 400, 400 (3 agents)

Result:

- Green: `100 100 200 200 200` (5 agents)
- Orange: `300 300` (2 agents)
- Red: `400 400 400` (3 agents)

### Key Properties

**Stability**: Raising low-end skills does not reduce the Red band unless the 75th-percentile cutpoint value changes. This prevents bottom changes from cascading upward.

**Tie-safe**: The algorithm handles ties correctly by using value-based comparisons against fixed percentile thresholds, rather than greedy consumption with tie expansion.

### Band Display

- **Green band (bottom 25%)**: Displayed as `[minSkill, maxSkill]` (closed interval)
- **Yellow, Orange, Red bands**: Displayed as `(minSkill, maxSkill]` (half-open interval)
- **Empty bands**: Not displayed (zero height in the stacked chart)
- **Band colors**: Green → Yellow → Orange → Red (from lowest to highest skills)

## Interpretation

### Band Semantics

Each band represents:

- **Band name**: Color identifier (green, yellow, orange, red)
- **Percentile range**: Bottom 25%, 25–50%, 50–75%, or Top 25% of agents
- **Skill range**: The min/max skill values in the band
- **Agent count**: The number of agents in this percentile band

Bands are displayed as stacked areas in the chart, where:

- The height of each band represents the skill range it covers
- Empty bands have zero height and are not visible
- The chart starts at the baseline skill (initial agent skill) rather than zero
- Percentages refer to **percentiles of agents**, not percentages of skill values

## Edge Cases

### No Skills At Or Above Baseline

If all agents have skills below baseline, no bands are displayed (empty chart).

### Single Agent At Or Above Baseline

The single agent is grouped into a green band.

### Fewer Than 4 Agents

When there are fewer than 4 agents, some bands may be empty:

- `n = 1`: All percentiles point to index 0, everything goes to Green
- `n = 2`: `i25 = 0`, `i50 = 0`, `i75 = 1` → Green and Red only
- `n = 3`: `i25 = 0`, `i50 = 1`, `i75 = 2` → Green, Yellow, and Red

### Many Agents With Same Skill

When many agents share the same skill value, the percentile thresholds may coincide, causing some bands to be empty. For example, if all agents have the same skill, all thresholds are equal, and everything goes to the Green band.

## Implementation Details

The banding algorithm is implemented in `computeSkillBands()` in `web/src/lib/primitives/mathPrimitives.ts`. The chart component filters skills at or above baseline before calling this function, then maps the result to the chart's data structure for display.

The function signature:

```typescript
export function computeSkillBands(skills: readonly number[]): SkillBand[]
```

Where `SkillBand` contains:

- `band`: Color identifier ('green' | 'yellow' | 'orange' | 'red')
- `minSkill`: Actual minimum skill in this band
- `maxSkill`: Actual maximum skill in this band
- `count`: Number of agents in this band
