import type { GridColDef, GridRenderCellParams } from '@mui/x-data-grid'
import * as React from 'react'
import Box from '@mui/material/Box'
import { columnWidths } from '../Common/columnWidths'
import { f6fmtInt, type Fixed6 } from '../../lib/primitives/fixed6'
import { fmtDec2, fmtNoPrefix, fmtPctDec0 } from '../../lib/primitives/formatPrimitives'
import { createFixed6SortComparator } from '../Common/dataGridSortUtils'
import type { AttackOutcome } from '../../lib/model/outcomeTypes'

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
  defenderSkillAfterAttack: Fixed6
  roll: number
  threshold: number
  outcome: AttackOutcome
  damage: number | undefined
  baseDamage: number
  damageMin: number
  damageMax: number
  defenderHpAfterDamage: number
  defenderHpMax: number
}

type GetCombatLogColumnsParams = {
  rows: CombatLogRow[]
  combatMaxSkill: Fixed6
}

export function getCombatLogColumns({ rows, combatMaxSkill }: GetCombatLogColumnsParams): GridColDef<CombatLogRow>[] {
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
        const isDefender = params.row.attackerType === 'Enemy'
        const color = getDefenderColor(params.row.outcome, isDefender)
        return <span style={{ color }}>{params.row.agentId}</span>
      },
    },
    {
      field: 'enemyId',
      headerName: 'Enemy',
      width: columnWidths['combat_log.enemy_id'],
      valueGetter: (_value, row: CombatLogRow): string => fmtNoPrefix(row.enemyId, 'enemy-'),
      renderCell: (params: GridRenderCellParams<CombatLogRow, string>): React.JSX.Element => {
        const isDefender = params.row.attackerType === 'Agent'
        const color = getDefenderColor(params.row.outcome, isDefender)
        const displayValue = params.value ?? ''
        return <span style={{ color }}>{displayValue}</span>
      },
    },
    {
      field: 'attackerType',
      headerName: 'Attacker',
      width: columnWidths['combat_log.attacker_type'],
    },
    {
      field: 'outcome',
      headerName: 'Effect',
      width: columnWidths['combat_log.effect'],
      renderCell: (params: GridRenderCellParams<CombatLogRow>): React.JSX.Element => {
        const displayValue = params.row.outcome === 'Incapacitated' ? 'Incap' : params.row.outcome
        return <span>{displayValue}</span>
      },
    },
    {
      field: 'attackerSkill',
      headerName: 'Att Skill',
      width: columnWidths['combat_log.attacker_skill'],
      cellClassName: 'combat-log-skill-cell',
      sortComparator: createFixed6SortComparator(
        rows,
        (row) => row.attackerSkill,
        (row) => row.attackerSkillAtStart,
      ),
      renderCell: (params: GridRenderCellParams<CombatLogRow, Fixed6>): React.JSX.Element =>
        renderSkillCell(params.row.attackerSkill, params.row.attackerSkillAtStart, combatMaxSkill, true),
    },
    {
      field: 'defenderSkill',
      headerName: 'Def Skill',
      width: columnWidths['combat_log.defender_skill'],
      cellClassName: 'combat-log-skill-cell',
      sortComparator: createFixed6SortComparator(
        rows,
        (row) => row.defenderSkill,
        (row) => row.defenderSkillAtStart,
      ),
      renderCell: (params: GridRenderCellParams<CombatLogRow, Fixed6>): React.JSX.Element =>
        renderSkillCell(params.row.defenderSkill, params.row.defenderSkillAtStart, combatMaxSkill, false),
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
        return (
          <span>
            {params.row.damage}/{params.row.baseDamage}
          </span>
        )
      },
    },
    {
      field: 'defenderHpAfterDamage',
      headerName: 'HP',
      width: columnWidths['combat_log.defender_hp'],
      renderCell: (params: GridRenderCellParams<CombatLogRow>): React.JSX.Element => {
        const hpPct = fmtPctDec0(params.row.defenderHpAfterDamage, params.row.defenderHpMax)
        const isZeroOrLess = params.row.defenderHpAfterDamage <= 0
        return (
          <span style={{ color: isZeroOrLess ? 'hsl(4, 90%, 58%)' : undefined }}>
            {Math.round(params.row.defenderHpAfterDamage)}/{params.row.defenderHpMax} ({hpPct})
          </span>
        )
      },
    },
  ]

  return columns
}

function renderSkillCell(
  currentSkill: Fixed6,
  skillAtStart: Fixed6,
  combatMaxSkill: Fixed6,
  fillFromRight: boolean,
): React.JSX.Element {
  // Calculate fill percentage: current skill normalized to combat max (0-100%)
  const fillPct = combatMaxSkill.value > 0 ? Math.min(100, (currentSkill.value / combatMaxSkill.value) * 100) : 0

  // Calculate color percentage: current skill vs initial skill (0.0 = red, 1.0 = green)
  const colorPct = skillAtStart.value > 0 ? Math.max(0, Math.min(1, currentSkill.value / skillAtStart.value)) : 0

  // Convert color percentage to HSL hue: 0 = red (0°), 1.0 = green (120°)
  const hue = colorPct * 120

  // Create gradient background: filled portion with color, rest transparent
  // If fillFromRight is true, fill from right to left; otherwise fill from left to right
  const saturation = '90%'
  const lightness = '58%'
  const alpha = '0.5'
  const background = fillFromRight
    ? `linear-gradient(90deg, transparent 0%, transparent ${100 - fillPct}%, hsla(${hue}, ${saturation}, ${lightness}, ${alpha}) ${100 - fillPct}%, hsla(${hue}, ${saturation}, ${lightness}, ${alpha}) 100%)`
    : `linear-gradient(90deg, hsla(${hue}, ${saturation}, ${lightness}, ${alpha}) 0%, hsla(${hue}, ${saturation}, ${lightness}, ${alpha}) ${fillPct}%, transparent ${fillPct}%, transparent 100%)`

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background,
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <Box
        component="span"
        sx={{
          position: 'relative',
          zIndex: 1,
        }}
      >
        {f6fmtInt(currentSkill)}
      </Box>
    </Box>
  )
}

function getDefenderColor(outcome: AttackOutcome, isDefender: boolean): string | undefined {
  if (!isDefender) {
    return undefined
  }
  switch (outcome) {
    case 'KIA':
      return 'hsl(4, 90%, 58%)' // red

    case 'Incapacitated':
      return 'hsl(30, 90%, 58%)' // orange
    case 'Hit':
      return 'hsl(60, 90%, 58%)' // yellow
    case 'Miss':
      return 'hsl(0, 0.00%, 85%)' // light gray
  }
}
