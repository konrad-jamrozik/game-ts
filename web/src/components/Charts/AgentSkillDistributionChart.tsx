import * as React from 'react'
import { LineChart, lineElementClasses } from '@mui/x-charts/LineChart'
import type { GameState } from '../../lib/model/gameStateModel'
import { initialAgent } from '../../lib/factories/agentFactory'
import { toF } from '../../lib/primitives/fixed6'
import { computeSkillBands } from '../../lib/primitives/mathPrimitives'
import { axisConfig, formatTurn, legendSlotProps, withNoMarkers, Y_AXIS_WIDTH } from './chartsUtils'

const baselineSkill = toF(initialAgent.skill)

// Percentile band colors (static): bottom band = green, top band = dark_red
// When only one band is visible, it's green. As more bands become visible,
// the newest visible band is green and older ones shift to warmer colors.
// - p0to25 (bottom band, lowest skills) → GREEN
// - p25to50 → YELLOW
// - p50to75 → ORANGE
// - p75to95 → RED
// - p95to100 (top band, highest skills) → DARK_RED
function getColor(name: 'green' | 'yellow' | 'orange' | 'red' | 'dark_red'): string {
  switch (name) {
    case 'green':
      return 'hsla(120, 75%, 40%, 1)'
    case 'yellow':
      return 'hsla(60, 75%, 40%, 1)'
    case 'orange':
      return 'hsla(30, 75%, 40%, 1)'
    case 'red':
      return 'hsla(0, 75%, 40%, 1)'
    case 'dark_red':
      return 'hsla(0, 75%, 25%, 1)'
  }
}

