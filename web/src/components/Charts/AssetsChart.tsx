import * as React from 'react'
import { LineChart } from '@mui/x-charts/LineChart'
import type { AssetsDatasetRow } from '../../redux/selectors/chartsSelectors'
import { axisConfig, formatTurn, legendSlotProps, withNoMarkers, yAxisConfig } from './chartsUtils'
import { amber, blue, brown, lightGreen } from '@mui/material/colors'

// Assets chart colors:
// Money: green
// Agent count: brown (MUI palette)
// Agent cap: brown lighter (MUI palette, dashed)
// Transport cap: blue (dashed)
// Training cap: gold/amber (dashed)
type AssetsColorName = 'money' | 'agentCount' | 'agentCap' | 'transportCap' | 'trainingCap'

function getColor(name: AssetsColorName): string {
  switch (name) {
    case 'money':
      return lightGreen[600]
    case 'agentCount':
      return brown[400] // brown dark
    case 'agentCap':
      return brown[200] // brown light
    case 'transportCap':
      return blue[600]
    case 'trainingCap':
      return amber[400]
  }
}

type AssetsChartProps = {
  dataset: AssetsDatasetRow[]
  height: number
}

export function AssetsChart(props: AssetsChartProps): React.JSX.Element {
  const { dataset, height } = props

  return (
    <LineChart
      dataset={dataset}
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
        {
          dataKey: 'money',
          label: 'Money',
          color: getColor('money'),
          yAxisId: 'moneyAxisId',
        },
        {
          dataKey: 'agentCount',
          label: 'Agents',
          color: getColor('agentCount'),
          yAxisId: 'agentAxisId',
        },
        {
          dataKey: 'agentCap',
          label: 'Agent cap',
          color: getColor('agentCap'),
          yAxisId: 'agentAxisId',
          strokeDasharray: '5 5',
        },
        {
          dataKey: 'transportCap',
          label: 'Transport cap',
          color: getColor('transportCap'),
          yAxisId: 'agentAxisId',
          strokeDasharray: '5 5',
        },
        {
          dataKey: 'trainingCap',
          label: 'Training cap',
          color: getColor('trainingCap'),
          yAxisId: 'agentAxisId',
          strokeDasharray: '5 5',
        },
      ])}
      height={height}
      grid={{ horizontal: true }}
      slotProps={{
        tooltip: { trigger: 'axis' },
        ...legendSlotProps,
      }}
    />
  )
}
