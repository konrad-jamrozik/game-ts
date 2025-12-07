import type { GridColDef, GridRenderCellParams } from '@mui/x-data-grid'
import * as React from 'react'
import {
  COMBAT_LOG_AGENT_ID_WIDTH,
  COMBAT_LOG_ATTACKER_SKILL_WIDTH,
  COMBAT_LOG_ATTACKER_TYPE_WIDTH,
  COMBAT_LOG_ATTACK_ID_WIDTH,
  COMBAT_LOG_DAMAGE_WIDTH,
  COMBAT_LOG_DEFENDER_HP_WIDTH,
  COMBAT_LOG_DEFENDER_SKILL_WIDTH,
  COMBAT_LOG_ENEMY_ID_WIDTH,
  COMBAT_LOG_OUTCOME_WIDTH,
  COMBAT_LOG_ROLL_WIDTH,
  COMBAT_LOG_ROUND_NUMBER_WIDTH,
  COMBAT_LOG_THRESHOLD_WIDTH,
} from '../Common/columnWidths'
import { f6fmtInt, f6fmtPctDec0, type Fixed6 } from '../../lib/primitives/fixed6'
import { fmtDec1, fmtDec2, fmtInt, fmtNoPrefix, fmtPctDec0 } from '../../lib/primitives/formatPrimitives'

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
  outcome: 'Hit' | 'Miss' | 'Terminate'
  damage: number | undefined
  damageMin: number
  damageMax: number
  defenderHp: number
  defenderHpMax: number
}

export function getCombatLogColumns(): GridColDef<CombatLogRow>[] {
  const columns: GridColDef<CombatLogRow>[] = [
    {
      field: 'attackId',
      headerName: 'ID',
      width: COMBAT_LOG_ATTACK_ID_WIDTH,
      type: 'number',
    },
    {
      field: 'roundNumber',
      headerName: 'R',
      width: COMBAT_LOG_ROUND_NUMBER_WIDTH,
      type: 'number',
    },
    {
      field: 'agentId',
      headerName: 'Agent',
      width: COMBAT_LOG_AGENT_ID_WIDTH,
      renderCell: (params: GridRenderCellParams<CombatLogRow>): React.JSX.Element => {
        const isDefenderDead = params.row.attackerType === 'Enemy' && params.row.defenderHp <= 0
        return <span style={{ color: isDefenderDead ? 'hsl(4, 90%, 58%)' : undefined }}>{params.row.agentId}</span>
      },
    },
    {
      field: 'enemyId',
      headerName: 'Enemy',
      width: COMBAT_LOG_ENEMY_ID_WIDTH,
      renderCell: (params: GridRenderCellParams<CombatLogRow>): React.JSX.Element => {
        const isDefenderDead = params.row.attackerType === 'Agent' && params.row.defenderHp <= 0
        return (
          <span style={{ color: isDefenderDead ? 'hsl(4, 90%, 58%)' : undefined }}>
            {fmtNoPrefix(params.row.enemyId, 'enemy-')}
          </span>
        )
      },
    },
    {
      field: 'attackerType',
      headerName: 'Attacker',
      width: COMBAT_LOG_ATTACKER_TYPE_WIDTH,
    },
    {
      field: 'outcome',
      headerName: 'Outcome',
      width: COMBAT_LOG_OUTCOME_WIDTH,
    },
    {
      field: 'attackerSkill',
      headerName: 'Att Skill',
      width: COMBAT_LOG_ATTACKER_SKILL_WIDTH,
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
      width: COMBAT_LOG_DEFENDER_SKILL_WIDTH,
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
      width: COMBAT_LOG_ROLL_WIDTH,
      renderCell: (params: GridRenderCellParams<CombatLogRow>): React.JSX.Element => (
        <span>{fmtDec2(params.row.roll)}%</span>
      ),
    },
    {
      field: 'threshold',
      headerName: '> Threshold',
      width: COMBAT_LOG_THRESHOLD_WIDTH,
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
      width: COMBAT_LOG_DAMAGE_WIDTH,
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
      width: COMBAT_LOG_DEFENDER_HP_WIDTH,
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
