import type { GridColDef, GridRenderCellParams, GridSortCellParams } from '@mui/x-data-grid'
import * as React from 'react'
import { toF6, f6fmtInt, f6fmtPctDec0, f6cmp, f6eq, type Fixed6 } from '../../lib/primitives/fixed6'
import type { AgentState } from '../../lib/model/agentModel'
import type { GameState } from '../../lib/model/gameStateModel'
import { assertDefined } from '../../lib/primitives/assertPrimitives'
import { fmtNoPrefix } from '../../lib/primitives/formatPrimitives'
import { fmtMissionSiteIdWithMissionId } from '../../lib/model_utils/missionSiteUtils'
import { assertColumnWidth } from '../Common/assertColumnWidth'
import { columnWidths } from '../Common/columnWidths'
import {
  EXPECTED_AGENTS_DEFAULT_VIEW_COLUMN_WIDTH,
  EXPECTED_AGENTS_TERMINATED_VIEW_COLUMN_WIDTH,
} from '../Common/widthConstants'
import { getModelPalette } from '../styling/modelPaletteUtils'
import { MyChip } from '../Common/MyChip'
import type { AgentRow } from './AgentsDataGrid'
import { effectiveSkill } from '../../lib/ruleset/skillRuleset'
import { getRemainingRecoveryTurns } from '../../lib/ruleset/recoveryRuleset'

