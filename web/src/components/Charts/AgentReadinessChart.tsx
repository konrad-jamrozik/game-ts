import * as React from 'react'
import { BarChart } from '@mui/x-charts/BarChart'
import type { GameState } from '../../lib/model/gameStateModel'
import { axisConfig, formatTurn, legendSlotProps, Y_AXIS_WIDTH } from './chartsUtils'
import { isMissionAssignment } from '../../lib/model_utils/agentUtils'
import { toF } from '../../lib/primitives/fixed6'

// Readiness colors with semantic gradient coding:
// Good: Ready - bright green
// Warning: Slightly tired, Tired, Very tired - yellow to orange gradient
// Bad: Exhausted - red
// Recovering: Recovering - dark red
// Away: Away states - blue/purple
type ReadinessColorName =
  | 'ready'
  | 'slightlyTired'
  | 'tired'
  | 'veryTired'
  | 'exhausted'
  | 'recovering'
  | 'away'

function getColor(name: ReadinessColorName): string {
  switch (name) {
    case 'ready':
      return 'hsla(120, 65%, 55%, 1)' // bright green
    case 'slightlyTired':
      return 'hsla(60, 90%, 60%, 1)' // light yellow
    case 'tired':
      return 'hsla(45, 90%, 55%, 1)' // gold/amber
    case 'veryTired':
      return 'hsla(30, 85%, 50%, 1)' // orange
    case 'exhausted':
      return 'hsla(0, 70%, 50%, 1)' // red
    case 'recovering':
      return 'hsla(0, 70%, 35%, 1)' // dark red
    case 'away':
      return 'hsla(210, 80%, 45%, 1)' // blue
  }
}

export type AgentReadinessDatasetRow = {
  turn: number
  ready: number
  slightlyTired: number
  tired: number
  veryTired: number
  exhausted: number
  recovering: number
  away: number
  totalAgents: number
}

type AgentReadinessChartProps = {
  gameStates: GameState[]
  height: number
}

function bldAgentReadinessRow(gameState: GameState): AgentReadinessDatasetRow {
  const aliveAgents = gameState.agents

  if (aliveAgents.length === 0) {
    return {
      turn: gameState.turn,
      ready: 0,
      slightlyTired: 0,
      tired: 0,
      veryTired: 0,
      exhausted: 0,
      recovering: 0,
      away: 0,
      totalAgents: 0,
    }
  }

  let readyCount = 0
  let slightlyTiredCount = 0
  let tiredCount = 0
  let veryTiredCount = 0
  let exhaustedCount = 0
  let recoveringCount = 0
  let awayCount = 0

  for (const agent of aliveAgents) {
    const exhaustionPct = toF(agent.exhaustionPct)

    // Away states take precedence
    if (
      agent.state === 'InTransit' ||
      agent.state === 'StartingTransit' ||
      agent.state === 'Contracting' ||
      agent.state === 'Investigating' ||
      (agent.state === 'OnMission' && isMissionAssignment(agent.assignment))
    ) {
      awayCount += 1
      continue
    }

    // Recovering state
    if (agent.state === 'Recovering') {
      recoveringCount += 1
      continue
    }

    // Exhaustion-based categories for Available or InTraining states
    if (agent.state === 'Available' || agent.state === 'InTraining') {
      if (exhaustionPct <= 5) {
        readyCount += 1
      } else if (exhaustionPct >= 6 && exhaustionPct <= 30) {
        slightlyTiredCount += 1
      } else if (exhaustionPct >= 31 && exhaustionPct <= 60) {
        tiredCount += 1
      } else if (exhaustionPct >= 61 && exhaustionPct < 100) {
        veryTiredCount += 1
      } else if (exhaustionPct >= 100) {
        exhaustedCount += 1
      }
      continue
    }
  }

  return {
    turn: gameState.turn,
    ready: readyCount,
    slightlyTired: slightlyTiredCount,
    tired: tiredCount,
    veryTired: veryTiredCount,
    exhausted: exhaustedCount,
    recovering: recoveringCount,
    away: awayCount,
    totalAgents: aliveAgents.length,
  }
}

function buildAgentReadinessDataset(gameStates: GameState[]): AgentReadinessDatasetRow[] {
  return gameStates.map((gameState) => bldAgentReadinessRow(gameState))
}

export function AgentReadinessChart(props: AgentReadinessChartProps): React.JSX.Element {
  const { gameStates, height } = props
  const dataset = buildAgentReadinessDataset(gameStates)

  function formatTurnWithTotalAgents(turn: number): string {
    const datasetItem = dataset.find((item) => item.turn === turn)
    if (datasetItem === undefined) {
      return formatTurn(turn)
    }
    return `${formatTurn(turn)} (Total agents: ${datasetItem.totalAgents})`
  }

  return (
    <BarChart
      dataset={dataset}
      xAxis={[
        {
          scaleType: 'band',
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
        },
      ]}
      series={[
        {
          dataKey: 'ready',
          label: 'Ready',
          stack: 'readiness',
          color: getColor('ready'),
        },
        {
          dataKey: 'slightlyTired',
          label: 'Slightly tired',
          stack: 'readiness',
          color: getColor('slightlyTired'),
        },
        {
          dataKey: 'tired',
          label: 'Tired',
          stack: 'readiness',
          color: getColor('tired'),
        },
        {
          dataKey: 'veryTired',
          label: 'Very tired',
          stack: 'readiness',
          color: getColor('veryTired'),
        },
        {
          dataKey: 'exhausted',
          label: 'Exhausted',
          stack: 'readiness',
          color: getColor('exhausted'),
        },
        {
          dataKey: 'recovering',
          label: 'Recovering',
          stack: 'readiness',
          color: getColor('recovering'),
        },
        {
          dataKey: 'away',
          label: 'Away',
          stack: 'readiness',
          color: getColor('away'),
        },
      ]}
      height={height}
      grid={{ horizontal: true }}
      slotProps={{
        tooltip: { trigger: 'axis' },
        ...legendSlotProps,
      }}
    />
  )
}
