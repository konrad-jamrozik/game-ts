import type { GridColDef, GridRenderCellParams } from '@mui/x-data-grid'
import * as React from 'react'
import Box from '@mui/material/Box'
import { columnWidths } from '../Common/columnWidths'
import { f6fmtInt, f6fmtPctDec0, type Fixed6 } from '../../lib/primitives/fixed6'
import { fmtNoPrefix } from '../../lib/primitives/formatPrimitives'
import { floorToDec2 } from '../../lib/primitives/mathPrimitives'
import { createFixed6SortComparator } from '../Common/dataGridSortUtils'
import type { AttackOutcome } from '../../lib/model/outcomeTypes'
import { ColorBar } from '../ColorBar/ColorBar'
import {
  ROLL_BAR_GREY,
  ROLL_BAR_GREEN,
  ROLL_BAR_RED,
  HP_BAR_GREEN,
  HP_BAR_RED,
  AGENTS_SKILL_BAR_GREY,
  getColorBarFillColor,
} from '../ColorBar/colorBarUtils'
import { COMBAT_INCAPACITATION_THRESHOLD } from '../../lib/ruleset/constants'

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
        // Outcome always applies to the defender, so isDefender = true
        const color = getDefenderColor(params.row.outcome, true)
        const displayValue = params.row.outcome === 'Incapacitated' ? 'Incap' : params.row.outcome
        return <span style={{ color }}>{displayValue}</span>
      },
    },
    {
      field: 'agentSkill',
      headerName: 'Agent Skill',
      width: columnWidths['combat_log.attacker_skill'],
      cellClassName: 'combat-log-skill-cell',
      sortComparator: createFixed6SortComparator(
        rows,
        (row) => (row.attackerType === 'Agent' ? row.attackerSkill : row.defenderSkill),
        (row) => (row.attackerType === 'Agent' ? row.attackerSkillAtStart : row.defenderSkillAtStart),
      ),
      renderCell: (params: GridRenderCellParams<CombatLogRow, Fixed6>): React.JSX.Element => {
        const agentSkill = params.row.attackerType === 'Agent' ? params.row.attackerSkill : params.row.defenderSkill
        const agentSkillAtStart =
          params.row.attackerType === 'Agent' ? params.row.attackerSkillAtStart : params.row.defenderSkillAtStart
        return renderSkillCell(agentSkill, agentSkillAtStart, combatMaxSkill, true)
      },
    },
    {
      field: 'enemySkill',
      headerName: 'Enemy Skill',
      width: columnWidths['combat_log.defender_skill'],
      cellClassName: 'combat-log-skill-cell',
      sortComparator: createFixed6SortComparator(
        rows,
        (row) => (row.attackerType === 'Agent' ? row.defenderSkill : row.attackerSkill),
        (row) => (row.attackerType === 'Agent' ? row.defenderSkillAtStart : row.attackerSkillAtStart),
      ),
      renderCell: (params: GridRenderCellParams<CombatLogRow, Fixed6>): React.JSX.Element => {
        const enemySkill = params.row.attackerType === 'Agent' ? params.row.defenderSkill : params.row.attackerSkill
        const enemySkillAtStart =
          params.row.attackerType === 'Agent' ? params.row.defenderSkillAtStart : params.row.attackerSkillAtStart
        return renderSkillCell(enemySkill, enemySkillAtStart, combatMaxSkill, false)
      },
    },
    {
      field: 'roll',
      headerName: 'Att Roll',
      width: columnWidths['combat_log.roll'],
      cellClassName: 'combat-log-skill-cell',
      renderCell: (params: GridRenderCellParams<CombatLogRow>): React.JSX.Element =>
        renderRollCell(params.row.roll, params.row.threshold),
    },
    {
      field: 'rollDiff',
      headerName: 'Diff',
      width: columnWidths['combat_log.roll_diff'],
      cellClassName: 'combat-log-skill-cell',
      type: 'number',
      valueGetter: (_value, row: CombatLogRow): number => row.roll - row.threshold,
      sortComparator: (v1: number, v2: number): number => v1 - v2,
      renderCell: (params: GridRenderCellParams<CombatLogRow>): React.JSX.Element =>
        renderDiffCell(params.row.roll, params.row.threshold, rows),
    },
    {
      field: 'damage',
      headerName: 'Damage',
      width: columnWidths['combat_log.damage'],
      cellClassName: 'combat-log-skill-cell',
      renderCell: (params: GridRenderCellParams<CombatLogRow>): React.JSX.Element => {
        if (params.row.damage === undefined) {
          return <span></span>
        }
        return renderDamageCell(params.row.damage, params.row.damageMin, params.row.damageMax, params.row.baseDamage)
      },
    },
    {
      field: 'defenderHpAfterDamage',
      headerName: 'HP',
      width: columnWidths['combat_log.defender_hp'],
      cellClassName: 'combat-log-skill-cell',
      renderCell: (params: GridRenderCellParams<CombatLogRow>): React.JSX.Element =>
        renderHpCell(params.row.defenderHpAfterDamage, params.row.defenderHpMax, params.row.damage),
    },
  ]

  return columns
}

