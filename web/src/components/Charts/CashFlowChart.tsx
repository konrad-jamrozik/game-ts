import * as React from 'react'
import { ChartDataProvider } from '@mui/x-charts/ChartDataProvider'
import { ChartsSurface } from '@mui/x-charts/ChartsSurface'
import { BarPlot } from '@mui/x-charts/BarChart'
import { LinePlot } from '@mui/x-charts/LineChart'
import { ChartsXAxis } from '@mui/x-charts/ChartsXAxis'
import { ChartsYAxis } from '@mui/x-charts/ChartsYAxis'
import { ChartsGrid } from '@mui/x-charts/ChartsGrid'
import { ChartsTooltip } from '@mui/x-charts/ChartsTooltip'
import { ChartsLegend } from '@mui/x-charts/ChartsLegend'
import type { BalanceSheetDatasetRow } from '../../redux/selectors/chartsSelectors'
import { axisConfig, formatTurn, LEGEND_FONT_SIZE, yAxisConfig } from './chartsUtils'
import { amber, green, red } from '@mui/material/colors'

// Cash flow colors:
// Income: green shades (positive values)
// Expenses: red shades (negative values)
// Net flow: amber (line)
type CashFlowColorName = 'funding' | 'contracting' | 'rewards' | 'upkeep' | 'agentHiring' | 'capIncreases' | 'upgrades' | 'netFlow'

function getColor(name: CashFlowColorName): string {
  switch (name) {
    case 'funding':
      return green[800] // green dark (income)
    case 'contracting':
      return green[600] // green medium (income)
    case 'rewards':
      return green[400] // green light (income)
    case 'upkeep':
      return red[900] // red dark (expense)
    case 'agentHiring':
      return red[700] // red medium (expense)
    case 'capIncreases':
      return red[500] // red medium-light (expense)
    case 'upgrades':
      return red[300] // red light (expense)
    case 'netFlow':
      return amber[400] // amber (line)
  }
}

type CashFlowChartProps = {
  dataset: BalanceSheetDatasetRow[]
  height: number
}

export function CashFlowChart(props: CashFlowChartProps): React.JSX.Element {
  const { dataset, height } = props

  return (
    <ChartDataProvider
      dataset={dataset}
      xAxis={[
        {
          scaleType: 'band',
          dataKey: 'turn',
          label: 'Turn',
          valueFormatter: formatTurn,
          ...axisConfig,
        },
      ]}
      yAxis={[yAxisConfig]}
      series={[
        // Positive values (stack above zero, first touches zero)
        {
          type: 'bar',
          dataKey: 'funding',
          label: 'Funding',
          stack: 'balance',
          stackOffset: 'diverging',
          color: getColor('funding'),
        },
        {
          type: 'bar',
          dataKey: 'contracting',
          label: 'Contracting income',
          stack: 'balance',
          color: getColor('contracting'),
        },
        {
          type: 'bar',
          dataKey: 'rewards',
          label: 'Rewards from missions',
          stack: 'balance',
          color: getColor('rewards'),
        },
        // Negative values (stack below zero, first touches zero)
        {
          type: 'bar',
          dataKey: 'upkeep',
          label: 'Upkeep',
          stack: 'balance',
          color: getColor('upkeep'),
        },
        {
          type: 'bar',
          dataKey: 'agentHiring',
          label: 'Agent hiring expenditures',
          stack: 'balance',
          color: getColor('agentHiring'),
        },
        {
          type: 'bar',
          dataKey: 'capIncreases',
          label: 'Cap increase expenditures',
          stack: 'balance',
          color: getColor('capIncreases'),
        },
        {
          type: 'bar',
          dataKey: 'upgrades',
          label: 'Upgrade expenditures',
          stack: 'balance',
          color: getColor('upgrades'),
        },
        // Net flow line (golden)
        {
          type: 'line',
          dataKey: 'netFlow',
          label: 'Net flow',
          showMark: false,
          color: getColor('netFlow'),
        },
      ]}
      height={height}
    >
      <ChartsLegend sx={{ fontSize: LEGEND_FONT_SIZE }} />
      <ChartsSurface>
        <ChartsGrid horizontal />
        <BarPlot />
        <LinePlot />
        <ChartsXAxis />
        <ChartsYAxis />
        <ChartsTooltip trigger="axis" />
      </ChartsSurface>
    </ChartDataProvider>
  )
}