// oxlint-disable-next-line max-lines-per-function
// eslint-disable-next-line max-lines-per-function
export function getAgentsColumns(
  rows: AgentRow[],
  missionSites: GameState['missionSites'],
  currentTurn: number,
  hitPointsRecoveryPct: Fixed6,
): GridColDef[] {
  // Return all columns - visibility will be controlled by filterVisibleAgentColumns
  const columns: GridColDef[] = [
    {
      field: 'id',
      headerName: 'ID',
      width: columnWidths['agents.id'],
      renderCell: (params: GridRenderCellParams<AgentRow, string>) => (
        <span aria-label={`agents-row-agent-id-${params.id}`}>{params.value}</span>
      ),
    },
    {
      field: 'state',
      headerName: 'State',
      width: columnWidths['agents.state'],
      renderCell: (params: GridRenderCellParams<AgentRow, AgentState>): React.JSX.Element => {
        const state = params.value
        if (state === undefined) {
          return <span aria-label={`agents-row-state-${params.id}`}>-</span>
        }
        const paletteColorName = getModelPalette()[state]
        return (
          <span aria-label={`agents-row-state-${params.id}`}>
            <MyChip chipValue={state} paletteColorName={paletteColorName} />
          </span>
        )
      },
    },
    {
      field: 'assignment',
      headerName: 'Assignment',
      width: columnWidths['agents.assignment'],
      renderCell: (params: GridRenderCellParams<AgentRow, string>) => (
        <span aria-label={`agents-row-assignment-${params.id}`}>{params.value}</span>
      ),
    },
    {
      field: 'skill',
      headerName: 'Skill',
      width: columnWidths['agents.skill'],
      sortComparator: (
        _v1: string,
        _v2: string,
        param1: GridSortCellParams<string>,
        param2: GridSortCellParams<string>,
      ): number => {
        // Sort by effective skill instead of baseline skill
        // Find the rows from our typed rows array using the row IDs
        const row1 = rows.find((row) => row.rowId === param1.id)
        const row2 = rows.find((row) => row.rowId === param2.id)

        assertDefined(row1, `Row not found for id: ${param1.id}`)
        assertDefined(row2, `Row not found for id: ${param2.id}`)

        const effectiveSkill1 = effectiveSkill(row1)
        const effectiveSkill2 = effectiveSkill(row2)

        // Primary sort: effective skill (compare Fixed6 values)
        if (!f6eq(effectiveSkill1, effectiveSkill2)) {
          return f6cmp(effectiveSkill1, effectiveSkill2)
        }

        // Secondary sort: baseline skill (if effective skills are equal)
        const comparison = f6cmp(row1.skill, row2.skill)
        if (comparison !== 0) {
          return comparison
        }

        // Tertiary sort: agent ID (for stable sorting)
        return row1.id.localeCompare(row2.id)
      },
      renderCell: (params: GridRenderCellParams<AgentRow, Fixed6>): React.JSX.Element => {
        const effectiveSkillVal = effectiveSkill(params.row)
        const baselineSkill = params.value ?? toF6(0)
        const percentage = f6fmtPctDec0(effectiveSkillVal, baselineSkill)
        return (
          <div
            aria-label={`agents-row-skill-${params.id}`}
            style={{
              display: 'grid',
              gridTemplateColumns: '3ch 1ch 3ch 7ch',
              gap: '5px',
              alignItems: 'center',
              width: '100%',
            }}
          >
            <span style={{ textAlign: 'right' }}>{f6fmtInt(effectiveSkillVal)}</span>
            <span style={{ textAlign: 'center' }}>/</span>
            <span style={{ textAlign: 'right' }}>{f6fmtInt(baselineSkill)}</span>
            <span style={{ textAlign: 'right' }}>({percentage})</span>
          </div>
        )
      },
    },
    {
      field: 'hitPoints',
      headerName: 'HP',
      width: columnWidths['agents.hit_points'],
      renderCell: (params: GridRenderCellParams<AgentRow, Fixed6>): React.JSX.Element => {
        if (params.value === undefined) {
          return <span />
        }
        return (
          <div
            aria-label={`agents-row-hit-points-${params.id}`}
            style={{
              display: 'grid',
              gridTemplateColumns: '2ch 1ch 2ch',
              gap: '2px',
              alignItems: 'center',
              width: '100%',
            }}
          >
            <span style={{ textAlign: 'right' }}>{f6fmtInt(params.value)}</span>
            <span style={{ textAlign: 'center' }}>/</span>
            <span style={{ textAlign: 'right' }}>{params.row.maxHitPoints}</span>
          </div>
        )
      },
    },
    {
      field: 'recoveryTurns',
      headerName: 'Recovery',
      width: columnWidths['agents.recovery'],
      renderCell: (params: GridRenderCellParams<AgentRow>): React.JSX.Element => {
        const remainingTurns = getRemainingRecoveryTurns(params.row, hitPointsRecoveryPct)
        return (
          <span aria-label={`agents-row-recovery-${params.id}`}>
            {remainingTurns > 0 ? `${remainingTurns} turns` : '-'}
          </span>
        )
      },
    },
    {
      field: 'exhaustion',
      headerName: 'Exhaustion',
      width: columnWidths['agents.exhaustion'],
      renderCell: (params: GridRenderCellParams<AgentRow, number>) => (
        <span aria-label={`agents-row-exhaustion-${params.id}`}>{params.value}</span>
      ),
    },
    {
      field: 'skillSimple',
      headerName: 'Skill',
      width: columnWidths['agents.skill_simple'],
      valueGetter: (_value, row: AgentRow) => f6fmtInt(row.skill),
      renderCell: (params: GridRenderCellParams<AgentRow, number>): React.JSX.Element => (
        <span aria-label={`agents-row-skill-simple-${params.id}`}>{params.value ?? 0}</span>
      ),
    },
    {
      field: 'hitPointsMax',
      headerName: 'HP',
      width: columnWidths['agents.hit_points_max'],
      renderCell: (params: GridRenderCellParams<AgentRow, number>): React.JSX.Element => (
        <span aria-label={`agents-row-hp-${params.id}`}>{params.row.maxHitPoints}</span>
      ),
    },
    {
      field: 'service',
      headerName: 'Service',
      width: columnWidths['agents.service'],
      valueGetter: (_value, row: AgentRow): number => {
        const { turnHired, turnTerminated } = row
        if (turnTerminated !== undefined) {
          return turnTerminated - turnHired + 1
        }
        return currentTurn - turnHired + 1
      },
      renderCell: (params: GridRenderCellParams<AgentRow, string>): React.JSX.Element => {
        const { turnHired, turnTerminated } = params.row
        if (turnTerminated !== undefined) {
          // Terminated agent: show turnHired - turnTerminated (totalTurnsServed)
          const totalTurnsServed = turnTerminated - turnHired + 1
          return (
            <span aria-label={`agents-row-service-${params.id}`}>
              {turnHired} - {turnTerminated} ({totalTurnsServed})
            </span>
          )
        }
        // Active agent: show turnHired - currentTurn (totalTurnsServed)
        const totalTurnsServed = currentTurn - turnHired + 1
        return (
          <span aria-label={`agents-row-service-${params.id}`}>
            {turnHired} - {currentTurn} ({totalTurnsServed})
          </span>
        )
      },
    },
    {
      field: 'missionsTotal',
      headerName: 'Miss #',
      width: columnWidths['agents.missions_total'],
      renderCell: (params: GridRenderCellParams<AgentRow, number>): React.JSX.Element => (
        <span aria-label={`agents-row-missions-total-${params.id}`}>{params.row.missionsTotal}</span>
      ),
    },
    {
      field: 'mission',
      headerName: 'Mission',
      width: columnWidths['agents.mission'],
      renderCell: (params: GridRenderCellParams<AgentRow, string>): React.JSX.Element => {
        const { terminatedOnMissionSiteId, assignment } = params.row

        if (terminatedOnMissionSiteId !== undefined) {
          const missionSite = missionSites.find((site) => site.id === terminatedOnMissionSiteId)
          if (missionSite !== undefined) {
            const displayValue = fmtMissionSiteIdWithMissionId(missionSite)
            return <span aria-label={`agents-row-mission-${params.id}`}>{displayValue}</span>
          }
        }
        // If agent was sacked (assignment is 'Sacked'), show "-"
        if (assignment === 'Sacked') {
          return <span aria-label={`agents-row-mission-${params.id}`}>Sacked</span>
        }
        // Fallback (shouldn't happen for terminated agents, but just in case)
        return <span aria-label={`agents-row-mission-${params.id}`}>-</span>
      },
    },
    {
      field: 'by',
      headerName: 'By',
      width: columnWidths['agents.by'],
      renderCell: (params: GridRenderCellParams<AgentRow, string>): React.JSX.Element => {
        const { terminatedBy } = params.row
        // If agent was terminated by an enemy, show the enemy ID without prefix
        if (terminatedBy !== undefined) {
          const displayValue = fmtNoPrefix(terminatedBy, 'enemy-')
          return <span aria-label={`agents-row-by-${params.id}`}>{displayValue}</span>
        }
        return <span aria-label={`agents-row-by-${params.id}`}>-</span>
      },
    },
  ]

  // Assert default view column width matches expected value
  // Default view shows: id, state, assignment, skill, exhaustion
  const defaultViewFields = new Set(['id', 'state', 'assignment', 'skill', 'exhaustion'])
  assertColumnWidth(columns, EXPECTED_AGENTS_DEFAULT_VIEW_COLUMN_WIDTH, 'Agents default view', defaultViewFields)

  // Assert terminated view column width matches expected value
  // Terminated view shows: id, skillSimple, hitPointsMax, service, missionsTotal, mission, by
  const terminatedViewFields = new Set([
    'id',
    'skillSimple',
    'hitPointsMax',
    'service',
    'missionsTotal',
    'mission',
    'by',
  ])
  assertColumnWidth(
    columns,
    EXPECTED_AGENTS_TERMINATED_VIEW_COLUMN_WIDTH,
    'Agents terminated view',
    terminatedViewFields,
  )

  return columns
}