function fmtRollComparison(roll: number, threshold: number, operator: '>' | '<='): string {
  // Format roll as XXX.XX (3 digits before decimal, 2 after), padded to 6 characters
  const rollValue = floorToDec2(roll).toFixed(2)
  const rollFormatted = rollValue.padStart(6, ' ')
  // Format threshold as XXX.XX (3 digits before decimal, 2 after), padded to 6 characters
  const thresholdValue = floorToDec2(threshold).toFixed(2)
  const thresholdFormatted = thresholdValue.padStart(6, ' ')
  // Remove one space after <= to account for the extra character in the operator
  const operatorSpacing = operator === '<=' ? '' : ' '
  return `${rollFormatted} % ${operator}${operatorSpacing} ${thresholdFormatted} %`
}

function renderDiffCell(roll: number, threshold: number, allRows: CombatLogRow[]): React.JSX.Element {
  const diff = roll - threshold
  const diffFormatted = diff >= 0 ? floorToDec2(diff).toFixed(2) : floorToDec2(diff).toFixed(2)

  // Calculate max absolute diff for normalization
  const maxAbsDiff = Math.max(
    ...allRows.map((row) => Math.abs(row.roll - row.threshold)),
    1, // fallback to 1 to avoid division by zero
  )

  // Normalize diff to percentage (0-100%)
  const absDiff = Math.abs(diff)
  const fillPct = Math.min(100, (absDiff / maxAbsDiff) * 100)

  // Create background: green for positive diff, red for negative diff
  const background =
    diff > 0
      ? `linear-gradient(90deg, 
        ${ROLL_BAR_GREEN} 0%, 
        ${ROLL_BAR_GREEN} ${fillPct}%, 
        transparent ${fillPct}%, 
        transparent 100%)`
      : diff < 0
        ? `linear-gradient(90deg, 
        ${ROLL_BAR_RED} 0%, 
        ${ROLL_BAR_RED} ${fillPct}%, 
        transparent ${fillPct}%, 
        transparent 100%)`
        : `linear-gradient(90deg, 
        ${ROLL_BAR_GREY} 0%, 
        ${ROLL_BAR_GREY} ${fillPct}%, 
        transparent ${fillPct}%, 
        transparent 100%)`

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
        border: '1px solid rgba(128, 128, 128, 0.3)',
        boxSizing: 'border-box',
        backgroundClip: 'padding-box',
      }}
    >
      <Box
        component="span"
        sx={{
          position: 'relative',
          zIndex: 1,
        }}
      >
        {diffFormatted}%
      </Box>
    </Box>
  )
}

