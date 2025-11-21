import type { GridColDef, GridRenderCellParams, GridSortCellParams } from '@mui/x-data-grid'
import * as React from 'react'
import type { AgentState, GameState } from '../../lib/model/model'
import { fromFixed2, toFixed2, type Fixed2 } from '../../lib/model/fixed2'
import { agV } from '../../lib/model/agents/AgentView'
import { assertDefined } from '../../lib/utils/assert'
import { fmtDec1, fmtMissionSiteIdWithMissionId, fmtNoPrefix } from '../../lib/utils/formatUtils'
import { toPct } from '../../lib/utils/mathUtils'
import { MyChip } from '../MyChip'
import { getModelPalette } from '../../styling/modelPaletteUtils'
import type { AgentRow } from './AgentsDataGrid'

// oxlint-disable-next-line max-lines-per-function
// eslint-disable-next-line max-lines-per-function
export function createAgentColumns(
  rows: AgentRow[],
  missionSites: GameState['missionSites'],
  currentTurn: number,
): GridColDef[] {
  // Return all columns - visibility will be controlled by filterVisibleAgentColumns
  return [
    {
      field: 'id',
      headerName: 'ID',
      minWidth: 120,
      renderCell: (params: GridRenderCellParams<AgentRow, string>) => (
        <span aria-label={`agents-row-agent-id-${params.id}`}>{params.value}</span>
      ),
    },
    {
      field: 'state',
      headerName: 'State',
      width: 140,
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
      minWidth: 140,
      renderCell: (params: GridRenderCellParams<AgentRow, string>) => (
        <span aria-label={`agents-row-assignment-${params.id}`}>{params.value}</span>
      ),
    },
    {
      field: 'skill',
      headerName: 'Skill',
      minWidth: 140,
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

        const effectiveSkill1 = agV(row1).effectiveSkill()
        const effectiveSkill2 = agV(row2).effectiveSkill()

        // Primary sort: effective skill (compare Fixed2 values)
        if (effectiveSkill1.value !== effectiveSkill2.value) {
          return effectiveSkill1.value - effectiveSkill2.value
        }

        // Secondary sort: baseline skill (if effective skills are equal)
        const baselineSkill1 = row1.skill.value
        const baselineSkill2 = row2.skill.value
        if (baselineSkill1 !== baselineSkill2) {
          return baselineSkill1 - baselineSkill2
        }

        // Tertiary sort: agent ID (for stable sorting)
        return row1.id.localeCompare(row2.id)
      },
      renderCell: (params: GridRenderCellParams<AgentRow, Fixed2>): React.JSX.Element => {
        const effectiveSkillFixed = agV(params.row).effectiveSkill()
        const effectiveSkill = fromFixed2(effectiveSkillFixed)
        const baselineSkillFixed = params.value ?? toFixed2(0)
        const baselineSkill = fromFixed2(baselineSkillFixed)
        const percentage = baselineSkill > 0 ? fmtDec1(toPct(effectiveSkill, baselineSkill)) : '0.0'
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
            <span style={{ textAlign: 'right' }}>{effectiveSkill}</span>
            <span style={{ textAlign: 'center' }}>/</span>
            <span style={{ textAlign: 'right' }}>{baselineSkill}</span>
            <span style={{ textAlign: 'right' }}>({percentage}%)</span>
          </div>
        )
      },
    },
    {
      field: 'hitPoints',
      headerName: 'HP',
      minWidth: 80,
      renderCell: (params: GridRenderCellParams<AgentRow, number>) => (
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
          <span style={{ textAlign: 'right' }}>{params.value}</span>
          <span style={{ textAlign: 'center' }}>/</span>
          <span style={{ textAlign: 'right' }}>{params.row.maxHitPoints}</span>
        </div>
      ),
    },
    {
      field: 'recoveryTurns',
      headerName: 'Recovery',
      minWidth: 90,
      renderCell: (params: GridRenderCellParams<AgentRow, number>) => (
        <span aria-label={`agents-row-recovery-${params.id}`}>
          {(params.value ?? 0) > 0 ? `${params.value} turns` : '-'}
        </span>
      ),
    },
    {
      field: 'exhaustion',
      headerName: 'Exhaustion',
      minWidth: 100,
      renderCell: (params: GridRenderCellParams<AgentRow, number>) => (
        <span aria-label={`agents-row-exhaustion-${params.id}`}>{params.value}</span>
      ),
    },
    {
      field: 'skillSimple',
      headerName: 'Skill',
      width: 40,
      valueGetter: (_value, row: AgentRow) => fromFixed2(row.skill),
      renderCell: (params: GridRenderCellParams<AgentRow, number>): React.JSX.Element => (
        <span aria-label={`agents-row-skill-simple-${params.id}`}>{params.value ?? 0}</span>
      ),
    },
    {
      field: 'hitPointsMax',
      headerName: 'HP',
      width: 40,
      renderCell: (params: GridRenderCellParams<AgentRow, number>): React.JSX.Element => (
        <span aria-label={`agents-row-hp-${params.id}`}>{params.row.maxHitPoints}</span>
      ),
    },
    {
      field: 'service',
      headerName: 'Service',
      width: 80,
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
      width: 70,
      renderCell: (params: GridRenderCellParams<AgentRow, number>): React.JSX.Element => (
        <span aria-label={`agents-row-missions-total-${params.id}`}>{params.row.missionsTotal}</span>
      ),
    },
    {
      field: 'mission',
      headerName: 'Mission',
      width: 220,
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
      width: 180,
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
}
