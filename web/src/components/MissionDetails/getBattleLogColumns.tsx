import type { GridColDef, GridRenderCellParams } from '@mui/x-data-grid'
import * as React from 'react'
import Box from '@mui/material/Box'
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

// Color constants for skill and HP bars (reused from combat log)
const SKILL_BAR_GREEN = 'hsla(120, 90%, 58%, 0.5)'
const SKILL_BAR_RED = 'hsla(0, 90%, 58%, 0.5)'

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

type GetBattleLogColumnsParams = {
  rows: BattleLogRow[]
  maxInitialSkill: Fixed6
  maxHp: number
  maxCount: number
}

export function getBattleLogColumns({
  rows,
  maxInitialSkill,
  maxHp,
  maxCount,
}: GetBattleLogColumnsParams): GridColDef<BattleLogRow>[] {
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
      cellClassName: 'battle-log-skill-cell',
      renderCell: (params: GridRenderCellParams<BattleLogRow>): React.JSX.Element =>
        renderBattleCountCell(params.row.agentCount, params.row.agentCountTotal, maxCount),
    },
    {
      field: 'agentSkill',
      headerName: 'Agent Skill',
      width: columnWidths['battle_log.agent_skill'],
      cellClassName: 'battle-log-skill-cell',
      sortComparator: createFixed6SortComparator(
        rows,
        (row) => row.agentSkill,
        (row) => row.agentSkillTotal,
      ),
      renderCell: (params: GridRenderCellParams<BattleLogRow, Fixed6>): React.JSX.Element =>
        renderBattleSkillCell(params.row.agentSkill, params.row.agentSkillTotal, maxInitialSkill, false),
    },
    {
      field: 'agentHp',
      headerName: 'Agent HP',
      width: columnWidths['battle_log.agent_hp'],
      cellClassName: 'battle-log-skill-cell',
      renderCell: (params: GridRenderCellParams<BattleLogRow>): React.JSX.Element =>
        renderBattleHpCell(params.row.agentHp, params.row.agentHpTotal, maxHp),
    },
    {
      field: 'enemyCount',
      headerName: 'Enem.',
      width: columnWidths['battle_log.enemy_count'],
      cellClassName: 'battle-log-skill-cell',
      renderCell: (params: GridRenderCellParams<BattleLogRow>): React.JSX.Element =>
        renderBattleCountCell(params.row.enemyCount, params.row.enemyCountTotal, maxCount),
    },
    {
      field: 'enemySkill',
      headerName: 'Enemy Skill',
      width: columnWidths['battle_log.enemy_skill'],
      cellClassName: 'battle-log-skill-cell',
      sortComparator: createFixed6SortComparator(
        rows,
        (row) => row.enemySkill,
        (row) => row.enemySkillTotal,
      ),
      renderCell: (params: GridRenderCellParams<BattleLogRow, Fixed6>): React.JSX.Element =>
        renderBattleSkillCell(params.row.enemySkill, params.row.enemySkillTotal, maxInitialSkill, false),
    },
    {
      field: 'enemyHp',
      headerName: 'Enemy HP',
      width: columnWidths['battle_log.enemy_hp'],
      cellClassName: 'battle-log-skill-cell',
      renderCell: (params: GridRenderCellParams<BattleLogRow>): React.JSX.Element =>
        renderBattleHpCell(params.row.enemyHp, params.row.enemyHpTotal, maxHp),
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

function renderBattleCountCell(currentCount: number, maxCount: number, battleMaxCount: number): React.JSX.Element {
  // Calculate fill percentage: current count normalized to battle max count (0-100%)
  const fillPct = battleMaxCount > 0 ? Math.min(100, (currentCount / battleMaxCount) * 100) : 0

  // Calculate color percentage: current count vs initial count (0.0 = red, 1.0 = green)
  const colorPct = maxCount > 0 ? Math.max(0, Math.min(1, currentCount / maxCount)) : 0

  // Convert color percentage to HSL hue: interpolate between red (0°) and green (120°)
  const { hue: redHue, alpha: redAlpha } = skillBarRedComponents
  const { hue: greenHue, saturation, lightness, alpha: greenAlpha } = skillBarGreenComponents
  const hue = redHue + colorPct * (greenHue - redHue)
  // Interpolate alpha between red and green
  const alpha = Number.parseFloat(redAlpha) + colorPct * (Number.parseFloat(greenAlpha) - Number.parseFloat(redAlpha))

  // Create gradient background: filled portion with color, rest transparent
  const background = `linear-gradient(90deg, hsla(${hue}, ${saturation}, ${lightness}, ${alpha}) 0%, hsla(${hue}, ${saturation}, ${lightness}, ${alpha}) ${fillPct}%, transparent ${fillPct}%, transparent 100%)`

  const formatted = `${currentCount}/${maxCount}`

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
        {formatted}
      </Box>
    </Box>
  )
}

function renderBattleHpCell(currentHp: number, maxHp: number, battleMaxHp: number): React.JSX.Element {
  const currentHpRounded = Math.round(currentHp)

  // Calculate fill percentage: current HP normalized to battle max HP (0-100%)
  const fillPct = battleMaxHp > 0 ? Math.min(100, (currentHpRounded / battleMaxHp) * 100) : 0

  // Calculate color percentage: current HP vs initial HP (0.0 = red, 1.0 = green)
  const colorPct = maxHp > 0 ? Math.max(0, Math.min(1, currentHpRounded / maxHp)) : 0

  // Convert color percentage to HSL hue: interpolate between red (0°) and green (120°)
  const { hue: redHue, alpha: redAlpha } = skillBarRedComponents
  const { hue: greenHue, saturation, lightness, alpha: greenAlpha } = skillBarGreenComponents
  const hue = redHue + colorPct * (greenHue - redHue)
  // Interpolate alpha between red and green
  const alpha = Number.parseFloat(redAlpha) + colorPct * (Number.parseFloat(greenAlpha) - Number.parseFloat(redAlpha))

  // Create gradient background: filled portion with color, rest transparent
  const background = `linear-gradient(90deg, hsla(${hue}, ${saturation}, ${lightness}, ${alpha}) 0%, hsla(${hue}, ${saturation}, ${lightness}, ${alpha}) ${fillPct}%, transparent ${fillPct}%, transparent 100%)`

  const hpPct = fmtPctDec0(currentHpRounded, maxHp)
  const formatted = `${currentHpRounded} (${hpPct})`

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
        {formatted}
      </Box>
    </Box>
  )
}

function renderBattleSkillCell(
  currentSkill: Fixed6,
  skillAtStart: Fixed6,
  maxInitialSkill: Fixed6,
  fillFromRight: boolean,
): React.JSX.Element {
  // Calculate fill percentage: current skill normalized to max initial skill (0-100%)
  const fillPct = maxInitialSkill.value > 0 ? Math.min(100, (currentSkill.value / maxInitialSkill.value) * 100) : 0

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
        {f6fmtInt(currentSkill)} ({f6fmtPctDec0(currentSkill, skillAtStart)})
      </Box>
    </Box>
  )
}
