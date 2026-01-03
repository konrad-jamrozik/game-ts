import * as React from 'react'
import { LineChart } from '@mui/x-charts/LineChart'
import { purple } from '@mui/material/colors'
import type { GameState } from '../../lib/model/gameStateModel'
import { toF } from '../../lib/primitives/fixed6'
import { quantileSorted } from '../../lib/primitives/mathPrimitives'
import { axisConfig, formatTurn, legendSlotProps, withNoMarkers, yAxisConfig } from './chartsUtils'

export type AgentSkillDistributionDatasetRow = {
  turn: number
  p0to10: number
  p10to20: number
  p20to30: number
  p30to40: number
  p40to50: number
  p50to60: number
  p60to70: number
  p70to80: number
  p80to90: number
  p90to100: number
  // Min skill boundaries for tooltip display (skill needed to be in given percentile)
  minP0: number
  minP10: number
  minP20: number
  minP30: number
  minP40: number
  minP50: number
  minP60: number
  minP70: number
  minP80: number
  minP90: number
  // Agent counts in each percentile band
  countP0to10: number
  countP10to20: number
  countP20to30: number
  countP30to40: number
  countP40to50: number
  countP50to60: number
  countP60to70: number
  countP70to80: number
  countP80to90: number
  countP90to100: number
  // Total number of agents
  totalAgents: number
  // Maximum skill across all agents
  maxSkill: number
}

type AgentSkillDistributionChartProps = {
  gameStates: GameState[]
  height: number
}

function bldAgentSkillDistributionRow(gameState: GameState): AgentSkillDistributionDatasetRow {
  const aliveAgents = gameState.agents

  if (aliveAgents.length === 0) {
    return {
      turn: gameState.turn,
      p0to10: 0,
      p10to20: 0,
      p20to30: 0,
      p30to40: 0,
      p40to50: 0,
      p50to60: 0,
      p60to70: 0,
      p70to80: 0,
      p80to90: 0,
      p90to100: 0,
      minP0: 0,
      minP10: 0,
      minP20: 0,
      minP30: 0,
      minP40: 0,
      minP50: 0,
      minP60: 0,
      minP70: 0,
      minP80: 0,
      minP90: 0,
      countP0to10: 0,
      countP10to20: 0,
      countP20to30: 0,
      countP30to40: 0,
      countP40to50: 0,
      countP50to60: 0,
      countP60to70: 0,
      countP70to80: 0,
      countP80to90: 0,
      countP90to100: 0,
      totalAgents: 0,
      maxSkill: 0,
    }
  }

  // Extract skill values (not effective skill, just skill)
  const skills = aliveAgents.map((agent) => toF(agent.skill))

  // Sort skills in ascending order
  const sortedSkills = [...skills].toSorted((a, b) => a - b)

  // Calculate percentile boundary values (actual skill values)
  const min = sortedSkills[0] ?? 0
  const p10 = quantileSorted(sortedSkills, 0.1)
  const p20 = quantileSorted(sortedSkills, 0.2)
  const p30 = quantileSorted(sortedSkills, 0.3)
  const p40 = quantileSorted(sortedSkills, 0.4)
  const p50 = quantileSorted(sortedSkills, 0.5)
  const p60 = quantileSorted(sortedSkills, 0.6)
  const p70 = quantileSorted(sortedSkills, 0.7)
  const p80 = quantileSorted(sortedSkills, 0.8)
  const p90 = quantileSorted(sortedSkills, 0.9)
  const max = sortedSkills.at(-1) ?? 0

  // Count agents in each percentile band
  // For each band, count agents with skill >= lower bound and < upper bound
  // Except the first band, which is >= min and <= p10
  // The special treatments of p10 for the lowest band is done to catch minimum values in the p0-p10 band,
  // as otherwise they would end up in higher bands in case of skewed data, e.g. if data is 0,0,0,0,0,0,0,0,0,0,100,
  // then 0 would be not in p0-p10 but higher, but it should be in p0-p10.
  // This would happen because the check "s < p10" i.e. "0 < 0" would fail.
  const countP0to10 = skills.filter((s) => s >= min && s <= p10).length
  const countP10to20 = skills.filter((s) => s > p10 && s <= p20).length
  const countP20to30 = skills.filter((s) => s > p20 && s <= p30).length
  const countP30to40 = skills.filter((s) => s > p30 && s <= p40).length
  const countP40to50 = skills.filter((s) => s > p40 && s <= p50).length
  const countP50to60 = skills.filter((s) => s > p50 && s <= p60).length
  const countP60to70 = skills.filter((s) => s > p60 && s <= p70).length
  const countP70to80 = skills.filter((s) => s > p70 && s <= p80).length
  const countP80to90 = skills.filter((s) => s > p80 && s <= p90).length
  const countP90to100 = skills.filter((s) => s > p90).length

  // Store differences between percentile boundaries so they stack to actual skill values.
  // When stacked: p0to10 reaches p10, p0to10+p10to20 reaches p20, ..., sum reaches max.
  return {
    turn: gameState.turn,
    p0to10: p10,
    p10to20: p20 - p10,
    p20to30: p30 - p20,
    p30to40: p40 - p30,
    p40to50: p50 - p40,
    p50to60: p60 - p50,
    p60to70: p70 - p60,
    p70to80: p80 - p70,
    p80to90: p90 - p80,
    p90to100: max - p90,
    // Min skill boundaries for tooltip (skill needed to be at least in given percentile)
    minP0: min,
    minP10: p10,
    minP20: p20,
    minP30: p30,
    minP40: p40,
    minP50: p50,
    minP60: p60,
    minP70: p70,
    minP80: p80,
    minP90: p90,
    // Agent counts in each percentile band
    countP0to10,
    countP10to20,
    countP20to30,
    countP30to40,
    countP40to50,
    countP50to60,
    countP60to70,
    countP70to80,
    countP80to90,
    countP90to100,
    // Total number of agents
    totalAgents: aliveAgents.length,
    // Maximum skill across all agents
    maxSkill: max,
  }
}

function buildAgentSkillDistributionDataset(gameStates: GameState[]): AgentSkillDistributionDatasetRow[] {
  return gameStates.map((gameState) => bldAgentSkillDistributionRow(gameState))
}

export function AgentSkillDistributionChart(props: AgentSkillDistributionChartProps): React.JSX.Element {
  const { gameStates, height } = props
  const dataset = buildAgentSkillDistributionDataset(gameStates)

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