export type AgentSkillDistributionDatasetRow = {
  turn: number
  p0to25: number
  p25to50: number
  p50to75: number
  p75to95: number
  p95to100: number
  // Percentile boundary skill values for tooltip range display
  minP0: number
  minP25: number
  minP50: number
  minP75: number
  minP95: number
  // Maximum skill values for each band (for determining visibility)
  maxP0to25: number
  maxP25to50: number
  maxP50to75: number
  maxP75to95: number
  maxP95to100: number
  // Agent counts in each percentile band
  countP0to25: number
  countP25to50: number
  countP50to75: number
  countP75to95: number
  countP95to100: number
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
      p0to25: 0,
      p25to50: 0,
      p50to75: 0,
      p75to95: 0,
      p95to100: 0,
      minP0: 0,
      minP25: 0,
      minP50: 0,
      minP75: 0,
      minP95: 0,
      maxP0to25: 0,
      maxP25to50: 0,
      maxP50to75: 0,
      maxP75to95: 0,
      maxP95to100: 0,
      countP0to25: 0,
      countP25to50: 0,
      countP50to75: 0,
      countP75to95: 0,
      countP95to100: 0,
      totalAgents: 0,
      maxSkill: 0,
    }
  }

  // Extract skill values (not effective skill, just skill)
  const skills = aliveAgents.map((agent) => toF(agent.skill))

  // Filter to skills at or above baseline for band computation
  const skillsAtOrAboveBaseline = skills.filter((skill) => skill >= baselineSkill)

  // Compute skill bands using percentile-threshold algorithm
  const bands = computeSkillBands(skillsAtOrAboveBaseline)

  // Map bands to the expected data structure
  // The bands are returned in ascending order (green first, then yellow, orange, red, dark_red)
  // This matches the chart display order: p0to25 (green) → p95to100 (dark_red)

  // Create a map from band names to indices
  const bandToIndex: Record<'green' | 'yellow' | 'orange' | 'red' | 'dark_red', number> = {
    green: 0, // p0to25 (lowest band)
    yellow: 1, // p25to50
    orange: 2, // p50to75
    red: 3, // p75to95
    dark_red: 4, // p95to100 (highest band)
  }

  // Initialize arrays for all bands
  const bandMins = [0, 0, 0, 0, 0]
  const bandMaxs = [0, 0, 0, 0, 0]
  const bandCounts = [0, 0, 0, 0, 0]

  // Assign band data to correct indices
  for (const band of bands) {
    const index = bandToIndex[band.band]
    bandMins[index] = band.minSkill
    bandMaxs[index] = band.maxSkill
    bandCounts[index] = band.count
  }

  // Compute visualization ranges for each band
  // For stacking: each band's height is from its min to its max
  // Empty bands between non-empty bands need special handling
  const bandRangeMaxs = [0, 0, 0, 0, 0]
  let lastMaxSkill = baselineSkill

  for (let i = 0; i < 5; i += 1) {
    const bandCount = bandCounts[i]
    const bandMax = bandMaxs[i]
    if (bandCount !== undefined && bandMax !== undefined && bandCount > 0) {
      bandRangeMaxs[i] = bandMax
      lastMaxSkill = bandMax
    } else {
      // For empty bands, use the last known max
      bandRangeMaxs[i] = lastMaxSkill
    }
  }

  // Calculate heights from bottom (index 0) to top (index 4)
  // Heights are differences between band max and previous boundary
  const bandHeights = [0, 0, 0, 0, 0]
  let previousBoundary = baselineSkill
  for (let i = 0; i < 5; i += 1) {
    const bandCount = bandCounts[i]
    const bandMax = bandMaxs[i]
    if (bandCount !== undefined && bandMax !== undefined && bandCount > 0) {
      bandHeights[i] = bandMax - previousBoundary
      previousBoundary = bandMax
    }
  }

  // Find min and max skills across all agents
  const min = skills.length > 0 ? Math.min(...skills) : 0
  const max = skills.length > 0 ? Math.max(...skills) : 0

  // Calculate boundary values for tooltip display
  // Each boundary[i] represents the upper bound of band i (which equals lower bound of band i+1)
  const boundaries = [0, 0, 0, 0, 0]
  let lastBoundary = bands.length > 0 ? baselineSkill : min
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

  // Determine minP0: use the minimum skill of the first band if it exists, otherwise use overall min
  const minP0 = bands.length > 0 && bands[0] !== undefined ? bands[0].minSkill : min

  // Store differences between percentile boundaries so they stack to actual skill values.
  // When stacked: p0to25 reaches max of band 0, p0to25+p25to50 reaches max of band 1, etc.
  //
  // The first band is offset by baselineSkill so the chart can start at baseline instead of 0.
  // The y-axis valueFormatter adds baselineSkill back for display.
  return {
    turn: gameState.turn,
    p0to25: bandHeights[0] ?? 0,
    p25to50: bandHeights[1] ?? 0,
    p50to75: bandHeights[2] ?? 0,
    p75to95: bandHeights[3] ?? 0,
    p95to100: bandHeights[4] ?? 0,
    // Percentile boundary skill values for tooltip range display
    minP0,
    minP25: boundaries[0] ?? minP0,
    minP50: boundaries[1] ?? minP0,
    minP75: boundaries[2] ?? minP0,
    minP95: boundaries[3] ?? minP0,
    // Maximum skill values for each band (for determining visibility)
    maxP0to25: bandMaxs[0] ?? 0,
    maxP25to50: bandMaxs[1] ?? 0,
    maxP50to75: bandMaxs[2] ?? 0,
    maxP75to95: bandMaxs[3] ?? 0,
    maxP95to100: bandMaxs[4] ?? 0,
    // Agent counts in each percentile band
    countP0to25: bandCounts[0] ?? 0,
    countP25to50: bandCounts[1] ?? 0,
    countP50to75: bandCounts[2] ?? 0,
    countP75to95: bandCounts[3] ?? 0,
    countP95to100: bandCounts[4] ?? 0,
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
    lowerBoundKey: 'minP0' | 'minP25' | 'minP50' | 'minP75' | 'minP95',
    upperBoundKey: 'minP25' | 'minP50' | 'minP75' | 'minP95' | 'maxSkill',
    countKey: 'countP0to25' | 'countP25to50' | 'countP50to75' | 'countP75to95' | 'countP95to100',
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
      // Show "-" for empty bands (0 agents or impossible range)
      if (agentCount === 0 || (lowerBound >= upperBound && !isFirstBand)) {
        return '-'
      }
      // Use closed ranges [min, max] instead of open ranges (min, max]
      // For non-first bands, add 1 to lower bound to convert from exclusive to inclusive
      const effectiveLowerBound = isFirstBand ? lowerBound : lowerBound + 1
      return `[${effectiveLowerBound.toFixed(1)}, ${upperBound.toFixed(1)}], Agents: ${agentCount}`
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
          dataKey: 'p0to25',
          label: 'Bottom 25% (agents)',
          stack: 'skill',
          area: true,
          color: getColor('green'),
          valueFormatter: createSkillValueFormatter('minP0', 'minP25', 'countP0to25', true),
        },
        {
          dataKey: 'p25to50',
          label: '25–50% percentile',
          stack: 'skill',
          area: true,
          color: getColor('yellow'),
          valueFormatter: createSkillValueFormatter('minP25', 'minP50', 'countP25to50', false),
        },
        {
          dataKey: 'p50to75',
          label: '50–75% percentile',
          stack: 'skill',
          area: true,
          color: getColor('orange'),
          valueFormatter: createSkillValueFormatter('minP50', 'minP75', 'countP50to75', false),
        },
        {
          dataKey: 'p75to95',
          label: '75–95% percentile',
          stack: 'skill',
          area: true,
          color: getColor('red'),
          valueFormatter: createSkillValueFormatter('minP75', 'minP95', 'countP75to95', false),
        },
        {
          dataKey: 'p95to100',
          label: 'Top 5% (agents)',
          stack: 'skill',
          area: true,
          color: getColor('dark_red'),
          valueFormatter: createSkillValueFormatter('minP95', 'maxSkill', 'countP95to100', false),
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
