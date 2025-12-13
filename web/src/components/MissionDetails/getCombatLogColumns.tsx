import type { GridColDef, GridRenderCellParams } from '@mui/x-data-grid'
import * as React from 'react'
import Box from '@mui/material/Box'
import { columnWidths } from '../Common/columnWidths'
import { f6fmtInt, type Fixed6 } from '../../lib/primitives/fixed6'
import { fmtNoPrefix } from '../../lib/primitives/formatPrimitives'
import { floorToDec2 } from '../../lib/primitives/mathPrimitives'
import { createFixed6SortComparator } from '../Common/dataGridSortUtils'
import type { AttackOutcome } from '../../lib/model/outcomeTypes'

// Color constants for skill and HP bars
const SKILL_BAR_GREEN = 'hsla(120, 90%, 58%, 0.5)'
const SKILL_BAR_RED = 'hsla(0, 90%, 58%, 0.5)'
const HP_BAR_GREEN = 'hsla(120, 90%, 58%, 0.5)'
const HP_BAR_RED = 'hsla(0, 90%, 58%, 0.5)'
const ROLL_BAR_GREY = 'hsla(0, 0%, 50%, 0.3)'
const ROLL_BAR_GREEN = 'hsla(120, 90%, 58%, 0.3)'
const ROLL_BAR_RED = 'hsla(0, 90%, 58%, 0.4)'

// Extract color components from constants
function parseHslaColor(color: string): { hue: number; saturation: string; lightness: string; alpha: string } {
  const regex = /hsla\((?<hue>\d+),\s*(?<saturation>\d+%),\s*(?<lightness>\d+%),\s*(?<alpha>[\d.]+)\)/u
  const match = regex.exec(color)
  const groups = match?.groups
  const hueStr = groups?.['hue']
  const saturationStr = groups?.['saturation']
  const lightnessStr = groups?.['lightness']
  const alphaStr = groups?.['alpha']
  if (hueStr === undefined || saturationStr === undefined || lightnessStr === undefined || alphaStr === undefined) {
    throw new Error(`Invalid HSLA color format: ${color}`)
  }
  return {
    hue: Number.parseInt(hueStr, 10),
    saturation: saturationStr,
    lightness: lightnessStr,
    alpha: alphaStr,
  }
}

const skillBarGreenComponents = parseHslaColor(SKILL_BAR_GREEN)
const skillBarRedComponents = parseHslaColor(SKILL_BAR_RED)

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
      cellClassName: 'combat-log-skill-cell',
      renderCell: (params: GridRenderCellParams<CombatLogRow>): React.JSX.Element =>
        renderRollCell(params.row.roll, params.row.threshold),
    },
    {
      field: 'damage',
      headerName: 'Damage',
      width: columnWidths['combat_log.damage'],
      renderCell: (params: GridRenderCellParams<CombatLogRow>): React.JSX.Element => {
        if (params.row.damage === undefined) {
          return <span></span>
        }
        const formatted = fmtDamageComparison(params.row.damage, params.row.baseDamage)
        return <span style={{ whiteSpace: 'pre' }}>{formatted}</span>
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
  const fillPct = combatMaxSkill.value > 0 ? Math.min(100, (currentSkill.value / combatMaxSkill.value) * 100) : 0

  // Calculate color percentage: current skill vs initial skill (0.0 = red, 1.0 = green)
  const colorPct = skillAtStart.value > 0 ? Math.max(0, Math.min(1, currentSkill.value / skillAtStart.value)) : 0

  // Convert color percentage to HSL hue: interpolate between red (0°) and green (120°)
  const { hue: redHue, alpha: redAlpha } = skillBarRedComponents
  const { hue: greenHue, saturation, lightness, alpha: greenAlpha } = skillBarGreenComponents
  const hue = redHue + colorPct * (greenHue - redHue)
  // Interpolate alpha between red and green
  const alpha = Number.parseFloat(redAlpha) + colorPct * (Number.parseFloat(greenAlpha) - Number.parseFloat(redAlpha))

  // Create gradient background: filled portion with color, rest transparent
  // If fillFromRight is true, fill from right to left; otherwise fill from left to right
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