function renderRollCell(roll: number, threshold: number): React.JSX.Element {
  const exceeded = roll > threshold
  const operator = exceeded ? '>' : '<='
  const formatted = fmtRollComparison(roll, threshold, operator)

  // Normalize to 100% for the bar (assuming max roll is 100%)
  const maxRoll = 100
  const rollPct = Math.min(100, (roll / maxRoll) * 100)
  const thresholdPct = Math.min(100, (threshold / maxRoll) * 100)

  const background = exceeded
    ? // Success: grey up to threshold, then green from threshold to roll
      `linear-gradient(90deg, 
      ${ROLL_BAR_GREY} 0%, 
      ${ROLL_BAR_GREY} ${thresholdPct}%, 
      ${ROLL_BAR_GREEN} ${thresholdPct}%, 
      ${ROLL_BAR_GREEN} ${rollPct}%, 
      transparent ${rollPct}%, 
      transparent 100%)`
    : // Failure: grey up to roll, then red from roll to threshold
      `linear-gradient(90deg, 
      ${ROLL_BAR_GREY} 0%, 
      ${ROLL_BAR_GREY} ${rollPct}%, 
      ${ROLL_BAR_RED} ${rollPct}%, 
      ${ROLL_BAR_RED} ${thresholdPct}%, 
      transparent ${thresholdPct}%, 
      transparent 100%)`

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
        border: '1px solid rgba(128, 128, 128, 0.3)',
        boxSizing: 'border-box',
        backgroundClip: 'padding-box',
      }}
    >
      <Box
        component="span"
        sx={{
          position: 'relative',
          zIndex: 1,
          whiteSpace: 'pre',
        }}
      >
        {formatted}
      </Box>
    </Box>
  )
}

function renderDamageCell(damage: number, damageMin: number, damageMax: number, baseDamage: number): React.JSX.Element {
  // Calculate fill percentage: 0% at damageMin, 100% at damageMax
  const damageRange = damageMax - damageMin
  const fillPct = damageRange > 0 ? Math.min(100, Math.max(0, ((damage - damageMin) / damageRange) * 100)) : 0

  // Use ColorBar with colorPct=0 to get red color (same as Diff red)
  const formatted = fmtDamageComparison(damage, baseDamage)

  return (
    <ColorBar fillPct={fillPct} colorPct={0}>
      <span style={{ whiteSpace: 'pre' }}>{formatted}</span>
    </ColorBar>
  )
}

function fmtDamageComparison(damage: number, baseDamage: number): string {
  // Format damage as XXX (3 digits), padded to 3 characters
  const damageFormatted = Math.floor(damage).toString().padStart(3, ' ')
  // Format baseDamage as XXX (3 digits), padded to 3 characters
  const baseDamageFormatted = Math.floor(baseDamage).toString().padStart(3, ' ')
  return `${damageFormatted} / ${baseDamageFormatted}`
}

function fmtHpComparison(currentHp: number, maxHp: number): string {
  // Format currentHp as XXX (3 digits), padded to 3 characters
  const currentHpFormatted = currentHp.toString().padStart(3, ' ')
  // Format maxHp as XXX (3 digits), padded to 3 characters
  const maxHpFormatted = maxHp.toString().padStart(3, ' ')
  return `${currentHpFormatted} / ${maxHpFormatted}`
}

function renderHpCell(hpAfterDamage: number, maxHp: number, damage: number | undefined): React.JSX.Element {
  const currentHp = Math.round(hpAfterDamage)
  const isZeroOrLess = currentHp <= 0

  // Calculate percentages (all relative to max HP)
  const remainingHpPct = (currentHp / maxHp) * 100
  const damagePct = damage !== undefined ? (damage / maxHp) * 100 : 0

  // Create gradient with three segments:
  // 1. Left: green (remaining HP)
  // 2. Middle: red (damage)
  // 3. Right: transparent (previously lost HP)
  const greenEnd = remainingHpPct
  const redStart = remainingHpPct
  const redEnd = remainingHpPct + damagePct
  const transparentStart = redEnd

  const background = `linear-gradient(90deg, 
    ${HP_BAR_GREEN} 0%, 
    ${HP_BAR_GREEN} ${greenEnd}%, 
    ${HP_BAR_RED} ${redStart}%, 
    ${HP_BAR_RED} ${redEnd}%, 
    transparent ${transparentStart}%, 
    transparent 100%)`

  const formatted = fmtHpComparison(currentHp, maxHp)

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
        border: '1px solid rgba(128, 128, 128, 0.3)',
        boxSizing: 'border-box',
        backgroundClip: 'padding-box',
      }}
    >
      <Box
        component="span"
        sx={{
          position: 'relative',
          zIndex: 1,
          whiteSpace: 'pre',
          color: isZeroOrLess ? 'hsl(4, 90%, 58%)' : undefined,
        }}
      >
        {formatted}
      </Box>
    </Box>
  )
}

