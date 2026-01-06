import * as React from 'react'
import { LineChart } from '@mui/x-charts/LineChart'
import type { GameState } from '../../lib/model/gameStateModel'
import { axisConfig, formatTurn, legendSlotProps, withNoMarkers, Y_AXIS_WIDTH } from './chartsUtils'

// Agent outcomes colors:
// unscathed (green), wounded (yellow), incapacitated (orange), KIA (red), sacked (grey)
type AgentOutcomeColorName = 'unscathed' | 'wounded' | 'incapacitated' | 'kia' | 'sacked'

function getColor(name: AgentOutcomeColorName): string {
  switch (name) {
    case 'unscathed':
      return 'hsla(120, 65%, 45%, 1)' // green
    case 'wounded':
      return 'hsla(50, 90%, 50%, 1)' // yellow
    case 'incapacitated':
      return 'hsla(30, 85%, 50%, 1)' // orange
    case 'kia':
      return 'hsla(0, 70%, 50%, 1)' // red
    case 'sacked':
      return 'hsla(0, 0%, 50%, 1)' // grey
  }
}

export type AgentOutcomesDatasetRow = {
  turn: number
  unscathed: number
  wounded: number
  incapacitated: number
  kia: number
  sacked: number
}

type AgentOutcomesChartProps = {
  gameStates: GameState[]
  height: number
}

function buildAgentOutcomesDataset(gameStates: GameState[]): AgentOutcomesDatasetRow[] {
  let cumulativeUnscathed = 0
  let cumulativeWounded = 0
  let cumulativeIncapacitated = 0
  let cumulativeKia = 0
  let cumulativeSacked = 0

  return gameStates.map((gameState) => {
    const report = gameState.turnStartReport
    if (report) {
      for (const missionReport of report.missions) {
        cumulativeUnscathed += missionReport.battleStats.agentsUnscathed
        cumulativeWounded += missionReport.battleStats.agentsWounded
        cumulativeIncapacitated += missionReport.battleStats.agentsIncapacitated
        cumulativeKia += missionReport.battleStats.agentsTerminated
      }
    }

    // Count sacked agents from terminated agents list
    const sackedThisTurn = gameState.terminatedAgents.filter(
      (agent) => agent.state === 'Sacked' && agent.turnTerminated === gameState.turn,
    ).length
    cumulativeSacked += sackedThisTurn

    return {
      turn: gameState.turn,
      unscathed: cumulativeUnscathed,
      wounded: cumulativeWounded,
      incapacitated: cumulativeIncapacitated,
      kia: cumulativeKia,
      sacked: cumulativeSacked,
    }
  })
}

export function AgentOutcomesChart(props: AgentOutcomesChartProps): React.JSX.Element {
  const { gameStates, height } = props
  const dataset = buildAgentOutcomesDataset(gameStates)

  return (
    <LineChart
      dataset={dataset}
      xAxis={[
        {
          dataKey: 'turn',
          label: 'Turn',
          valueFormatter: formatTurn,
          ...axisConfig,
        },
      ]}
      yAxis={[
        {
          ...axisConfig,
          width: Y_AXIS_WIDTH,
        },
      ]}
      series={withNoMarkers([
        {
          dataKey: 'unscathed',
          label: 'Unscathed',
          color: getColor('unscathed'),
        },
        {
          dataKey: 'wounded',
          label: 'Wounded',
          color: getColor('wounded'),
        },
        {
          dataKey: 'incapacitated',
          label: 'Incapacitated',
          color: getColor('incapacitated'),
        },
        {
          dataKey: 'kia',
          label: 'KIA',
          color: getColor('kia'),
        },
        {
          dataKey: 'sacked',
          label: 'Sacked',
          color: getColor('sacked'),
        },
      ])}
      height={height}
      grid={{ horizontal: true }}
      slotProps={{
        tooltip: { trigger: 'axis' },
        ...legendSlotProps,
      }}
    />
  )
}
