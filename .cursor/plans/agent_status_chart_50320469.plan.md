---
name: Agent Status Chart
overview: Create a stacked area chart showing alive agents categorized by their state/assignment combination over turns, following the existing AgentSkillDistributionChart pattern.
todos:
  - id: create-chart-component
    content: Create AgentStatusDistributionChart.tsx with dataset type, build function, and chart component
    status: completed
  - id: add-to-charts-screen
    content: Import and add the new chart to ChartsScreen.tsx
    status: completed
---

# Agent Status Distribution Chart

## Overview

Create a new stacked area line chart in [`web/src/components/Charts/AgentStatusDistributionChart.tsx`](web/src/components/Charts/AgentStatusDistributionChart.tsx) that displays alive agents grouped by 7 status categories, with "In transit" taking precedence.

## Status Categories (stacking order, bottom to top)

1. **In transit** - agents with `state === 'InTransit'` or `state === 'StartingTransit'` (takes precedence)
2. **Available** - agents with `state === 'Available'` (assignment is 'Standby')
3. **Recovering** - agents with `state === 'Recovering'` (assignment is 'Recovery')
4. **In training** - agents with `state === 'InTraining'` and `assignment === 'Training'`
5. **Contracting** - agents with `state === 'OnAssignment'` and `assignment === 'Contracting'`
6. **Investigating** - agents with `state === 'OnAssignment'` and assignment starts with `'investigation-'`
7. **On mission** - agents with `state === 'OnMission'` and assignment starts with `'mission-'`

## Implementation Details

### New File: `AgentStatusDistributionChart.tsx`

Follow the pattern of [`AgentSkillDistributionChart.tsx`](web/src/components/Charts/AgentSkillDistributionChart.tsx):

- **Dataset row type**: `AgentStatusDistributionDatasetRow` with fields:
  - `turn: number`
  - `inTransit: number`
  - `available: number`
  - `recovering: number`
  - `inTraining: number`
  - `contracting: number`
  - `investigating: number`
  - `onMission: number`
  - `totalAgents: number` (for tooltip)

- **Build function**: `bldAgentStatusDistributionRow(gameState: GameState)` that categorizes agents using type guards from [`agentUtils.ts`](web/src/lib/model_utils/agentUtils.ts):
  - Use `isMissionAssignment()` and `isLeadInvestigationAssignment()` for detecting assignment types

- **Chart component**: Use MUI X Charts `LineChart` with `area: true` and `stack: 'status'`

### Colors

Use existing palette colors from [`palette.tsx`](web/src/components/styling/palette.tsx):

- In transit: `theme.palette.agentStateInTransit.main` (blue)
- Available: `theme.palette.agentStateAvailable.main` (green)
- Recovering: `theme.palette.agentStateRecovering.main` (deep orange)
- In training: `theme.palette.agentStateInTraining.main` (cyan)
- Contracting: `theme.palette.agentStateOnAssignment.main` (amber)
- Investigating: `theme.palette.agentStateOnAssignment.light` (lighter amber variant)
- On mission: `theme.palette.agentStateOnMission.main` (deep purple)

### Update `ChartsScreen.tsx`

Add import and render the new chart:

```typescript
import { AgentStatusDistributionChart } from './AgentStatusDistributionChart'
// ...
<ChartsPanel
  title="Agent status distribution"
  renderChart={(height) => <AgentStatusDistributionChart gameStates={gameStates} height={height} />}
/>
```

## Key Code References

Reuse from existing codebase:

- Chart utilities: `axisConfig`, `formatTurn`, `legendSlotProps`, `withNoMarkers`, `Y_AXIS_WIDTH` from [`chartsUtils.ts`](web/src/components/Charts/chartsUtils.ts)
- Type guards: `isMissionAssignment()`, `isLeadInvestigationAssignment()` from [`agentUtils.ts`](web/src/lib/model_utils/agentUtils.ts)
