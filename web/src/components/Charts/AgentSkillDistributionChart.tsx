import * as React from 'react'
import { LineChart, lineElementClasses } from '@mui/x-charts/LineChart'
import type { GameState } from '../../lib/model/gameStateModel'
import { toF } from '../../lib/primitives/fixed6'
import { computeQuintileBands } from '../../lib/primitives/mathPrimitives'
import { axisConfig, formatTurn, legendSlotProps, withNoMarkers, Y_AXIS_WIDTH } from './chartsUtils'
import { assertDefined } from '../../lib/primitives/assertPrimitives'

const agentSkillBandColors: readonly string[] = [
  'green', // 0-20%: inexperienced
  'yellow', // 20-40%: experienced
  'orange', // 40-60%: veterans
  'red', // 60-80%: elite
  'purple', // 80-100%: super-elite
] as const

function getColor(idx: number): string {
  const color = agentSkillBandColors[idx]
  assertDefined(color, `Color index ${idx} is out of bounds`)
  return color
}

export type AgentSkillDistributionDatasetRow = {
  turn: number
  p0to20: number
  p20to40: number
  p40to60: number
  p60to80: number
  p80to100: number
  // Percentile boundary skill values for tooltip range display
  minP0: number
  minP20: number
  minP40: number
  minP60: number
  minP80: number
  // Agent counts in each percentile band
  countP0to20: number
  countP20to40: number
  countP40to60: number
  countP60to80: number
  countP80to100: number
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
      p0to20: 0,
      p20to40: 0,
      p40to60: 0,
      p60to80: 0,
      p80to100: 0,
      minP0: 0,
      minP20: 0,
      minP40: 0,
      minP60: 0,
      minP80: 0,
      countP0to20: 0,
      countP20to40: 0,
      countP40to60: 0,
      countP60to80: 0,
      countP80to100: 0,
      totalAgents: 0,
      maxSkill: 0,
    }
  }

  // Extract skill values (not effective skill, just skill)
  const skills = aliveAgents.map((agent) => toF(agent.skill))

  // Compute quintile bands using tie-aware, rank-based grouping
  const bands = computeQuintileBands(skills)

  // Map bands to the expected data structure
  // computeQuintileBands returns bands in descending skill order (highest skills first)
  // We reverse them so lowest skills come first, then assign to indices 0, 1, 2, ...
  // This ensures that if there are fewer than 5 bands, they fill from Inexperienced up:
  // - 1 band → Inexperienced
  // - 2 bands → Inexperienced, Experienced
  // - 3 bands → Inexperienced, Experienced, Veterans
  // - etc.
  const reversedBands = bands.toReversed()

  // Initialize arrays for all quintile bands
  const bandHeights = [0, 0, 0, 0, 0]
  const bandMins = [0, 0, 0, 0, 0]
  const bandMaxs = [0, 0, 0, 0, 0]
  const bandCounts = [0, 0, 0, 0, 0]

  // Assign bands to indices based on their position (first = Inexperienced, etc.)
  for (let i = 0; i < reversedBands.length && i < 5; i += 1) {
    const band = reversedBands[i]
    if (band !== undefined) {
      bandMins[i] = band.minSkill
      bandMaxs[i] = band.maxSkill
      bandCounts[i] = band.count
    }
  }

  // Second pass: calculate heights from bottom (index 0) to top (index 4)
  // This ensures heights are always positive and stack correctly
  let previousBoundary = 0
  for (let i = 0; i < 5; i += 1) {
    const bandMax = bandMaxs[i]
    const bandCount = bandCounts[i]
    if (bandMax !== undefined && bandCount !== undefined && bandCount > 0) {
      bandHeights[i] = bandMax - previousBoundary
      previousBoundary = bandMax
    }
  }

  // Find min and max skills across all agents
  const min = skills.length > 0 ? Math.min(...skills) : 0
  const max = skills.length > 0 ? Math.max(...skills) : 0

  // Calculate boundary values for tooltip display
  // Each boundary[i] represents the upper bound of band i (which equals lower bound of band i+1)
  // Cascading: if a band is empty, use the previous boundary
  const boundaries = [0, 0, 0, 0, 0]
  let lastBoundary = min
  for (let i = 0; i < 5; i += 1) {
    const bandMax = bandMaxs[i]
    const bandCount = bandCounts[i]
    if (bandMax !== undefined && bandCount !== undefined && bandCount > 0) {
      boundaries[i] = bandMax
      lastBoundary = bandMax
    } else {
      boundaries[i] = lastBoundary
    }
  }

  // Store differences between percentile boundaries so they stack to actual skill values.
  // When stacked: p0to20 reaches max of band 0, p0to20+p20to40 reaches max of band 1, etc.
  return {
    turn: gameState.turn,
    p0to20: bandHeights[0] ?? 0,
    p20to40: bandHeights[1] ?? 0,
    p40to60: bandHeights[2] ?? 0,
    p60to80: bandHeights[3] ?? 0,
    p80to100: bandHeights[4] ?? 0,
    // Percentile boundary skill values for tooltip range display
    minP0: min,
    minP20: boundaries[0] ?? min,
    minP40: boundaries[1] ?? min,
    minP60: boundaries[2] ?? min,
    minP80: boundaries[3] ?? min,
    // Agent counts in each percentile band
    countP0to20: bandCounts[0] ?? 0,
    countP20to40: bandCounts[1] ?? 0,
    countP40to60: bandCounts[2] ?? 0,
    countP60to80: bandCounts[3] ?? 0,
    countP80to100: bandCounts[4] ?? 0,
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
    lowerBoundKey: 'minP0' | 'minP20' | 'minP40' | 'minP60' | 'minP80',
    upperBoundKey: 'minP20' | 'minP40' | 'minP60' | 'minP80' | 'maxSkill',
    countKey: 'countP0to20' | 'countP20to40' | 'countP40to60' | 'countP60to80' | 'countP80to100',
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
          valueFormatter: (value: number | null): string => (value === null ? '' : String(Math.round(value))),
        },
      ]}
      series={withNoMarkers([
        {
          dataKey: 'p0to20',
          label: 'Inexperienced',
          stack: 'skill',
          area: true,
          color: getColor(0),
          valueFormatter: createSkillValueFormatter('minP0', 'minP20', 'countP0to20', true),
        },
        {
          dataKey: 'p20to40',
          label: 'Experienced',
          stack: 'skill',
          area: true,
          color: getColor(1),
          valueFormatter: createSkillValueFormatter('minP20', 'minP40', 'countP20to40', false),
        },
        {
          dataKey: 'p40to60',
          label: 'Veterans',
          stack: 'skill',
          area: true,
          color: getColor(2),
          valueFormatter: createSkillValueFormatter('minP40', 'minP60', 'countP40to60', false),
        },
        {
          dataKey: 'p60to80',
          label: 'Elite',
          stack: 'skill',
          area: true,
          color: getColor(3),
          valueFormatter: createSkillValueFormatter('minP60', 'minP80', 'countP60to80', false),
        },
        {
          dataKey: 'p80to100',
          label: 'Super-elite',
          stack: 'skill',
          area: true,
          color: getColor(4),
          valueFormatter: createSkillValueFormatter('minP80', 'maxSkill', 'countP80to100', false),
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
