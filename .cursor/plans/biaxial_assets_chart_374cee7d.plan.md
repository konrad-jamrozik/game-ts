---
name: Biaxial Assets Chart
overview: Upgrade the "Money" chart to a biaxial "Assets" chart showing money on the left y-axis and agent count on the right y-axis.
todos:
  - id: update-assets-chart
    content: Update Money chart to biaxial Assets chart with two y-axes
    status: completed
---

# Biaxial Assets Chart

## Current State

The "Money" chart in [ChartsScreen.tsx](web/src/components/Charts/ChartsScreen.tsx) uses a single y-axis `LineChart` showing money-related series. The dataset already contains `agentCount` (populated at line 138 in [chartsSelectors.ts](web/src/redux/selectors/chartsSelectors.ts)) but it's not displayed.

## Changes Required

### 1. Update ChartsScreen.tsx (lines 108-142)

- Change title from "Money" to "Assets"
- Add two y-axes with unique IDs:
  - `moneyAxisId` (left, for money values)
  - `agentAxisId` (right, for agent count)
- Add `yAxisId: 'moneyAxisId'` to all existing money-related series
- Add new series for agent count with `yAxisId: 'agentAxisId'`

The updated chart configuration will look like:

```tsx
<LineChart
  dataset={datasets.assets}
  xAxis={[
    {
      dataKey: 'turn',
      label: 'Turn',
      valueFormatter: formatTurn,
      ...axisConfig,
    },
  ]}
  yAxis={[
    { id: 'moneyAxisId', ...yAxisConfig },
    { id: 'agentAxisId', position: 'right', ...yAxisConfig },
  ]}
  series={withNoMarkers([
    { dataKey: 'money', label: 'Money', color: theme.palette.moneyBalance.main, yAxisId: 'moneyAxisId' },
    { dataKey: 'funding', label: 'Funding', color: theme.palette.moneyFunding.main, yAxisId: 'moneyAxisId' },
    // ... other money series with yAxisId: 'moneyAxisId' ...
    { dataKey: 'agentCount', label: 'Agents', color: theme.palette.primary.main, yAxisId: 'agentAxisId' },
  ])}
  // ... rest unchanged
/>
```

## Data Flow

The `agentCount` is already available in `datasets.assets` from line 138 in chartsSelectors.ts:

```typescript
assets.push({
  turn,
  agentCount: agents.length,  // Already populated
  // ...
})
```

No changes needed to the selector.
