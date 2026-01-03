import * as React from 'react'
import { LineChart } from '@mui/x-charts/LineChart'
import { purple } from '@mui/material/colors'
import type { AgentSkillDistributionDatasetRow } from '../../redux/selectors/chartsSelectors'
import { axisConfig, formatTurn, legendSlotProps, withNoMarkers, yAxisConfig } from './chartsUtils'

type AgentSkillDistributionChartProps = {
  dataset: AgentSkillDistributionDatasetRow[]
  height: number
}

export function AgentSkillDistributionChart(props: AgentSkillDistributionChartProps): React.JSX.Element {
  const { dataset, height } = props

  function createSkillValueFormatter(
    minSkillKey:
      | 'minP0'
      | 'minP10'
      | 'minP20'
      | 'minP30'
      | 'minP40'
      | 'minP50'
      | 'minP60'
      | 'minP70'
      | 'minP80'
      | 'minP90',
    countKey:
      | 'countP0to10'
      | 'countP10to20'
      | 'countP20to30'
      | 'countP30to40'
      | 'countP40to50'
      | 'countP50to60'
      | 'countP60to70'
      | 'countP70to80'
      | 'countP80to90'
      | 'countP90to100',
  ): (value: number | null, context: { dataIndex: number }) => string {
    return (_value, context): string => {
      const datasetItem = dataset[context.dataIndex]
      if (datasetItem === undefined) {
        return ''
      }
      const minSkill: number = datasetItem[minSkillKey]
      const agentCount: number = datasetItem[countKey]
      return `Min skill: ${minSkill.toFixed(1)}, Agents: ${agentCount}`
    }
  }

  function formatTurnWithTotalAgents(turn: number): string {
    const datasetItem = dataset.find((item) => item.turn === turn)
    if (datasetItem === undefined) {
      return formatTurn(turn)
    }
    return `${formatTurn(turn)} (Total agents: ${datasetItem.totalAgents}, Max skill: ${datasetItem.maxSkill.toFixed(1)})`
  }

  return (
    <LineChart
      dataset={dataset}
      xAxis={[
        {
          dataKey: 'turn',
          label: 'Turn',
          valueFormatter: formatTurnWithTotalAgents,
          ...axisConfig,
        },
      ]}
      yAxis={[yAxisConfig]}
      series={withNoMarkers([
        {
          dataKey: 'p0to10',
          label: '0-10%',
          stack: 'skill',
          area: true,
          color: purple[50],
          valueFormatter: createSkillValueFormatter('minP0', 'countP0to10'),
        },
        {
          dataKey: 'p10to20',
          label: '10-20%',
          stack: 'skill',
          area: true,
          color: purple[100],
          valueFormatter: createSkillValueFormatter('minP10', 'countP10to20'),
        },
        {
          dataKey: 'p20to30',
          label: '20-30%',
          stack: 'skill',
          area: true,
          color: purple[200],
          valueFormatter: createSkillValueFormatter('minP20', 'countP20to30'),
        },
        {
          dataKey: 'p30to40',
          label: '30-40%',
          stack: 'skill',
          area: true,
          color: purple[300],
          valueFormatter: createSkillValueFormatter('minP30', 'countP30to40'),
        },
        {
          dataKey: 'p40to50',
          label: '40-50%',
          stack: 'skill',
          area: true,
          color: purple[400],
          valueFormatter: createSkillValueFormatter('minP40', 'countP40to50'),
        },
        {
          dataKey: 'p50to60',
          label: '50-60%',
          stack: 'skill',
          area: true,
          color: purple[500],
          valueFormatter: createSkillValueFormatter('minP50', 'countP50to60'),
        },
        {
          dataKey: 'p60to70',
          label: '60-70%',
          stack: 'skill',
          area: true,
          color: purple[600],
          valueFormatter: createSkillValueFormatter('minP60', 'countP60to70'),
        },
        {
          dataKey: 'p70to80',
          label: '70-80%',
          stack: 'skill',
          area: true,
          color: purple[700],
          valueFormatter: createSkillValueFormatter('minP70', 'countP70to80'),
        },
        {
          dataKey: 'p80to90',
          label: '80-90%',
          stack: 'skill',
          area: true,
          color: purple[800],
          valueFormatter: createSkillValueFormatter('minP80', 'countP80to90'),
        },
        {
          dataKey: 'p90to100',
          label: '90-100%',
          stack: 'skill',
          area: true,
          color: purple[900],
          valueFormatter: createSkillValueFormatter('minP90', 'countP90to100'),
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
