import * as React from 'react'
import { ChartDataProvider } from '@mui/x-charts/ChartDataProvider'
import { ChartsSurface } from '@mui/x-charts/ChartsSurface'
import { BarPlot } from '@mui/x-charts/BarChart'
import { LinePlot } from '@mui/x-charts/LineChart'
import { ChartsXAxis } from '@mui/x-charts/ChartsXAxis'
import { ChartsYAxis } from '@mui/x-charts/ChartsYAxis'
import { ChartsGrid } from '@mui/x-charts/ChartsGrid'
import { ChartsTooltip } from '@mui/x-charts/ChartsTooltip'
import { ChartsLegend } from '@mui/x-charts/ChartsLegend'
import { red } from '@mui/material/colors'
import type { GameState } from '../../lib/model/gameStateModel'
import { axisConfig, LEGEND_FONT_SIZE, yAxisConfig } from './chartsUtils'
import { isMissionAssignment } from '../../lib/model_utils/agentUtils'
import { toF } from '../../lib/primitives/fixed6'
import { calculateCombatRating } from '../../lib/ruleset/combatRatingRuleset'

// Combat rating colors with semantic coding:
// Good: Ready - bright green
// Warning: Tired - yellow/orange
// Away: Away states - blue
// Bad: Recovering - dark red
type CombatRatingColorName = 'ready' | 'tired' | 'away' | 'recovering'

function getColor(name: CombatRatingColorName): string {
  switch (name) {
    case 'ready':
      return 'hsla(120, 65%, 55%, 1)' // bright green
    case 'tired':
      return 'hsla(45, 90%, 55%, 1)' // gold/amber
    case 'away':
      return 'hsla(210, 80%, 45%, 1)' // blue
    case 'recovering':
      return 'hsla(0, 70%, 35%, 1)' // dark red
  }
}

export type AgentCombatRatingDatasetRow = {
  turn: number
  readyCR: number
  tiredCR: number
  awayCR: number
  recoveringCR: number
  totalCR: number
  highestMissionCR: number
  avgMissionCR20: number
}

type AgentCombatRatingChartProps = {
  gameStates: GameState[]
  height: number
}

export function AgentCombatRatingChart(props: AgentCombatRatingChartProps): React.JSX.Element {
  const { gameStates, height } = props
  const dataset = buildAgentCombatRatingDataset(gameStates)

  function formatTurnWithTotalCR(turn: number): string {
    const datasetItem = dataset.find((item) => item.turn === turn)
    if (datasetItem === undefined) {
      return formatTurn(turn)
    }
    return `${formatTurn(turn)} (Total CR: ${datasetItem.totalCR.toFixed(2)})`
  }

  return (
    <ChartDataProvider
      dataset={dataset}
      xAxis={[
        {
          scaleType: 'band',
          dataKey: 'turn',
          label: 'Turn',
          valueFormatter: formatTurnWithTotalCR,
          ...axisConfig,
        },
      ]}
      yAxis={[yAxisConfig]}
      series={[
        // Bar series for agent combat ratings (stacked)
        {
          type: 'bar',
          dataKey: 'readyCR',
          label: 'Ready CR',
          stack: 'combatRating',
          color: getColor('ready'),
        },
        {
          type: 'bar',
          dataKey: 'tiredCR',
          label: 'Tired CR',
          stack: 'combatRating',
          color: getColor('tired'),
        },
        {
          type: 'bar',
          dataKey: 'awayCR',
          label: 'Away CR',
          stack: 'combatRating',
          color: getColor('away'),
        },
        {
          type: 'bar',
          dataKey: 'recoveringCR',
          label: 'Recovering CR',
          stack: 'combatRating',
          color: getColor('recovering'),
        },
        // Line series for mission combat ratings
        {
          id: 'highestMissionCR',
          type: 'line',
          dataKey: 'highestMissionCR',
          label: 'Highest Mission CR',
          showMark: false,
          color: red[500], // Bright red
        },
        {
          id: 'avgMissionCR20',
          type: 'line',
          dataKey: 'avgMissionCR20',
          label: 'Avg Mission CR (20 turns)',
          showMark: false,
          color: red[800], // Dark red
        },
      ]}
      height={height}
    >
      <ChartsLegend sx={{ fontSize: LEGEND_FONT_SIZE }} />
      <ChartsSurface
        sx={{
          '& .MuiLineElement-root': {
            strokeWidth: 3,
          },
        }}
      >
        <ChartsGrid horizontal />
        <BarPlot />
        <LinePlot />
        <ChartsXAxis />
        <ChartsYAxis />
        <ChartsTooltip trigger="axis" />
      </ChartsSurface>
    </ChartDataProvider>
  )
}

