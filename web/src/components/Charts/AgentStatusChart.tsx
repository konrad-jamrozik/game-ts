import * as React from 'react'
import { BarChart } from '@mui/x-charts/BarChart'
import type { GameState } from '../../lib/model/gameStateModel'
import { axisConfig, formatTurn, legendSlotProps, Y_AXIS_WIDTH } from './chartsUtils'
import { isMissionAssignment, isLeadInvestigationAssignment } from '../../lib/model_utils/agentUtils'

// Status colors with semantic gradient coding:
// Good: Available, In training - shades of green
// Bad: Recovering - red
// Busy: Contracting, Investigating - shades of yellow/gold
// Transient: In transit, On mission - blue and purple
type StatusColorName = 'goodLight' | 'goodDark' | 'bad' | 'busyLight' | 'busyDark' | 'transientBlue' | 'transientPurple'

function getColor(name: StatusColorName): string {
  switch (name) {
    case 'goodLight': // Available
      return 'hsla(120, 65%, 55%, 1)' // bright green
    case 'goodDark': // In training
      return 'hsla(120, 65%, 35%, 1)' // dark green
    case 'bad': // Recovering
      return 'hsla(0, 70%, 50%, 1)' // red
    case 'busyLight': // Contracting
      return 'hsla(45, 90%, 55%, 1)' // gold/amber
    case 'busyDark': // Investigating
      return 'hsla(35, 85%, 45%, 1)' // darker orange-gold
    case 'transientBlue': // In transit
      return 'hsla(210, 80%, 45%, 1)' // blue
    case 'transientPurple': // On mission
      return 'hsla(280, 75%, 55%, 1)' // purple with better contrast
  }
}

export type AgentStatusDatasetRow = {
  turn: number
  inTransit: number
  available: number
  recovering: number
  inTraining: number
  contracting: number
  investigating: number
  onMission: number
  totalAgents: number
}

type AgentStatusChartProps = {
  gameStates: GameState[]
  height: number
}

function bldAgentStatusRow(gameState: GameState): AgentStatusDatasetRow {
  const aliveAgents = gameState.agents

  if (aliveAgents.length === 0) {
    return {
      turn: gameState.turn,
      inTransit: 0,
      available: 0,
      recovering: 0,
      inTraining: 0,
      contracting: 0,
      investigating: 0,
      onMission: 0,
      totalAgents: 0,
    }
  }

  // Categorize agents by state/assignment
  // Order matters: In transit takes precedence, so check it first
  let inTransitCount = 0
  let availableCount = 0
  let recoveringCount = 0
  let inTrainingCount = 0
  let contractingCount = 0
  let investigatingCount = 0
  let onMissionCount = 0

  for (const agent of aliveAgents) {
    // In transit takes precedence over any assignment
    if (agent.state === 'InTransit' || agent.state === 'StartingTransit') {
      inTransitCount += 1
      continue
    }

    // Available (state, only one possible assignment)
    if (agent.state === 'Available') {
      availableCount += 1
      continue
    }

    // Recovering (assignment)
    if (agent.state === 'Recovering') {
      recoveringCount += 1
      continue
    }

    // In training (assignment)
    if (agent.state === 'InTraining' && agent.assignment === 'Training') {
      inTrainingCount += 1
      continue
    }

    // Contracting (assignment)
    if (agent.state === 'OnAssignment' && agent.assignment === 'Contracting') {
      contractingCount += 1
      continue
    }

    // Investigating (on investigation-id assignment)
    if (agent.state === 'OnAssignment' && isLeadInvestigationAssignment(agent.assignment)) {
      investigatingCount += 1
      continue
    }

    // On mission (on mission-id assignment)
    if (agent.state === 'OnMission' && isMissionAssignment(agent.assignment)) {
      onMissionCount += 1
      continue
    }
  }

  return {
    turn: gameState.turn,
    inTransit: inTransitCount,
    available: availableCount,
    recovering: recoveringCount,
    inTraining: inTrainingCount,
    contracting: contractingCount,
    investigating: investigatingCount,
    onMission: onMissionCount,
    totalAgents: aliveAgents.length,
  }
}

function buildAgentStatusDataset(gameStates: GameState[]): AgentStatusDatasetRow[] {
  return gameStates.map((gameState) => bldAgentStatusRow(gameState))
}

export function AgentStatusChart(props: AgentStatusChartProps): React.JSX.Element {
  const { gameStates, height } = props
  const dataset = buildAgentStatusDataset(gameStates)

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
          dataKey: 'available',
          label: 'Available',
          stack: 'status',
          color: getColor('goodLight'),
        },
        {
          dataKey: 'inTraining',
          label: 'In training',
          stack: 'status',
          color: getColor('goodDark'),
        },
        {
          dataKey: 'contracting',
          label: 'Contracting',
          stack: 'status',
          color: getColor('busyLight'),
        },
        {
          dataKey: 'investigating',
          label: 'Investigating',
          stack: 'status',
          color: getColor('busyDark'),
        },
        {
          dataKey: 'recovering',
          label: 'Recovering',
          stack: 'status',
          color: getColor('bad'),
        },
        {
          dataKey: 'onMission',
          label: 'On mission',
          stack: 'status',
          color: getColor('transientPurple'),
        },
        {
          dataKey: 'inTransit',
          label: 'In transit',
          stack: 'status',
          color: getColor('transientBlue'),
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
