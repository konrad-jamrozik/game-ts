---
name: Balance Sheet Chart
overview: Add a "Balance sheet" stacked bar chart to the Charts screen, tracking detailed income/expenditure categories with positive values (green shades) above zero and negative values below. Add expenditure tracking to GameState and make the charts screen vertically scrollable.
todos:
  - id: gamestate-model
    content: Add turnExpenditures field to GameState type in gameStateModel.ts
    status: completed
  - id: factory-init
    content: Initialize turnExpenditures in gameStateFactory.ts
    status: completed
  - id: agent-reducers
    content: Track agentHiring expenditure in agentReducers.ts hireAgent
    status: completed
  - id: upgrade-reducers
    content: Track upgrades and capIncreases expenditure in upgradeReducers.ts buyUpgrade
    status: completed
  - id: evaluate-turn
    content: Reset turnExpenditures at turn start in evaluateTurn.ts
    status: completed
  - id: theme-colors
    content: Add green shade palette colors for income series in theme.tsx
    status: completed
  - id: charts-selectors
    content: Add BalanceSheetDatasetRow type and build balanceSheet dataset in chartsSelectors.ts
    status: completed
  - id: charts-screen
    content: Add Balance sheet BarChart below Money chart and make screen scrollable
    status: completed
  - id: verify
    content: Run qcheck to verify changes
    status: completed
---

# Balance Sheet Stacked Bar Chart

## Overview

Add a new "Balance sheet" stacked bar chart below the "Money" chart that visualizes income and expenses per turn, with positive values stacked above zero (green shades) and negative values stacked below zero.

## Key Files to Modify

- [web/src/lib/model/gameStateModel.ts](web/src/lib/model/gameStateModel.ts) - Add `turnExpenditures` field
- [web/src/lib/factories/gameStateFactory.ts](web/src/lib/factories/gameStateFactory.ts) - Initialize expenditures
- [web/src/redux/reducers/agentReducers.ts](web/src/redux/reducers/agentReducers.ts) - Track hiring expenditures
- [web/src/redux/reducers/upgradeReducers.ts](web/src/redux/reducers/upgradeReducers.ts) - Track upgrade expenditures
- [web/src/lib/game_utils/turn_advancement/evaluateTurn.ts](web/src/lib/game_utils/turn_advancement/evaluateTurn.ts) - Reset expenditures at turn start
- [web/src/redux/selectors/chartsSelectors.ts](web/src/redux/selectors/chartsSelectors.ts) - Add balance sheet dataset
- [web/src/components/Charts/ChartsScreen.tsx](web/src/components/Charts/ChartsScreen.tsx) - Add BarChart, make scrollable
- [web/src/components/styling/theme.tsx](web/src/components/styling/theme.tsx) - Add green shade palette colors

## Implementation Details

### 1. Add Expenditure Tracking to GameState

Add to `GameState`:

```typescript
turnExpenditures: {
  agentHiring: number
  upgrades: number
  capIncreases: number
}
```

This resets to zero at each turn advancement and accumulates during player actions.

### 2. Update Reducers to Track Expenditures

In `agentReducers.ts` (`hireAgent`):

```typescript
state.turnExpenditures.agentHiring += AGENT_HIRE_COST
```

In `upgradeReducers.ts` (`buyUpgrade`):

```typescript
const price = getUpgradePrice(upgradeName)
if (upgradeName === 'Agent cap' || upgradeName === 'Transport cap' || upgradeName === 'Training cap') {
  state.turnExpenditures.capIncreases += price
} else {
  state.turnExpenditures.upgrades += price
}
```

### 3. Reset Expenditures in Turn Advancement

In `evaluateTurn.ts`, reset at start:

```typescript
state.turnExpenditures = { agentHiring: 0, upgrades: 0, capIncreases: 0 }
```

### 4. Add Balance Sheet Selector

Add new type `BalanceSheetDatasetRow`:

```typescript
type BalanceSheetDatasetRow = {
  turn: number
  funding: number        // positive
  contracting: number    // positive
  rewards: number        // positive
  upkeep: number         // negative (stored as negative)
  agentHiring: number    // negative (stored as negative)
  upgrades: number       // negative (stored as negative)
  capIncreases: number   // negative (stored as negative)
}
```

Use `selectTurnSnapshotsForCharts` only - no need for `selectTurnSnapshotsWithFirst` since expenditures are now tracked directly in state.

### 5. Add Stacked Bar Chart

Use MUI X Charts `BarChart` with `stackOffset: 'diverging'`:

```typescript
import { BarChart } from '@mui/x-charts/BarChart'

<BarChart
  dataset={datasets.balanceSheet}
  xAxis={[{ dataKey: 'turn', label: 'Turn', valueFormatter: formatTurn }]}
  series={[
    { dataKey: 'funding', label: 'Funding', stack: 'balance', stackOffset: 'diverging', color: ... },
    { dataKey: 'contracting', label: 'Contracting', stack: 'balance', color: ... },
    { dataKey: 'rewards', label: 'Rewards', stack: 'balance', color: ... },
    { dataKey: 'upkeep', label: 'Upkeep', stack: 'balance', color: ... },
    { dataKey: 'agentHiring', label: 'Agent hiring', stack: 'balance', color: ... },
    { dataKey: 'upgrades', label: 'Upgrades', stack: 'balance', color: ... },
    { dataKey: 'capIncreases', label: 'Cap increases', stack: 'balance', color: ... },
  ]}
/>
```

### 6. Add Green Shade Palette Colors

Add to theme palette interface and colorSystemOptions:

```typescript
balanceIncome1: green[400]  // Funding
balanceIncome2: green[500]  // Contracting
balanceIncome3: green[600]  // Rewards
```

Negative values will use existing red shades (or add more variations).

### 7. Make Charts Screen Scrollable

Change the outer `Box` in `ChartsScreen.tsx`:

- Remove `minHeight: '100vh'` constraint
- The grid layout already supports 3 columns on xl screens

This allows natural overflow when there are 7+ charts.

## Simplification

By tracking expenditures directly in `GameState.turnExpenditures`:

- No need for `selectTurnSnapshotsWithFirst` - can remove or ignore it
- Expenditure data comes directly from each turn's final snapshot
- Logic is simpler and more accurate