function renderSkillCell(
  currentSkill: Fixed6,
  skillAtStart: Fixed6,
  combatMaxSkill: Fixed6,
  fillFromRight: boolean,
): React.JSX.Element {
  // Calculate fill percentage: current skill normalized to combat max (0-100%)
  const currentSkillFillPct =
    combatMaxSkill.value > 0 ? Math.min(100, (currentSkill.value / combatMaxSkill.value) * 100) : 0
  const skillAtStartFillPct =
    combatMaxSkill.value > 0 ? Math.min(100, (skillAtStart.value / combatMaxSkill.value) * 100) : 0

  // Calculate color percentage: current skill vs initial skill
  // Red (0.0) at COMBAT_INCAPACITATION_THRESHOLD, green (1.0) at 100% of initial skill
  let colorPct = 0
  if (skillAtStart.value > 0) {
    const skillRatio = currentSkill.value / skillAtStart.value
    if (skillRatio <= COMBAT_INCAPACITATION_THRESHOLD) {
      colorPct = 0
    } else {
      // Map [COMBAT_INCAPACITATION_THRESHOLD, 1.0] to [0.0, 1.0]
      colorPct = (skillRatio - COMBAT_INCAPACITATION_THRESHOLD) / (1 - COMBAT_INCAPACITATION_THRESHOLD)
      colorPct = Math.max(0, Math.min(1, colorPct))
    }
  }

  // Create background override with grey bar for 100% skill (similar to agents data grid)
  // Grey bar extends to show the full baseline skill (skillAtStart)
  let backgroundOverride: string | undefined = undefined
  if (skillAtStart.value > 0) {
    const fillColor = getColorBarFillColor(colorPct)
    const greyEndPct = Math.max(currentSkillFillPct, skillAtStartFillPct)

    if (fillFromRight) {
      // Fill from right: transparent -> grey -> color (right to left)
      // Color fills from right (100%) to (100 - currentSkillFillPct)%
      // Grey fills from (100 - currentSkillFillPct)% to (100 - skillAtStartFillPct)%
      // Transparent from (100 - skillAtStartFillPct)% to 0%
      const colorStart = 100 - currentSkillFillPct
      const greyStart = 100 - skillAtStartFillPct
      backgroundOverride = `linear-gradient(90deg, transparent 0%, transparent ${greyStart}%, ${AGENTS_SKILL_BAR_GREY} ${greyStart}%, ${AGENTS_SKILL_BAR_GREY} ${colorStart}%, ${fillColor} ${colorStart}%, ${fillColor} 100%)`
    } else {
      // Fill from left: color -> grey -> transparent (left to right)
      backgroundOverride = `linear-gradient(90deg, ${fillColor} 0%, ${fillColor} ${currentSkillFillPct}%, ${AGENTS_SKILL_BAR_GREY} ${currentSkillFillPct}%, ${AGENTS_SKILL_BAR_GREY} ${greyEndPct}%, transparent ${greyEndPct}%, transparent 100%)`
    }
  }

  return (
    <ColorBar
      fillPct={currentSkillFillPct}
      colorPct={colorPct}
      fillFromRight={fillFromRight}
      backgroundOverride={backgroundOverride}
    >
      {f6fmtInt(currentSkill)} ({f6fmtPctDec0(currentSkill, skillAtStart)})
    </ColorBar>
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
