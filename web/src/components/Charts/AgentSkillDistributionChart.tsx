import * as React from 'react'
import { LineChart, lineElementClasses } from '@mui/x-charts/LineChart'
import type { GameState } from '../../lib/model/gameStateModel'
import { initialAgent } from '../../lib/factories/agentFactory'
import { toF } from '../../lib/primitives/fixed6'
import { computeDistinctSkillBands } from '../../lib/primitives/mathPrimitives'
import { axisConfig, formatTurn, legendSlotProps, withNoMarkers, Y_AXIS_WIDTH } from './chartsUtils'

const baselineSkill = toF(initialAgent.skill)

// Quartile band colors (static): bottom band = green, top band = red
// When only one band is visible, it's green. As more bands become visible,
// the newest visible band is green and older ones shift to warmer colors.
// - p0to25 (bottom band, lowest skills) → GREEN
// - p25to50 → YELLOW
// - p50to75 → ORANGE
// - p75to100 (top band, highest skills) → RED
function getColor(name: 'green' | 'yellow' | 'orange' | 'red'): string {
  switch (name) {
    case 'green':
      return 'hsla(120, 100%, 50%, 0.9)'
    case 'yellow':
      return 'hsla(60, 100%, 50%, 0.9)'
    case 'orange':
      return 'hsla(30, 100%, 50%, 0.9)'
    case 'red':
      return 'hsla(0, 100%, 50%, 0.9)'
  }
}

export type AgentSkillDistributionDatasetRow = {
  turn: number
  p0to25: number
  p25to50: number
  p50to75: number
  p75to100: number
  // Percentile boundary skill values for tooltip range display
  minP0: number
  minP25: number
  minP50: number
  minP75: number
  // Maximum skill values for each band (for determining visibility)
  maxP0to25: number
  maxP25to50: number
  maxP50to75: number
  maxP75to100: number
  // Agent counts in each percentile band
  countP0to25: number
  countP25to50: number
  countP50to75: number
  countP75to100: number
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
      p75to100: 0,
      minP0: 0,
      minP25: 0,
      minP50: 0,
      minP75: 0,
      maxP0to25: 0,
      maxP25to50: 0,
      maxP50to75: 0,
      maxP75to100: 0,
      countP0to25: 0,
      countP25to50: 0,
      countP50to75: 0,
      countP75to100: 0,
      totalAgents: 0,
      maxSkill: 0,
    }
  }

  // Extract skill values (not effective skill, just skill)
  const skills = aliveAgents.map((agent) => toF(agent.skill))

  // Compute distinct skill bands based on distinct skill values above baseline
  const bands = computeDistinctSkillBands(skills, baselineSkill)

  // Map bands to the expected data structure
  // The bands are returned in ascending order (green first, then yellow, orange, red)
  // This matches the chart display order: p0to25 (green) → p75to100 (red)

  // Create a map from band names to indices
  const bandToIndex: Record<'green' | 'yellow' | 'orange' | 'red', number> = {
    green: 0, // p0to25 (lowest band)
    yellow: 1, // p25to50
    orange: 2, // p50to75
    red: 3, // p75to100 (highest band)
  }

  // Initialize arrays for all bands
  const bandHeights = [0, 0, 0, 0]
  const bandMins = [0, 0, 0, 0]
  const bandMaxs = [0, 0, 0, 0]
  const bandCounts = [0, 0, 0, 0]
  const bandRangeMins = [0, 0, 0, 0]
  const bandRangeMaxs = [0, 0, 0, 0]

  // Assign band data to correct indices
  for (const band of bands) {
    const index = bandToIndex[band.band]
    bandMins[index] = band.minSkill
    bandMaxs[index] = band.maxSkill
    bandRangeMins[index] = band.skillRangeMin
    bandRangeMaxs[index] = band.skillRangeMax
    bandCounts[index] = band.count
  }

  // Calculate heights from bottom (index 0) to top (index 3) using expanded ranges
  // This ensures heights are always positive and stack correctly
  let previousBoundary = baselineSkill
  for (let i = 0; i < 4; i += 1) {
    const bandRangeMax = bandRangeMaxs[i]
    const bandCount = bandCounts[i]
    if (bandRangeMax !== undefined && bandCount !== undefined && bandCount > 0) {
      bandHeights[i] = bandRangeMax - previousBoundary
      previousBoundary = bandRangeMax
    }
  }

  // Find min and max skills across all agents
  const min = skills.length > 0 ? Math.min(...skills) : 0
  const max = skills.length > 0 ? Math.max(...skills) : 0

  // Calculate boundary values for tooltip display
  // Each boundary[i] represents the upper bound of band i (which equals lower bound of band i+1)
  // Use the expanded range max for boundaries
  // Cascading: if a band is empty, use the previous boundary
  const boundaries = [0, 0, 0, 0]
  // Start with baseline+1 for the first band if there are any bands, otherwise use min
  let lastBoundary = bands.length > 0 ? baselineSkill + 1 : min
  for (let i = 0; i < 4; i += 1) {
    const bandRangeMax = bandRangeMaxs[i]
    const bandCount = bandCounts[i]
    if (bandRangeMax !== undefined && bandCount !== undefined && bandCount > 0) {
      boundaries[i] = bandRangeMax
      lastBoundary = bandRangeMax
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
    p75to100: bandHeights[3] ?? 0,
    // Percentile boundary skill values for tooltip range display
    minP0,
    minP25: boundaries[0] ?? minP0,
    minP50: boundaries[1] ?? minP0,
    minP75: boundaries[2] ?? minP0,
    // Maximum skill values for each band (for determining visibility)
    maxP0to25: bandMaxs[0] ?? 0,
    maxP25to50: bandMaxs[1] ?? 0,
    maxP50to75: bandMaxs[2] ?? 0,
    maxP75to100: bandMaxs[3] ?? 0,
    // Agent counts in each percentile band
    countP0to25: bandCounts[0] ?? 0,
    countP25to50: bandCounts[1] ?? 0,
    countP50to75: bandCounts[2] ?? 0,
    countP75to100: bandCounts[3] ?? 0,
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
    lowerBoundKey: 'minP0' | 'minP25' | 'minP50' | 'minP75',
    upperBoundKey: 'minP25' | 'minP50' | 'minP75' | 'maxSkill',
    countKey: 'countP0to25' | 'countP25to50' | 'countP50to75' | 'countP75to100',
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
          label: '0-25%',
          stack: 'skill',
          area: true,
          color: getColor('green'),
          valueFormatter: createSkillValueFormatter('minP0', 'minP25', 'countP0to25', true),
        },
        {
          dataKey: 'p25to50',
          label: '25-50%',
          stack: 'skill',
          area: true,
          color: getColor('yellow'),
          valueFormatter: createSkillValueFormatter('minP25', 'minP50', 'countP25to50', false),
        },
        {
          dataKey: 'p50to75',
          label: '50-75%',
          stack: 'skill',
          area: true,
          color: getColor('orange'),
          valueFormatter: createSkillValueFormatter('minP50', 'minP75', 'countP50to75', false),
        },
        {
          dataKey: 'p75to100',
          label: '75-100%',
          stack: 'skill',
          area: true,
          color: getColor('red'),
          valueFormatter: createSkillValueFormatter('minP75', 'maxSkill', 'countP75to100', false),
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
