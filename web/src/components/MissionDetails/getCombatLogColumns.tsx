import type { GridColDef, GridRenderCellParams } from '@mui/x-data-grid'
import * as React from 'react'
import { columnWidths } from '../Common/columnWidths'
import { f6fmtInt, f6fmtPctDec0, type Fixed6 } from '../../lib/primitives/fixed6'
import { fmtDec1, fmtDec2, fmtInt, fmtNoPrefix, fmtPctDec0 } from '../../lib/primitives/formatPrimitives'
import { createFixed6SortComparator } from '../Common/dataGridSortUtils'

export type CombatLogRow = {
  id: number
  attackId: number
  roundNumber: number
  agentId: string
  enemyId: string
  attackerType: 'Agent' | 'Enemy'
  attackerSkill: Fixed6
  attackerSkillAtStart: Fixed6
  defenderSkill: Fixed6
  defenderSkillAtStart: Fixed6
  roll: number
  threshold: number
  outcome: 'Hit' | 'Miss' | 'Terminated'
  damage: number | undefined
  damageMin: number
  damageMax: number
  defenderHp: number
  defenderHpMax: number
}

export function getCombatLogColumns(rows: CombatLogRow[]): GridColDef<CombatLogRow>[] {
  const columns: GridColDef<CombatLogRow>[] = [
    {
      field: 'attackId',
      headerName: 'ID',
      width: columnWidths['combat_log.attack_id'],
      type: 'number',
    },
    {
      field: 'roundNumber',
      headerName: 'R',
      width: columnWidths['combat_log.round_number'],
      type: 'number',
    },
    {
      field: 'agentId',
      headerName: 'Agent',
      width: columnWidths['combat_log.agent_id'],
      renderCell: (params: GridRenderCellParams<CombatLogRow>): React.JSX.Element => {
        const isDefenderDead = params.row.attackerType === 'Enemy' && params.row.defenderHp <= 0
        return <span style={{ color: isDefenderDead ? 'hsl(4, 90%, 58%)' : undefined }}>{params.row.agentId}</span>
      },
    },
    {
      field: 'enemyId',
      headerName: 'Enemy',
      width: columnWidths['combat_log.enemy_id'],
      valueGetter: (_value, row: CombatLogRow): string => fmtNoPrefix(row.enemyId, 'enemy-'),
      renderCell: (params: GridRenderCellParams<CombatLogRow, string>): React.JSX.Element => {
        const isDefenderDead = params.row.attackerType === 'Agent' && params.row.defenderHp <= 0
        const displayValue = params.value ?? ''
        return <span style={{ color: isDefenderDead ? 'hsl(4, 90%, 58%)' : undefined }}>{displayValue}</span>
      },
    },
    {
      field: 'attackerType',
      headerName: 'Attacker',
      width: columnWidths['combat_log.attacker_type'],
    },
    {
      field: 'outcome',
      headerName: 'Outcome',
      width: columnWidths['combat_log.outcome'],
    },
    {
      field: 'attackerSkill',
      headerName: 'Att Skill',
      width: columnWidths['combat_log.attacker_skill'],
      sortComparator: createFixed6SortComparator(
        rows,
        (row) => row.attackerSkill,
        (row) => row.attackerSkillAtStart,
      ),
      renderCell: (params: GridRenderCellParams<CombatLogRow, Fixed6>): React.JSX.Element => {
        const skillPct = f6fmtPctDec0(params.row.attackerSkill, params.row.attackerSkillAtStart)
        return (
          <span>
            {f6fmtInt(params.row.attackerSkill)}/{f6fmtInt(params.row.attackerSkillAtStart)} ({skillPct})
          </span>
        )
      },
    },
    {
      field: 'defenderSkill',
      headerName: 'Def Skill',
      width: columnWidths['combat_log.defender_skill'],
      sortComparator: createFixed6SortComparator(
        rows,
        (row) => row.defenderSkill,
        (row) => row.defenderSkillAtStart,
      ),
      renderCell: (params: GridRenderCellParams<CombatLogRow, Fixed6>): React.JSX.Element => {
        const skillPct = f6fmtPctDec0(params.row.defenderSkill, params.row.defenderSkillAtStart)
        return (
          <span>
            {f6fmtInt(params.row.defenderSkill)}/{f6fmtInt(params.row.defenderSkillAtStart)} ({skillPct})
          </span>
        )
      },
    },
    {
      field: 'roll',
      headerName: 'Att Roll',
      width: columnWidths['combat_log.roll'],
      renderCell: (params: GridRenderCellParams<CombatLogRow>): React.JSX.Element => (
        <span>{fmtDec2(params.row.roll)}%</span>
      ),
    },
    {
      field: 'threshold',
      headerName: '> Threshold',
      width: columnWidths['combat_log.threshold'],
      renderCell: (params: GridRenderCellParams<CombatLogRow>): React.JSX.Element => {
        const exceeded = params.row.roll > params.row.threshold
        return (
          <span style={{ color: exceeded ? 'hsl(122, 39%, 49%)' : 'hsl(4, 90%, 58%)' }}>
            {exceeded ? '✅' : '❌'} {fmtDec2(params.row.threshold)}%
          </span>
        )
      },
    },
    {
      field: 'damage',
      headerName: 'Damage',
      width: columnWidths['combat_log.damage'],
      renderCell: (params: GridRenderCellParams<CombatLogRow>): React.JSX.Element => {
        if (params.row.damage === undefined) {
          return <span>-</span>
        }
        const damageRangePct =
          params.row.damageMax === params.row.damageMin
            ? 50
            : ((params.row.damage - params.row.damageMin) / (params.row.damageMax - params.row.damageMin)) * 100
        const damagePct = Math.round(50 + damageRangePct)
        const damageAverage = (params.row.damageMin + params.row.damageMax) / 2
        const damageAverageFormatted = Number.isInteger(damageAverage) ? fmtInt(damageAverage) : fmtDec1(damageAverage)
        return (
          <span>
            {params.row.damage} ({params.row.damageMin}-{params.row.damageMax}, {damagePct}% of {damageAverageFormatted}
            )
          </span>
        )
      },
    },
    {
      field: 'defenderHp',
      headerName: 'HP',
      width: columnWidths['combat_log.defender_hp'],
      renderCell: (params: GridRenderCellParams<CombatLogRow>): React.JSX.Element => {
        const hpPct = fmtPctDec0(params.row.defenderHp, params.row.defenderHpMax)
        const isZeroOrLess = params.row.defenderHp <= 0
        return (
          <span style={{ color: isZeroOrLess ? 'hsl(4, 90%, 58%)' : undefined }}>
            {Math.round(params.row.defenderHp)}/{params.row.defenderHpMax} ({hpPct})
          </span>
        )
      },
    },
  ]

  return columns
}
