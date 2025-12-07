import type { GridColDef, GridRenderCellParams } from '@mui/x-data-grid'
import * as React from 'react'
import {
  BATTLE_LOG_AGENT_COUNT_WIDTH,
  BATTLE_LOG_AGENT_HP_WIDTH,
  BATTLE_LOG_AGENT_SKILL_WIDTH,
  BATTLE_LOG_ENEMY_COUNT_WIDTH,
  BATTLE_LOG_ENEMY_HP_WIDTH,
  BATTLE_LOG_ENEMY_SKILL_WIDTH,
  BATTLE_LOG_ROUND_NUMBER_WIDTH,
  BATTLE_LOG_SKILL_RATIO_WIDTH,
  BATTLE_LOG_STATUS_WIDTH,
} from '../Common/columnWidths'
import { MyChip } from '../Common/MyChip'
import { f6fmtInt, f6fmtPctDec0, type Fixed6 } from '../../lib/primitives/fixed6'
import { fmtPctDec0 } from '../../lib/primitives/formatPrimitives'

export type BattleLogRow = {
  id: number
  roundNumber: number
  status: 'Ongoing' | 'Retreated' | 'Won' | 'Lost'
  agentCount: number
  agentCountTotal: number
  agentSkill: Fixed6
  agentSkillTotal: Fixed6
  agentHp: number
  agentHpTotal: number
  enemyCount: number
  enemyCountTotal: number
  enemySkill: Fixed6
  enemySkillTotal: Fixed6
  enemyHp: number
  enemyHpTotal: number
  skillRatio: Fixed6
}

export function getBattleLogColumns(): GridColDef<BattleLogRow>[] {
  const columns: GridColDef<BattleLogRow>[] = [
    {
      field: 'roundNumber',
      headerName: 'R',
      width: BATTLE_LOG_ROUND_NUMBER_WIDTH,
      type: 'number',
    },
    {
      field: 'status',
      headerName: 'Status',
      width: BATTLE_LOG_STATUS_WIDTH,
      renderCell: (params: GridRenderCellParams<BattleLogRow>): React.JSX.Element => (
        <MyChip chipValue={params.row.status} />
      ),
    },
    {
      field: 'agentCount',
      headerName: 'Agents',
      width: BATTLE_LOG_AGENT_COUNT_WIDTH,
      renderCell: (params: GridRenderCellParams<BattleLogRow>): React.JSX.Element => (
        <span>
          {params.row.agentCount}/{params.row.agentCountTotal}
        </span>
      ),
    },
    {
      field: 'agentSkill',
      headerName: 'Agent Skill',
      width: BATTLE_LOG_AGENT_SKILL_WIDTH,
      renderCell: (params: GridRenderCellParams<BattleLogRow, Fixed6>): React.JSX.Element => {
        const skillPct = f6fmtPctDec0(params.row.agentSkill, params.row.agentSkillTotal)
        return (
          <span>
            {f6fmtInt(params.row.agentSkill)}/{f6fmtInt(params.row.agentSkillTotal)} ({skillPct})
          </span>
        )
      },
    },
    {
      field: 'agentHp',
      headerName: 'Agent HP',
      width: BATTLE_LOG_AGENT_HP_WIDTH,
      renderCell: (params: GridRenderCellParams<BattleLogRow>): React.JSX.Element => {
        const hpPct = fmtPctDec0(params.row.agentHp, params.row.agentHpTotal)
        return (
          <span>
            {Math.round(params.row.agentHp)}/{params.row.agentHpTotal} ({hpPct})
          </span>
        )
      },
    },
    {
      field: 'enemyCount',
      headerName: 'Enem.',
      width: BATTLE_LOG_ENEMY_COUNT_WIDTH,
      renderCell: (params: GridRenderCellParams<BattleLogRow>): React.JSX.Element => (
        <span>
          {params.row.enemyCount}/{params.row.enemyCountTotal}
        </span>
      ),
    },
    {
      field: 'enemySkill',
      headerName: 'Enemy Skill',
      width: BATTLE_LOG_ENEMY_SKILL_WIDTH,
      renderCell: (params: GridRenderCellParams<BattleLogRow, Fixed6>): React.JSX.Element => {
        const skillPct = f6fmtPctDec0(params.row.enemySkill, params.row.enemySkillTotal)
        return (
          <span>
            {f6fmtInt(params.row.enemySkill)}/{f6fmtInt(params.row.enemySkillTotal)} ({skillPct})
          </span>
        )
      },
    },
    {
      field: 'enemyHp',
      headerName: 'Enemy HP',
      width: BATTLE_LOG_ENEMY_HP_WIDTH,
      renderCell: (params: GridRenderCellParams<BattleLogRow>): React.JSX.Element => {
        const hpPct = fmtPctDec0(params.row.enemyHp, params.row.enemyHpTotal)
        return (
          <span>
            {Math.round(params.row.enemyHp)}/{params.row.enemyHpTotal} ({hpPct})
          </span>
        )
      },
    },
    {
      field: 'skillRatio',
      headerName: 'Ratio',
      width: BATTLE_LOG_SKILL_RATIO_WIDTH,
      renderCell: (params: GridRenderCellParams<BattleLogRow, Fixed6>): React.JSX.Element => (
        <span>{f6fmtPctDec0(params.row.skillRatio)}</span>
      ),
    },
  ]

  return columns
}
