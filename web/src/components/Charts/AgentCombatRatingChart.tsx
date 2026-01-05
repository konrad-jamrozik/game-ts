import * as React from 'react'
import { BarChart } from '@mui/x-charts/BarChart'
import type { GameState } from '../../lib/model/gameStateModel'
import { axisConfig, formatTurn, legendSlotProps, Y_AXIS_WIDTH } from './chartsUtils'
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
}

type AgentCombatRatingChartProps = {
  gameStates: GameState[]
  height: number
}

function bldAgentCombatRatingRow(gameState: GameState): AgentCombatRatingDatasetRow {
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

function buildAgentCombatRatingDataset(gameStates: GameState[]): AgentCombatRatingDatasetRow[] {
  return gameStates.map((gameState) => bldAgentCombatRatingRow(gameState))
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
    <BarChart
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
      yAxis={[
        {
          ...axisConfig,
          width: Y_AXIS_WIDTH,
        },
      ]}
      series={[
        {
          dataKey: 'readyCR',
          label: 'Ready CR',
          stack: 'combatRating',
          color: getColor('ready'),
        },
        {
          dataKey: 'tiredCR',
          label: 'Tired CR',
          stack: 'combatRating',
          color: getColor('tired'),
        },
        {
          dataKey: 'awayCR',
          label: 'Away CR',
          stack: 'combatRating',
          color: getColor('away'),
        },
        {
          dataKey: 'recoveringCR',
          label: 'Recovering CR',
          stack: 'combatRating',
          color: getColor('recovering'),
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
