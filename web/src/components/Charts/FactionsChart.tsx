import * as React from 'react'
import { LineChart } from '@mui/x-charts/LineChart'
import type { GameState } from '../../lib/model/gameStateModel'
import { getFactionName } from '../../lib/model_utils/factionUtils'
import { axisConfig, formatTurn, legendSlotProps, withNoMarkers, Y_AXIS_WIDTH } from './chartsUtils'

// Color palette for factions with different metrics
// Each faction gets a distinct hue, with suppression as solid, offensive as dashed pattern
function getFactionSuppressionColor(factionName: string): string {
  switch (factionName) {
    case 'Red Dawn':
      return 'hsla(0, 70%, 50%, 1)' // red
    case 'Exalt':
      return 'hsla(45, 85%, 50%, 1)' // gold
    case 'Black Lotus':
      return 'hsla(270, 60%, 50%, 1)' // purple
    default:
      return 'hsla(200, 60%, 50%, 1)' // blue fallback
  }
}

function getFactionDefensiveColor(factionName: string): string {
  switch (factionName) {
    case 'Red Dawn':
      return 'hsla(0, 70%, 70%, 1)' // light red
    case 'Exalt':
      return 'hsla(45, 85%, 70%, 1)' // light gold
    case 'Black Lotus':
      return 'hsla(270, 60%, 70%, 1)' // light purple
    default:
      return 'hsla(200, 60%, 70%, 1)' // light blue fallback
  }
}

function getFactionOffensiveColor(factionName: string): string {
  switch (factionName) {
    case 'Red Dawn':
      return 'hsla(0, 70%, 35%, 1)' // dark red
    case 'Exalt':
      return 'hsla(45, 85%, 35%, 1)' // dark gold
    case 'Black Lotus':
      return 'hsla(270, 60%, 35%, 1)' // dark purple
    default:
      return 'hsla(200, 60%, 35%, 1)' // dark blue fallback
  }
}

export type FactionsDatasetRow = {
  [key: string]: number // Dynamic keys for each faction metric
  turn: number
}

type FactionsChartProps = {
  gameStates: GameState[]
  height: number
}

function buildFactionsDataset(gameStates: GameState[]): {
  dataset: FactionsDatasetRow[]
  factionNames: string[]
} {
  // Track cumulative missions by faction
  const cumulativeMissions: Record<string, { defensive: number; offensive: number }> = {}
  const factionNamesSet = new Set<string>()

  // First pass: collect all faction names
  for (const gameState of gameStates) {
    for (const faction of gameState.factions) {
      const name = getFactionName(faction)
      factionNamesSet.add(name)
      cumulativeMissions[name] ??= { defensive: 0, offensive: 0 }
    }
  }

  const factionNames = [...factionNamesSet]

  const dataset = gameStates.map((gameState) => {
    const row: FactionsDatasetRow = { turn: gameState.turn }

    // Count missions completed this turn from turn report
    const report = gameState.turnStartReport
    if (report) {
      for (const missionReport of report.missions) {
        // Find the mission in game state to get faction info
        const mission = gameState.missions.find((m) => m.id === missionReport.missionId)
        if (mission) {
          // Get faction name from mission
          const faction = gameState.factions.find((f) => {
            // Match faction by checking if mission's missionDataId contains faction id
            const facId = f.factionDataId.replace('factiondata-', '')
            return mission.missionDataId.includes(facId)
          })
          if (faction) {
            const factionName = getFactionName(faction)
            const metrics = cumulativeMissions[factionName]
            if (metrics) {
              if (mission.operationLevel !== undefined) {
                metrics.defensive += 1
              } else {
                metrics.offensive += 1
              }
            }
          }
        }
      }
    }

    // Add faction metrics to row
    for (const name of factionNames) {
      const faction = gameState.factions.find((f) => getFactionName(f) === name)
      const suppression = faction?.suppressionTurns ?? 0
      const missions = cumulativeMissions[name] ?? { defensive: 0, offensive: 0 }

      row[`${name}_suppression`] = suppression
      row[`${name}_defensive`] = missions.defensive
      row[`${name}_offensive`] = missions.offensive
    }

    return row
  })

  return { dataset, factionNames }
}

export function FactionsChart(props: FactionsChartProps): React.JSX.Element {
  const { gameStates, height } = props
  const { dataset, factionNames } = buildFactionsDataset(gameStates)

  // Build series for each faction
  const series = factionNames.flatMap((name) => [
    {
      dataKey: `${name}_suppression`,
      label: `${name} Suppression`,
      color: getFactionSuppressionColor(name),
    },
    {
      dataKey: `${name}_defensive`,
      label: `${name} Defensive`,
      color: getFactionDefensiveColor(name),
    },
    {
      dataKey: `${name}_offensive`,
      label: `${name} Offensive`,
      color: getFactionOffensiveColor(name),
    },
  ])

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
      series={withNoMarkers(series)}
      height={height}
      grid={{ horizontal: true }}
      slotProps={{
        tooltip: { trigger: 'axis' },
        ...legendSlotProps,
      }}
    />
  )
}
