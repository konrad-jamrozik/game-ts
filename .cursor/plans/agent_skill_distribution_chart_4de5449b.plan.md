---
name: Agent Skill Distribution Chart
overview: "Add a new \"Agent skill\" stacked bar chart that shows the distribution of alive agents across skill percentile buckets (p10-p100), using purple MUI colors and stackOffset: 'expand' for 0-to-1 normalization."
todos:
  - id: add-dataset-type
    content: Add AgentSkillDistributionDatasetRow type and update ChartsDatasets in chartsSelectors.ts
    status: completed
  - id: add-builder-fn
    content: Add bldAgentSkillDistributionRow() builder function in chartsSelectors.ts
    status: completed
  - id: wire-dataset
    content: Wire up agentSkillDistribution dataset in selectChartsDatasets
    status: completed
  - id: add-chart-panel
    content: Add Agent skill distribution chart panel in ChartsScreen.tsx with purple colors
    status: completed
---

# Agent Skill Distribution Chart

## Summary

Add a new stacked bar chart "Agent skill" that displays the breakdown of alive agents by their base skill value across 10 percentile buckets. The chart will use `stackOffset: 'expand'` to normalize values to 0-1 range.

## Implementation Details

### 1. Add New Dataset Type

In [`web/src/redux/selectors/chartsSelectors.ts`](web/src/redux/selectors/chartsSelectors.ts):

- Add new type `AgentSkillDistributionDatasetRow` with fields:
  - `turn: number`
  - `p0to10`, `p10to20`, `p20to30`, ..., `p90to100` (10 bucket counts)

- Add `agentSkillDistribution` to `ChartsDatasets` type

### 2. Add Builder Function

In [`web/src/redux/selectors/chartsSelectors.ts`](web/src/redux/selectors/chartsSelectors.ts):

- Add `bldAgentSkillDistributionRow()` function that:
  - Filters alive agents: `agent.state !== 'KIA' && agent.state !== 'Sacked'`
  - Extracts `skill` values (using `toF()` to convert from Fixed6)
  - Calculates min/max skill to determine bucket boundaries
  - Counts agents in each 10% percentile bucket based on relative skill position
  - Returns row with bucket counts

### 3. Add Chart Panel

In [`web/src/components/Charts/ChartsScreen.tsx`](web/src/components/Charts/ChartsScreen.tsx):

- Import `purple` from `@mui/material/colors`
- Add new `ChartsPanel` with:
  - `ChartContainer` (like Cash Flow chart pattern)
  - Band x-axis for turns
  - 10 bar series with:
    - `stack: 'skill'`
    - `stackOffset: 'expand'`
    - Purple color shades: `purple[50]`, `purple[100]`, ..., `purple[900]`
  - Labels: "0-10%", "10-20%", ..., "90-100%"

### Color Scheme

Using MUI purple palette shades (lightest to darkest for low to high skill):

```typescript
import { purple } from '@mui/material/colors'

// purple[50], purple[100], purple[200], purple[300], purple[400],
// purple[500], purple[600], purple[700], purple[800], purple[900]
```

### Chart Structure

```typescript
<ChartContainer
  dataset={datasets.agentSkillDistribution}
  xAxis={[{ scaleType: 'band', dataKey: 'turn', ... }]}
  yAxis={[yAxisConfig]}
  series={[
    { type: 'bar', dataKey: 'p0to10', label: '0-10%', stack: 'skill', stackOffset: 'expand', color: purple[50] },
    { type: 'bar', dataKey: 'p10to20', label: '10-20%', stack: 'skill', color: purple[100] },
    // ... 8 more series
  ]}
  height={height}
>
  <ChartsGrid horizontal />
  <BarPlot />
  <ChartsXAxis />
  <ChartsYAxis />
  <ChartsTooltip trigger="axis" />
  <ChartsLegend ... />
</ChartContainer>
```
