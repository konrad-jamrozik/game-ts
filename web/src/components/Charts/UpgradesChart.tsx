import * as React from 'react'
import { LineChart } from '@mui/x-charts/LineChart'
import type { GameState } from '../../lib/model/gameStateModel'
import { toF } from '../../lib/primitives/fixed6'
import { axisConfig, formatTurn, legendSlotProps, withNoMarkers, Y_AXIS_WIDTH } from './chartsUtils'

// Upgrade colors:
// Left Y axis (absolute values): hit points (red), weapon damage (orange)
// Right Y axis (percentages): training skill gain (dark green), exhaustion recovery (yellow), HP recovery (dark red)
type UpgradeColorName = 'hitPoints' | 'weaponDamage' | 'trainingSkillGain' | 'exhaustionRecovery' | 'hpRecovery'

function getColor(name: UpgradeColorName): string {
  switch (name) {
    case 'hitPoints':
      return 'hsla(0, 70%, 50%, 1)' // red
    case 'weaponDamage':
      return 'hsla(30, 85%, 50%, 1)' // orange
    case 'trainingSkillGain':
      return 'hsla(120, 60%, 35%, 1)' // dark green
    case 'exhaustionRecovery':
      return 'hsla(50, 90%, 50%, 1)' // yellow
    case 'hpRecovery':
      return 'hsla(0, 70%, 35%, 1)' // dark red
  }
}

export type UpgradesDatasetRow = {
  turn: number
  hitPoints: number
  weaponDamage: number
  trainingSkillGain: number
  exhaustionRecovery: number
  hpRecovery: number
}

type UpgradesChartProps = {
  gameStates: GameState[]
  height: number
}

function bldUpgradesRow(gameState: GameState): UpgradesDatasetRow {
  return {
    turn: gameState.turn,
    hitPoints: gameState.agentMaxHitPoints,
    weaponDamage: gameState.weaponDamage,
    trainingSkillGain: toF(gameState.trainingSkillGain),
    exhaustionRecovery: toF(gameState.exhaustionRecovery),
    hpRecovery: toF(gameState.hitPointsRecoveryPct),
  }
}

function buildUpgradesDataset(gameStates: GameState[]): UpgradesDatasetRow[] {
  return gameStates.map((gameState) => bldUpgradesRow(gameState))
}

export function UpgradesChart(props: UpgradesChartProps): React.JSX.Element {
  const { gameStates, height } = props
  const dataset = buildUpgradesDataset(gameStates)

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
          id: 'leftAxis',
          label: 'HP / Damage',
          ...axisConfig,
          width: Y_AXIS_WIDTH,
        },
        {
          id: 'rightAxis',
          label: 'Skill / Recovery %',
          position: 'right',
          ...axisConfig,
          width: Y_AXIS_WIDTH,
        },
      ]}
      series={withNoMarkers([
        {
          dataKey: 'hitPoints',
          label: 'Hit points',
          color: getColor('hitPoints'),
          yAxisId: 'leftAxis',
        },
        {
          dataKey: 'weaponDamage',
          label: 'Weapon damage',
          color: getColor('weaponDamage'),
          yAxisId: 'leftAxis',
        },
        {
          dataKey: 'trainingSkillGain',
          label: 'Training skill gain',
          color: getColor('trainingSkillGain'),
          yAxisId: 'rightAxis',
        },
        {
          dataKey: 'exhaustionRecovery',
          label: 'Exhaustion recovery %',
          color: getColor('exhaustionRecovery'),
          yAxisId: 'rightAxis',
        },
        {
          dataKey: 'hpRecovery',
          label: 'HP recovery %',
          color: getColor('hpRecovery'),
          yAxisId: 'rightAxis',
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
