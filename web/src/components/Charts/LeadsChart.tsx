import * as React from 'react'
import { LineChart } from '@mui/x-charts/LineChart'
import type { GameState } from '../../lib/model/gameStateModel'
import { dataTables } from '../../lib/data_tables/dataTables'
import { axisConfig, formatTurn, legendSlotProps, withNoMarkers, Y_AXIS_WIDTH } from './chartsUtils'

// Leads chart colors
type LeadsColorName = 'nonRepeatable' | 'repeatable' | 'maxTime'

function getColor(name: LeadsColorName): string {
  switch (name) {
    case 'nonRepeatable':
      return 'hsla(200, 70%, 50%, 1)' // blue
    case 'repeatable':
      return 'hsla(120, 60%, 45%, 1)' // green
    case 'maxTime':
      return 'hsla(30, 85%, 50%, 1)' // orange
  }
}

export type LeadsDatasetRow = {
  turn: number
  nonRepeatableCompleted: number
  repeatableCompleted: number
  maxCompletionTime: number
}

type LeadsChartProps = {
  gameStates: GameState[]
  height: number
}

function buildLeadsDataset(gameStates: GameState[]): LeadsDatasetRow[] {
  // Build a map of lead ID to whether it's repeatable
  const leadRepeatableMap = new Map<string, boolean>()
  for (const lead of dataTables.leads) {
    leadRepeatableMap.set(lead.id, lead.repeatable)
  }

  // Track completed investigations for max time calculation (last 20 turns)
  const completedInvestigations: { startTurn: number; completionTurn: number }[] = []

  return gameStates.map((gameState) => {
    // Use leadInvestigationCounts from game state - this tracks ALL completed investigations
    // For repeatable leads: sum up all investigation counts
    // For non-repeatable leads: count distinct leads completed (they can only be completed once)
    let nonRepeatableCompleted = 0
    let repeatableCompleted = 0

    for (const [leadId, count] of Object.entries(gameState.leadInvestigationCounts)) {
      const isRepeatable = leadRepeatableMap.get(leadId) ?? false
      if (isRepeatable) {
        // Sum all investigations of repeatable leads
        repeatableCompleted += count
      } else if (count > 0) {
        // Non-repeatable leads can only be completed once, so count > 0 means completed
        nonRepeatableCompleted += 1
      }
    }

    // Track completion times from turn report for max time calculation
    const report = gameState.turnStartReport
    if (report && report.leadInvestigations) {
      for (const investigationReport of report.leadInvestigations) {
        if (investigationReport.completed && investigationReport.completionTurn !== undefined) {
          completedInvestigations.push({
            startTurn: investigationReport.startTurn,
            completionTurn: investigationReport.completionTurn,
          })
        }
      }
    }

    // Calculate max completion time for investigations completed in the last 20 turns
    const recentInvestigations = completedInvestigations.filter(
      (inv) => inv.completionTurn > gameState.turn - 20 && inv.completionTurn <= gameState.turn,
    )
    const maxCompletionTime =
      recentInvestigations.length > 0
        ? Math.max(...recentInvestigations.map((inv) => inv.completionTurn - inv.startTurn))
        : 0

    return {
      turn: gameState.turn,
      nonRepeatableCompleted,
      repeatableCompleted,
      maxCompletionTime,
    }
  })
}

export function LeadsChart(props: LeadsChartProps): React.JSX.Element {
  const { gameStates, height } = props
  const dataset = buildLeadsDataset(gameStates)

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
          dataKey: 'nonRepeatableCompleted',
          label: 'Non-repeatable leads completed',
          color: getColor('nonRepeatable'),
        },
        {
          dataKey: 'repeatableCompleted',
          label: 'Repeatable investigations completed',
          color: getColor('repeatable'),
        },
        {
          dataKey: 'maxCompletionTime',
          label: 'Max completion time (last 20 turns)',
          color: getColor('maxTime'),
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