function buildAgentCombatRatingDataset(gameStates: GameState[]): AgentCombatRatingDatasetRow[] {
  // Collect all mission CRs per turn for computing metrics
  const missionCRsByTurn = new Map<number, number[]>()

  for (const gameState of gameStates) {
    const turn = gameState.turn
    const missionCRs: number[] = []
    for (const mission of gameState.missions) {
      missionCRs.push(mission.combatRating)
    }
    missionCRsByTurn.set(turn, missionCRs)
  }

  let runningMaxMissionCR = 0
  const dataset: AgentCombatRatingDatasetRow[] = []

  for (const gameState of gameStates) {
    const turn = gameState.turn
    const agentRow = bldAgentCombatRatingRow(gameState)

    // Update running max with current turn's missions
    const currentMissionCRs = missionCRsByTurn.get(turn) ?? []
    for (const cr of currentMissionCRs) {
      if (cr > runningMaxMissionCR) {
        runningMaxMissionCR = cr
      }
    }

    // Calculate 20-turn rolling average
    const avgMissionCR20 = calculateRollingAvgMissionCR(turn, missionCRsByTurn, 20)

    dataset.push({
      ...agentRow,
      highestMissionCR: runningMaxMissionCR,
      avgMissionCR20,
    })
  }

  return dataset
}

function calculateRollingAvgMissionCR(
  currentTurn: number,
  missionCRsByTurn: Map<number, number[]>,
  windowSize: number,
): number {
  const startTurn = Math.max(1, currentTurn - windowSize + 1)
  let totalCR = 0
  let missionCount = 0

  for (let turn = startTurn; turn <= currentTurn; turn += 1) {
    const missionCRs = missionCRsByTurn.get(turn) ?? []
    for (const cr of missionCRs) {
      totalCR += cr
      missionCount += 1
    }
  }

  return missionCount > 0 ? totalCR / missionCount : 0
}

function bldAgentCombatRatingRow(
  gameState: GameState,
): Omit<AgentCombatRatingDatasetRow, 'highestMissionCR' | 'avgMissionCR20'> {
  const aliveAgents = gameState.agents

  if (aliveAgents.length === 0) {
    return {
      turn: gameState.turn,
      readyCR: 0,
      tiredCR: 0,
      awayCR: 0,
      recoveringCR: 0,
      totalCR: 0,
    }
  }

  let readyCRSum = 0
  let tiredCRSum = 0
  let awayCRSum = 0
  let recoveringCRSum = 0

  for (const agent of aliveAgents) {
    const exhaustionPct = toF(agent.exhaustionPct)
    const combatRating = calculateCombatRating(agent)

    // Away states take precedence
    if (
      agent.state === 'InTransit' ||
      agent.state === 'StartingTransit' ||
      agent.state === 'Contracting' ||
      agent.state === 'Investigating' ||
      (agent.state === 'OnMission' && isMissionAssignment(agent.assignment))
    ) {
      awayCRSum += combatRating
      continue
    }

    // Recovering state
    if (agent.state === 'Recovering') {
      recoveringCRSum += combatRating
      continue
    }

    // Exhaustion-based categories for Available or InTraining states
    if (agent.state === 'Available' || agent.state === 'InTraining') {
      if (exhaustionPct <= 5) {
        readyCRSum += combatRating
      } else if (exhaustionPct >= 6) {
        tiredCRSum += combatRating
      }
      continue
    }
  }

  const totalCR = readyCRSum + tiredCRSum + awayCRSum + recoveringCRSum

  return {
    turn: gameState.turn,
    readyCR: readyCRSum,
    tiredCR: tiredCRSum,
    awayCR: awayCRSum,
    recoveringCR: recoveringCRSum,
    totalCR,
  }
}

function formatTurn(value: number): string {
  return `Turn ${value}`
}
