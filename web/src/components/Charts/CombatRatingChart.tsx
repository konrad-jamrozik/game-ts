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

export type CombatRatingDatasetRow = {
  turn: number
  readyCR: number
  tiredCR: number
  awayCR: number
  recoveringCR: number
  totalCR: number
  highestMissionCR: number
  p50MissionCR20: number
  p80MissionCR20: number
}

type CombatRatingChartProps = {
  gameStates: GameState[]
  height: number
}

export function CombatRatingChart(props: CombatRatingChartProps): React.JSX.Element {
  const { gameStates, height } = props
  const dataset = buildCombatRatingDataset(gameStates)

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
          id: 'p50MissionCR20',
          type: 'line',
          dataKey: 'p50MissionCR20',
          label: 'P50 Mission CR (20 turns)',
          showMark: false,
          color: red[800], // Dark red
        },
        {
          id: 'p80MissionCR20',
          type: 'line',
          dataKey: 'p80MissionCR20',
          label: 'P80 Mission CR (20 turns)',
          showMark: false,
          color: red[600], // Medium red
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

function buildCombatRatingDataset(gameStates: GameState[]): CombatRatingDatasetRow[] {
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
  const dataset: CombatRatingDatasetRow[] = []

  for (const gameState of gameStates) {
    const turn = gameState.turn
    const agentRow = bldCombatRatingRow(gameState)

    // Update running max with current turn's missions
    const currentMissionCRs = missionCRsByTurn.get(turn) ?? []
    for (const cr of currentMissionCRs) {
      if (cr > runningMaxMissionCR) {
        runningMaxMissionCR = cr
      }
    }

    // Calculate 20-turn rolling percentiles
    const { p50, p80 } = calculateRollingPercentilesMissionCR(turn, missionCRsByTurn, 20)

    dataset.push({
      ...agentRow,
      highestMissionCR: runningMaxMissionCR,
      p50MissionCR20: p50,
      p80MissionCR20: p80,
    })
  }

  return dataset
}

function calculateRollingPercentilesMissionCR(
  currentTurn: number,
  missionCRsByTurn: Map<number, number[]>,
  windowSize: number,
): { p50: number; p80: number } {
  const startTurn = Math.max(1, currentTurn - windowSize + 1)
  const allCRs: number[] = []

  for (let turn = startTurn; turn <= currentTurn; turn += 1) {
    const missionCRs = missionCRsByTurn.get(turn) ?? []
    allCRs.push(...missionCRs)
  }

  if (allCRs.length === 0) {
    return { p50: 0, p80: 0 }
  }

  // Sort in ascending order
  const sorted = allCRs.toSorted((a, b) => a - b)

  // Calculate percentiles
  const p50Index = Math.floor((sorted.length - 1) * 0.5)
  const p80Index = Math.floor((sorted.length - 1) * 0.8)

  return {
    p50: sorted[p50Index] ?? 0,
    p80: sorted[p80Index] ?? 0,
  }
}

function bldCombatRatingRow(
  gameState: GameState,
): Omit<CombatRatingDatasetRow, 'highestMissionCR' | 'p50MissionCR20' | 'p80MissionCR20'> {
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
