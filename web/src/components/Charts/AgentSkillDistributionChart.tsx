import * as React from 'react'
import { LineChart, lineElementClasses } from '@mui/x-charts/LineChart'
import { purple } from '@mui/material/colors'
import type { GameState } from '../../lib/model/gameStateModel'
import { initialAgent } from '../../lib/factories/agentFactory'
import { toF } from '../../lib/primitives/fixed6'
import { computeDecileBands } from '../../lib/primitives/mathPrimitives'
import { axisConfig, formatTurn, legendSlotProps, withNoMarkers, Y_AXIS_WIDTH } from './chartsUtils'

const baselineSkill = toF(initialAgent.skill)

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
  // Percentile boundary skill values for tooltip range display
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

  // Compute decile bands using tie-aware, rank-based grouping
  const bands = computeDecileBands(skills)

  // Map bands to the expected data structure
  // The bands are returned in descending order (Top 10% first, then 10-20%, etc.)
  // We need to map them to p0to10, p10to20, ..., p90to100
  // Empty bands will have zero height and zero count

  // Create a map from band labels to indices
  const labelToIndex: Record<string, number> = {
    'Top 10%': 0,
    '10-20%': 1,
    '20-30%': 2,
    '30-40%': 3,
    '40-50%': 4,
    '50-60%': 5,
    '60-70%': 6,
    '70-80%': 7,
    '80-90%': 8,
    '90-100%': 9,
  }

  // Initialize arrays for all decile bands
  const bandHeights = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
  const bandMins = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
  const bandMaxs = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
  const bandCounts = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]

  // Process bands and assign to decile slots
  // Bands are in descending order (Top 10% first)
  let previousMax = baselineSkill
  for (const band of bands) {
    const index = labelToIndex[band.label]
    if (index !== undefined) {
      bandMins[index] = band.minSkill
      bandMaxs[index] = band.maxSkill
      bandCounts[index] = band.count
      // Calculate height as difference from previous max
      // Empty bands will have zero height (band.maxSkill equals previousMax)
      if (band.count > 0) {
        bandHeights[index] = band.maxSkill - previousMax
        previousMax = band.maxSkill
      }
    }
  }

  // Find min and max skills across all agents
  const min = skills.length > 0 ? Math.min(...skills) : 0
  const max = skills.length > 0 ? Math.max(...skills) : 0

  // Calculate boundary values, cascading down if bands are empty
  // Each boundary is the maxSkill of the corresponding band, or the previous boundary if empty
  const boundaries = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
  let lastBoundary = min
  for (let i = 0; i < 10; i += 1) {
    const bandMax = bandMaxs[i]
    if (bandMax !== undefined && bandMax > 0) {
      boundaries[i] = bandMax
      lastBoundary = bandMax
    } else {
      boundaries[i] = lastBoundary
    }
  }

  // Store differences between percentile boundaries so they stack to actual skill values.
  // When stacked: p0to10 reaches max of band 0, p0to10+p10to20 reaches max of band 1, etc.
  //
  // The first band is offset by baselineSkill so the chart can start at baseline instead of 0.
  // The y-axis valueFormatter adds baselineSkill back for display.
  return {
    turn: gameState.turn,
    p0to10: bandHeights[0] ?? 0,
    p10to20: bandHeights[1] ?? 0,
    p20to30: bandHeights[2] ?? 0,
    p30to40: bandHeights[3] ?? 0,
    p40to50: bandHeights[4] ?? 0,
    p50to60: bandHeights[5] ?? 0,
    p60to70: bandHeights[6] ?? 0,
    p70to80: bandHeights[7] ?? 0,
    p80to90: bandHeights[8] ?? 0,
    p90to100: bandHeights[9] ?? 0,
    // Percentile boundary skill values for tooltip range display
    minP0: min,
    minP10: boundaries[0] ?? min,
    minP20: boundaries[1] ?? min,
    minP30: boundaries[2] ?? min,
    minP40: boundaries[3] ?? min,
    minP50: boundaries[4] ?? min,
    minP60: boundaries[5] ?? min,
    minP70: boundaries[6] ?? min,
    minP80: boundaries[7] ?? min,
    minP90: boundaries[8] ?? min,
    // Agent counts in each percentile band
    countP0to10: bandCounts[0] ?? 0,
    countP10to20: bandCounts[1] ?? 0,
    countP20to30: bandCounts[2] ?? 0,
    countP30to40: bandCounts[3] ?? 0,
    countP40to50: bandCounts[4] ?? 0,
    countP50to60: bandCounts[5] ?? 0,
    countP60to70: bandCounts[6] ?? 0,
    countP70to80: bandCounts[7] ?? 0,
    countP80to90: bandCounts[8] ?? 0,
    countP90to100: bandCounts[9] ?? 0,
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
    lowerBoundKey:
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
    upperBoundKey:
      | 'minP10'
      | 'minP20'
      | 'minP30'
      | 'minP40'
      | 'minP50'
      | 'minP60'
      | 'minP70'
      | 'minP80'
      | 'minP90'
      | 'maxSkill',
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
    isFirstBand: boolean,
  ): (value: number | null, context: { dataIndex: number }) => string {
    return (_value, context): string => {
      const datasetItem = dataset[context.dataIndex]
      if (datasetItem === undefined) {
        return ''
      }
      const lowerBound: number = datasetItem[lowerBoundKey]
      const upperBound: number = datasetItem[upperBoundKey]
      const agentCount: number = datasetItem[countKey]
      // First band uses closed bracket [, others use open bracket (
      const leftBracket = isFirstBand ? '[' : '('
      return `${leftBracket}${lowerBound.toFixed(1)}, ${upperBound.toFixed(1)}], Agents: ${agentCount}`
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
      yAxis={[
        {
          ...axisConfig,
          width: Y_AXIS_WIDTH,
          valueFormatter: (value: number | null): string =>
            value === null ? '' : String(Math.round(value + baselineSkill)),
        },
      ]}
      series={withNoMarkers([
        {
          dataKey: 'p0to10',
          label: '0-10%',
          stack: 'skill',
          area: true,
          color: purple[50],
          valueFormatter: createSkillValueFormatter('minP0', 'minP10', 'countP0to10', true),
        },
        {
          dataKey: 'p10to20',
          label: '10-20%',
          stack: 'skill',
          area: true,
          color: purple[100],
          valueFormatter: createSkillValueFormatter('minP10', 'minP20', 'countP10to20', false),
        },
        {
          dataKey: 'p20to30',
          label: '20-30%',
          stack: 'skill',
          area: true,
          color: purple[200],
          valueFormatter: createSkillValueFormatter('minP20', 'minP30', 'countP20to30', false),
        },
        {
          dataKey: 'p30to40',
          label: '30-40%',
          stack: 'skill',
          area: true,
          color: purple[300],
          valueFormatter: createSkillValueFormatter('minP30', 'minP40', 'countP30to40', false),
        },
        {
          dataKey: 'p40to50',
          label: '40-50%',
          stack: 'skill',
          area: true,
          color: purple[400],
          valueFormatter: createSkillValueFormatter('minP40', 'minP50', 'countP40to50', false),
        },
        {
          dataKey: 'p50to60',
          label: '50-60%',
          stack: 'skill',
          area: true,
          color: purple[500],
          valueFormatter: createSkillValueFormatter('minP50', 'minP60', 'countP50to60', false),
        },
        {
          dataKey: 'p60to70',
          label: '60-70%',
          stack: 'skill',
          area: true,
          color: purple[600],
          valueFormatter: createSkillValueFormatter('minP60', 'minP70', 'countP60to70', false),
        },
        {
          dataKey: 'p70to80',
          label: '70-80%',
          stack: 'skill',
          area: true,
          color: purple[700],
          valueFormatter: createSkillValueFormatter('minP70', 'minP80', 'countP70to80', false),
        },
        {
          dataKey: 'p80to90',
          label: '80-90%',
          stack: 'skill',
          area: true,
          color: purple[800],
          valueFormatter: createSkillValueFormatter('minP80', 'minP90', 'countP80to90', false),
        },
        {
          dataKey: 'p90to100',
          label: '90-100%',
          stack: 'skill',
          area: true,
          color: purple[900],
          valueFormatter: createSkillValueFormatter('minP90', 'maxSkill', 'countP90to100', false),
        },
      ])}
      height={height}
      grid={{ horizontal: true }}
      sx={{
        [`& .${lineElementClasses.root}`]: {
          display: 'none',
        },
      }}
      slotProps={{
        tooltip: { trigger: 'axis' },
        ...legendSlotProps,
      }}
    />
  )
}
