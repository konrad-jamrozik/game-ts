import * as React from 'react'
import { LineChart, lineElementClasses } from '@mui/x-charts/LineChart'
import type { GameState } from '../../lib/model/gameStateModel'
import { ENEMY_TYPES, type EnemyType } from '../../lib/model/enemyModel'
import { axisConfig, formatTurn, legendSlotProps, withNoMarkers, Y_AXIS_WIDTH } from './chartsUtils'

// Enemy type colors: gradient from green through yellow, orange, red, purple to blue
// This creates a pleasant visual progression across all enemy types
function getColorForEnemyType(enemyType: EnemyType): string {
  switch (enemyType) {
    case 'initiate':
      return 'hsla(120, 60%, 45%, 1)' // green
    case 'operative':
      return 'hsla(80, 65%, 45%, 1)' // yellow-green
    case 'handler':
      return 'hsla(50, 80%, 50%, 1)' // yellow
    case 'soldier':
      return 'hsla(35, 85%, 50%, 1)' // orange
    case 'lieutenant':
      return 'hsla(15, 80%, 50%, 1)' // red-orange
    case 'elite':
      return 'hsla(0, 70%, 50%, 1)' // red
    case 'commander':
      return 'hsla(320, 60%, 50%, 1)' // magenta
    case 'highCommander':
      return 'hsla(280, 60%, 50%, 1)' // purple
    case 'cultLeader':
      return 'hsla(220, 70%, 55%, 1)' // blue
  }
}

function getEnemyTypeLabel(enemyType: EnemyType): string {
  switch (enemyType) {
    case 'initiate':
      return 'Initiate'
    case 'operative':
      return 'Operative'
    case 'handler':
      return 'Handler'
    case 'soldier':
      return 'Soldier'
    case 'lieutenant':
      return 'Lieutenant'
    case 'elite':
      return 'Elite'
    case 'commander':
      return 'Commander'
    case 'highCommander':
      return 'High Commander'
    case 'cultLeader':
      return 'Cult Leader'
  }
}

export type EnemiesKilledDatasetRow = {
  turn: number
} & Record<EnemyType, number>

type EnemiesKilledChartProps = {
  gameStates: GameState[]
  height: number
}

function buildEnemiesKilledDataset(gameStates: GameState[]): EnemiesKilledDatasetRow[] {
  // Track cumulative kills by enemy type
  const cumulativeKills: Record<EnemyType, number> = {
    initiate: 0,
    operative: 0,
    handler: 0,
    soldier: 0,
    lieutenant: 0,
    elite: 0,
    commander: 0,
    highCommander: 0,
    cultLeader: 0,
  }

  return gameStates.map((gameState) => {
    const report = gameState.turnStartReport
    if (report) {
      for (const missionReport of report.missions) {
        // Count kills by enemy type from attack logs
        for (const attackLog of missionReport.battleStats.attackLogs) {
          // Agent killed an enemy (attackerType === 'Agent' and defender HP <= 0)
          if (attackLog.attackerType === 'Agent' && attackLog.defenderHpAfterDamage <= 0) {
            cumulativeKills[attackLog.enemyType] += 1
          }
        }
      }
    }

    return {
      turn: gameState.turn,
      ...cumulativeKills,
    }
  })
}

export function EnemiesKilledChart(props: EnemiesKilledChartProps): React.JSX.Element {
  const { gameStates, height } = props
  const dataset = buildEnemiesKilledDataset(gameStates)

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
      series={withNoMarkers(
        ENEMY_TYPES.map((enemyType) => ({
          dataKey: enemyType,
          label: getEnemyTypeLabel(enemyType),
          stack: 'kills',
          area: true,
          color: getColorForEnemyType(enemyType),
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
