import * as React from 'react'
import { LineChart, lineElementClasses } from '@mui/x-charts/LineChart'
import type { GameState } from '../../lib/model/gameStateModel'
import { initialAgent } from '../../lib/factories/agentFactory'
import { toF } from '../../lib/primitives/fixed6'
import { computeDecileBands } from '../../lib/primitives/mathPrimitives'
import { axisConfig, formatTurn, legendSlotProps, withNoMarkers, Y_AXIS_WIDTH } from './chartsUtils'
import { assertDefined } from '../../lib/primitives/assertPrimitives'

const baselineSkill = toF(initialAgent.skill)

// Green → Yellow → Red gradient for skill bands (low skill = green, high skill = red)
// Algorithm: increment green 0→255, then decrement red 255→0
// For 10 colors with step = 510/9 ≈ 56.67
// Reversed order: first color is pure green, last is pure red
// Progressive transparency: starting from fully opaque (1.0) to more transparent
// Alpha step: (1.0 - 0.294) / 9 ≈ 0.078, so we go from 1.0 to 0.294
const agentSkillBandColors: readonly string[] = [
  'hsla(120, 100%, 50%, 1)',
  'hsla(108, 100%, 50%, 1)',
  'hsla(96, 100%, 50%, 0.9)',
  'hsla(84, 100%, 50%, 0.8)',
  'hsla(72, 100%, 50%, 0.7)',
  'hsla(60, 100%, 50%, 0.6)',
  'hsla(48, 100%, 50%, 0.5)',
  'hsla(36, 100%, 50%, 0.4)',
  'hsla(24, 100%, 50%, 0.3)',
  'hsla(0, 100%, 50%, 0.2)',
] as const

function getColor(idx: number): string {
  const color = agentSkillBandColors[idx]
  assertDefined(color, `Color index ${idx} is out of bounds`)
  return color
}

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
  // Note: computeDecileBands returns bands in descending skill order (Top 10% = highest skills)
  // But the chart displays from bottom (p0to10 = lowest skills) to top (p90to100 = highest skills)
  // So we invert the mapping: highest skills → p90to100 (index 9), lowest skills → p0to10 (index 0)
  const labelToIndex: Record<string, number> = {
    'Top 10%': 9, // highest skills → top of chart
    '10-20%': 8,
    '20-30%': 7,
    '30-40%': 6,
    '40-50%': 5,
    '50-60%': 4,
    '60-70%': 3,
    '70-80%': 2,
    '80-90%': 1,
    '90-100%': 0, // lowest skills → bottom of chart
  }

  // Initialize arrays for all decile bands
  const bandHeights = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
  const bandMins = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
  const bandMaxs = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
  const bandCounts = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]

  // First pass: assign min/max/count to correct indices
  for (const band of bands) {
    const index = labelToIndex[band.label]
    if (index !== undefined) {
      bandMins[index] = band.minSkill
      bandMaxs[index] = band.maxSkill
      bandCounts[index] = band.count
    }
  }

  // Second pass: calculate heights from bottom (index 0) to top (index 9)
  // This ensures heights are always positive and stack correctly
  let previousBoundary = baselineSkill
  for (let i = 0; i < 10; i += 1) {
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
  const boundaries = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
  let lastBoundary = min
  for (let i = 0; i < 10; i += 1) {
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
          color: getColor(0),
          valueFormatter: createSkillValueFormatter('minP0', 'minP10', 'countP0to10', true),
        },
        {
          dataKey: 'p10to20',
          label: '10-20%',
          stack: 'skill',
          area: true,
          color: getColor(1),
          valueFormatter: createSkillValueFormatter('minP10', 'minP20', 'countP10to20', false),
        },
        {
          dataKey: 'p20to30',
          label: '20-30%',
          stack: 'skill',
          area: true,
          color: getColor(2),
          valueFormatter: createSkillValueFormatter('minP20', 'minP30', 'countP20to30', false),
        },
        {
          dataKey: 'p30to40',
          label: '30-40%',
          stack: 'skill',
          area: true,
          color: getColor(3),
          valueFormatter: createSkillValueFormatter('minP30', 'minP40', 'countP30to40', false),
        },
        {
          dataKey: 'p40to50',
          label: '40-50%',
          stack: 'skill',
          area: true,
          color: getColor(4),
          valueFormatter: createSkillValueFormatter('minP40', 'minP50', 'countP40to50', false),
        },
        {
          dataKey: 'p50to60',
          label: '50-60%',
          stack: 'skill',
          area: true,
          color: getColor(5),
          valueFormatter: createSkillValueFormatter('minP50', 'minP60', 'countP50to60', false),
        },
        {
          dataKey: 'p60to70',
          label: '60-70%',
          stack: 'skill',
          area: true,
          color: getColor(6),
          valueFormatter: createSkillValueFormatter('minP60', 'minP70', 'countP60to70', false),
        },
        {
          dataKey: 'p70to80',
          label: '70-80%',
          stack: 'skill',
          area: true,
          color: getColor(7),
          valueFormatter: createSkillValueFormatter('minP70', 'minP80', 'countP70to80', false),
        },
        {
          dataKey: 'p80to90',
          label: '80-90%',
          stack: 'skill',
          area: true,
          color: getColor(8),
          valueFormatter: createSkillValueFormatter('minP80', 'minP90', 'countP80to90', false),
        },
        {
          dataKey: 'p90to100',
          label: '90-100%',
          stack: 'skill',
          area: true,
          color: getColor(9),
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
