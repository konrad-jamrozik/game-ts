# About Agent Skill Distribution Chart

This document explains how the agent skill distribution chart computes and displays decile bands.

## Overview

The agent skill distribution chart displays agent skills grouped into decile bands (top 10%, next 10%, etc.) using **tie-aware, rank-based discrete grouping**. This ensures that agents with identical skill values are always kept together in the same band, and bands are computed based on agent ranks rather than interpolated percentile values.

## Banding Algorithm

### Core Principles

1. **Rank-based grouping**: Bands are determined by agent ranks, not interpolated percentile values
2. **Tie-aware**: Agents with identical skill values are always grouped together
3. **Discrete bands**: No interpolation is used; bands represent actual agent skill ranges
4. **Empty bands allowed**: If tie expansion causes bands to collapse, empty bands are omitted

### Algorithm Steps

1. **Sort agents by descending skill**: Agents are sorted from highest to lowest skill
2. **Compute target band size**: `k = max(1, ceil(n * 0.10))` where `n` is the total number of agents
3. **Assign agents to bands**:
   - Start with the top `k` agents
   - If all `k` agents have the same skill, expand the band to include all agents with that skill
   - If the `k` agents have different skills:
     - If the top agent's skill is unique (doesn't appear elsewhere) and at least 2x the boundary agent's skill, take only that agent
     - Otherwise, take all `k` agents
4. **Continue for subsequent bands**: Remove assigned agents and repeat for the next decile
5. **Skip unused labels**: If tie expansion causes a band to absorb multiple theoretical deciles, skip the unused decile labels

### Tie Handling

When a band boundary would split agents with identical skill values, **all tied agents are included in the higher band**. This ensures stable, intuitive banding that behaves correctly with ties.

**Example**: If we have 1 agent with skill 600 and 20 agents with skill 100:
- Top 10% band contains only the skill-600 agent (since 600 is unique and >= 2 * 100)
- The remaining 20 agents with skill 100 are grouped into subsequent bands
- Empty bands are omitted from the display

### Band Display

- **Top 10% band**: Displayed as `[minSkill, maxSkill]` (closed interval)
- **Subsequent bands**: Displayed as `(minSkill, maxSkill]` (half-open interval, where minSkill equals the maxSkill of the previous band)
- **Empty bands**: Not displayed (zero height in the stacked chart)

## Interpretation

### Percentile Boundaries

Percentile boundaries (p10, p20, p30, etc.) are **not computed using interpolation**. Instead, they represent the **nearest-rank cutoff values** used to determine band boundaries.

**Example**: For skills `[100, 100, 100, 100, 100, 100, 100, 600]`:
- p90 = 600 (the cutoff value for the top 10% band)
- Top 10% band contains the single agent with skill 600

Percentiles are used **only as rank thresholds**, not as synthetic numeric values.

### Band Semantics

Each band represents:
- **Label**: The decile range (e.g., "Top 10%", "10-20%")
- **Skill range**: The minimum and maximum skill values of agents in that band
- **Agent count**: The number of agents assigned to that band

Bands are displayed as stacked areas in the chart, where:
- The height of each band represents the skill range it covers
- Empty bands have zero height and are not visible
- The chart starts at the baseline skill (initial agent skill) rather than zero

## Edge Cases

### Small Sample Sizes

When there are fewer than 10 agents, `k = 1`, so each band contains at most 1 agent. This ensures that even with very few agents, the chart displays meaningful information.

### All Agents Same Skill

If all agents have the same skill value, they are all grouped into a single "Top 10%" band.

### Extreme Distributions

When there is a large gap between the top agent and the rest (e.g., 1 agent at skill 600, 20 agents at skill 100), the top agent forms its own band, and the remaining agents are grouped into subsequent bands based on their ranks.

## Implementation Details

The banding algorithm is implemented in `computeDecileBands()` in `web/src/lib/primitives/mathPrimitives.ts`. The chart component uses this function to compute bands and then maps them to the chart's data structure for display.
