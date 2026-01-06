import * as React from 'react'
import { LineChart, lineElementClasses } from '@mui/x-charts/LineChart'
import type { GameState } from '../../lib/model/gameStateModel'
import { toF } from '../../lib/primitives/fixed6'
import { axisConfig, formatTurn, legendSlotProps, withNoMarkers, Y_AXIS_WIDTH } from './chartsUtils'

// Faction colors for panic contributions
function getFactionColor(factionName: string): string {
  switch (factionName) {
    case 'Red Dawn':
      return 'hsla(0, 70%, 50%, 1)' // red
    case 'Exalt':
      return 'hsla(45, 85%, 50%, 1)' // gold/amber
    case 'Black Lotus':
      return 'hsla(270, 60%, 45%, 1)' // purple
    default:
      return 'hsla(200, 60%, 50%, 1)' // blue (fallback)
  }
}

export type PanicDatasetRow = {
  turn: number
  totalPanic: number
  [factionName: string]: number
}

type PanicChartProps = {
  gameStates: GameState[]
  height: number
}

function buildPanicDataset(gameStates: GameState[]): {
  dataset: PanicDatasetRow[]
  factionNames: string[]
} {
  // Track cumulative panic contributions by faction
  const cumulativePanicByFaction: Record<string, number> = {}
  const factionNamesSet = new Set<string>()

  const dataset = gameStates.map((gameState) => {
    const report = gameState.turnStartReport
    if (report) {
      // Add panic from faction operations
      for (const penalty of report.panic.breakdown.factionOperationPenalties) {
        const factionName = penalty.factionName
        factionNamesSet.add(factionName)
        const panicIncrease = toF(penalty.panicIncrease) * 100 // Convert to percentage
        cumulativePanicByFaction[factionName] = (cumulativePanicByFaction[factionName] ?? 0) + panicIncrease
      }
    }

    // Current total panic from game state (as percentage)
    const totalPanic = toF(gameState.panic) * 100

    const row: PanicDatasetRow = {
      turn: gameState.turn,
      totalPanic,
    }

    // Add faction contributions
    for (const factionName of factionNamesSet) {
      row[factionName] = cumulativePanicByFaction[factionName] ?? 0
    }

    return row
  })

  return {
    dataset,
    factionNames: [...factionNamesSet],
  }
}

export function PanicChart(props: PanicChartProps): React.JSX.Element {
  const { gameStates, height } = props
  const { dataset, factionNames } = buildPanicDataset(gameStates)

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
          valueFormatter: (value: number | null): string => (value === null ? '' : `${value.toFixed(1)}%`),
        },
      ]}
      series={withNoMarkers(
        factionNames.map((factionName) => ({
          dataKey: factionName,
          label: factionName,
          stack: 'panic',
          area: true,
          color: getFactionColor(factionName),
        })),
      )}
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
