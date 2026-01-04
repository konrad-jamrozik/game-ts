import * as React from 'react'
import { ChartContainer } from '@mui/x-charts/ChartContainer'
import { BarPlot } from '@mui/x-charts/BarChart'
import { ChartsXAxis } from '@mui/x-charts/ChartsXAxis'
import { ChartsYAxis } from '@mui/x-charts/ChartsYAxis'
import { ChartsGrid } from '@mui/x-charts/ChartsGrid'
import { ChartsTooltip } from '@mui/x-charts/ChartsTooltip'
import { ChartsLegend } from '@mui/x-charts/ChartsLegend'
import { useTheme } from '@mui/material/styles'
import type { GameState } from '../../lib/model/gameStateModel'
import { axisConfig, formatTurn, LEGEND_FONT_SIZE, Y_AXIS_WIDTH } from './chartsUtils'
import { isMissionAssignment, isLeadInvestigationAssignment } from '../../lib/model_utils/agentUtils'

export type AgentStatusDistributionDatasetRow = {
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

type AgentStatusDistributionChartProps = {
  gameStates: GameState[]
  height: number
}

function bldAgentStatusDistributionRow(gameState: GameState): AgentStatusDistributionDatasetRow {
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

function buildAgentStatusDistributionDataset(gameStates: GameState[]): AgentStatusDistributionDatasetRow[] {
  return gameStates.map((gameState) => bldAgentStatusDistributionRow(gameState))
}

export function AgentStatusDistributionChart(props: AgentStatusDistributionChartProps): React.JSX.Element {
  const { gameStates, height } = props
  const theme = useTheme()
  const dataset = buildAgentStatusDistributionDataset(gameStates)

  function formatTurnWithTotalAgents(turn: number): string {
    const datasetItem = dataset.find((item) => item.turn === turn)
    if (datasetItem === undefined) {
      return formatTurn(turn)
    }
    return `${formatTurn(turn)} (Total agents: ${datasetItem.totalAgents})`
  }

  return (
    <ChartContainer
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
          type: 'bar',
          dataKey: 'available',
          label: 'Available',
          id: 'available',
          stack: 'status',
          color: theme.palette.agentStateAvailable.light,
        },
        {
          type: 'bar',
          dataKey: 'inTraining',
          label: 'In training',
          id: 'inTraining',
          stack: 'status',
          color: theme.palette.agentStateInTraining.light,
        },
        {
          type: 'bar',
          dataKey: 'contracting',
          label: 'Contracting',
          id: 'contracting',
          stack: 'status',
          color: theme.palette.agentStateOnAssignment.main,
        },
        {
          type: 'bar',
          dataKey: 'investigating',
          label: 'Investigating',
          id: 'investigating',
          stack: 'status',
          color: theme.palette.agentStateOnAssignment.dark,
        },
        {
          type: 'bar',
          dataKey: 'recovering',
          label: 'Recovering',
          id: 'recovering',
          stack: 'status',
          color: theme.palette.agentStateRecovering.main,
        },
        {
          type: 'bar',
          dataKey: 'inTransit',
          label: 'In transit',
          id: 'inTransit',
          stack: 'status',
          color: theme.palette.agentStateInTransit.main,
        },
        {
          type: 'bar',
          dataKey: 'onMission',
          label: 'On mission',
          id: 'onMission',
          stack: 'status',
          color: theme.palette.agentStateOnMission.main,
        },
      ]}
      height={height}
    >
      <ChartsGrid horizontal />
      <BarPlot />
      <ChartsXAxis />
      <ChartsYAxis />
      <ChartsTooltip trigger="axis" />
      <ChartsLegend sx={{ fontSize: LEGEND_FONT_SIZE }} />
    </ChartContainer>
  )
}
