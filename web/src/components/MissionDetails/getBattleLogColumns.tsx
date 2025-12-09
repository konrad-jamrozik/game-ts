import type { GridColDef, GridRenderCellParams } from '@mui/x-data-grid'
import * as React from 'react'
import { columnWidths } from '../Common/columnWidths'
import { MyChip } from '../Common/MyChip'
import { f6fmtInt, f6fmtPctDec0, type Fixed6 } from '../../lib/primitives/fixed6'
import { fmtPctDec0 } from '../../lib/primitives/formatPrimitives'
import { createFixed6SortComparator } from '../Common/dataGridSortUtils'
import type { BattleStatus } from '../../lib/model/outcomeTypes'

export type BattleLogRow = {
  id: number
  roundNumber: number
  status: BattleStatus
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

export function getBattleLogColumns(rows: BattleLogRow[]): GridColDef<BattleLogRow>[] {
  const columns: GridColDef<BattleLogRow>[] = [
    {
      field: 'roundNumber',
      headerName: 'R',
      width: columnWidths['battle_log.round_number'],
      type: 'number',
    },
    {
      field: 'status',
      headerName: 'Status',
      width: columnWidths['battle_log.status'],
      renderCell: (params: GridRenderCellParams<BattleLogRow>): React.JSX.Element => (
        <MyChip chipValue={params.row.status} />
      ),
    },
    {
      field: 'agentCount',
      headerName: 'Agents',
      width: columnWidths['battle_log.agent_count'],
      renderCell: (params: GridRenderCellParams<BattleLogRow>): React.JSX.Element => (
        <span>
          {params.row.agentCount}/{params.row.agentCountTotal}
        </span>
      ),
    },
    {
      field: 'agentSkill',
      headerName: 'Agent Skill',
      width: columnWidths['battle_log.agent_skill'],
      sortComparator: createFixed6SortComparator(
        rows,
        (row) => row.agentSkill,
        (row) => row.agentSkillTotal,
      ),
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
      width: columnWidths['battle_log.agent_hp'],
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
      width: columnWidths['battle_log.enemy_count'],
      renderCell: (params: GridRenderCellParams<BattleLogRow>): React.JSX.Element => (
        <span>
          {params.row.enemyCount}/{params.row.enemyCountTotal}
        </span>
      ),
    },
    {
      field: 'enemySkill',
      headerName: 'Enemy Skill',
      width: columnWidths['battle_log.enemy_skill'],
      sortComparator: createFixed6SortComparator(
        rows,
        (row) => row.enemySkill,
        (row) => row.enemySkillTotal,
      ),
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
      width: columnWidths['battle_log.enemy_hp'],
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
      width: columnWidths['battle_log.skill_ratio'],
      renderCell: (params: GridRenderCellParams<BattleLogRow, Fixed6>): React.JSX.Element => (
        <span>{f6fmtPctDec0(params.row.skillRatio)}</span>
      ),
    },
  ]

  return columns
}
