import type { GridColDef, GridRenderCellParams } from '@mui/x-data-grid'
import * as React from 'react'
import { columnWidths } from '../Common/columnWidths'
import { MyChip } from '../Common/MyChip'
import { f6fmtInt, f6fmtPctDec0, type Fixed6 } from '../../lib/primitives/fixed6'
import { fmtPctDec0 } from '../../lib/primitives/formatPrimitives'
import { createFixed6SortComparator } from '../Common/dataGridSortUtils'
import type { BattleStatus } from '../../lib/model/outcomeTypes'
import { ColorBar } from '../ColorBar/ColorBar'

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

type GetBattleLogColumnsParams = {
  rows: BattleLogRow[]
  maxInitialSkill: Fixed6
  maxHp: number
  maxCount: number
  maxRatio: Fixed6
}

export function getBattleLogColumns({
  rows,
  maxInitialSkill,
  maxHp,
  maxCount,
  maxRatio,
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
      renderCell: (params: GridRenderCellParams<BattleLogRow>): React.JSX.Element => {
        // Display "Retreat" instead of "Retreated" in battle log
        const displayStatus = params.row.status === 'Retreated' ? 'Retreat' : params.row.status
        return <MyChip chipValue={displayStatus} />
      },
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
      cellClassName: 'battle-log-skill-cell',
      renderCell: (params: GridRenderCellParams<BattleLogRow, Fixed6>): React.JSX.Element =>
        renderRatioCell(params.row.skillRatio, maxRatio),
    },
  ]

  return columns
}

function renderBattleCountCell(currentCount: number, maxCount: number, battleMaxCount: number): React.JSX.Element {
  // Calculate fill percentage: current count normalized to battle max count (0-100%)
  const fillPct = battleMaxCount > 0 ? Math.min(100, (currentCount / battleMaxCount) * 100) : 0

  // Calculate color percentage: current count vs initial count (0.0 = red, 1.0 = green)
  const colorPct = maxCount > 0 ? Math.max(0, Math.min(1, currentCount / maxCount)) : 0

  const formatted = `${currentCount}/${maxCount}`

  return (
    <ColorBar fillPct={fillPct} colorPct={colorPct}>
      {formatted}
    </ColorBar>
  )
}

function renderBattleHpCell(currentHp: number, maxHp: number, battleMaxHp: number): React.JSX.Element {
  const currentHpRounded = Math.round(currentHp)

  // Calculate fill percentage: current HP normalized to battle max HP (0-100%)
  const fillPct = battleMaxHp > 0 ? Math.min(100, (currentHpRounded / battleMaxHp) * 100) : 0

  // Calculate color percentage: current HP vs initial HP (0.0 = red, 1.0 = green)
  const colorPct = maxHp > 0 ? Math.max(0, Math.min(1, currentHpRounded / maxHp)) : 0

  const hpPct = fmtPctDec0(currentHpRounded, maxHp)
  const formatted = `${currentHpRounded} (${hpPct})`

  return (
    <ColorBar fillPct={fillPct} colorPct={colorPct}>
      {formatted}
    </ColorBar>
  )
}

function renderRatioCell(currentRatio: Fixed6, maxRatio: Fixed6): React.JSX.Element {
  // Calculate fill percentage: current ratio normalized to max ratio (0-100%)
  const fillPct = maxRatio.value > 0 ? Math.min(100, (currentRatio.value / maxRatio.value) * 100) : 0

  // Calculate color percentage: current ratio vs 100% ratio (1.0)
  // 0% ratio (0.0) = green, 100% ratio (1.0) = red, >100% ratio (>1.0) = red (clamped to 1.0)
  // Fixed6 stores 1.0 as 1_000_000, so divide by 1_000_000 to get the ratio value
  const ratioValue = currentRatio.value / 1_000_000
  const colorPct = Math.max(0, Math.min(1, ratioValue))

  // Note: For ratio, we reverse the color mapping - 0% ratio = green, 100% ratio = red
  // So we pass (1 - colorPct) to invert the color scale
  return (
    <ColorBar fillPct={fillPct} colorPct={1 - colorPct}>
      {f6fmtPctDec0(currentRatio)}
    </ColorBar>
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

  return (
    <ColorBar fillPct={fillPct} colorPct={colorPct} fillFromRight={fillFromRight}>
      {f6fmtInt(currentSkill)} ({f6fmtPctDec0(currentSkill, skillAtStart)})
    </ColorBar>
  )
}
