import type { GridColDef, GridRenderCellParams } from '@mui/x-data-grid'
import * as React from 'react'
import { fmtDec1, fmtDec1Diff } from '../../lib/primitives/formatPrimitives'
import { fmtIdForDisplay } from '../../lib/model_utils/formatUtils'
import type { GameState } from '../../lib/model/gameStateModel'
import type { LeadInvestigationId } from '../../lib/model/modelIds'
import type { LeadInvestigationState } from '../../lib/model/outcomeTypes'
import { columnWidths } from '../Common/columnWidths'
import { MyChip } from '../Common/MyChip'
import { ceil, floor } from '../../lib/primitives/mathPrimitives'

export type LeadInvestigationRow = {
  id: LeadInvestigationId
  rowId: number
  name: string
  progress: number
  difficulty: number
  successChanceLower: number
  successChanceUpper: number
  agents: number
  agentsInTransit: number
  startTurn: number
  projectedProgress: number
  progressDiff: number
  teamEfficiency: number
  state: LeadInvestigationState
  completedThisTurn: boolean
}

export function getLeadInvestigationsColumns(gameState: GameState): GridColDef<LeadInvestigationRow>[] {
  const columns: GridColDef<LeadInvestigationRow>[] = [
    {
      field: 'name',
      headerName: 'Investigation',
      width: columnWidths['lead_investigations.name'],
      valueGetter: (_value, row: LeadInvestigationRow): string =>
        // Return the name field which already includes faction name for "Interrogate member" leads
        row.name,
      renderCell: (params: GridRenderCellParams<LeadInvestigationRow, string>): React.JSX.Element => {
        const displayValue = fmtIdForDisplay(params.row.id, gameState)
        return <span aria-label={`lead-investigations-row-name-${params.id}`}>{displayValue}</span>
      },
    },
    {
      field: 'agents',
      headerName: 'Ag #',
      width: columnWidths['lead_investigations.agents'],
      renderCell: (params: GridRenderCellParams<LeadInvestigationRow>): React.JSX.Element => {
        const { agents: activeAgentCount, agentsInTransit } = params.row
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>{activeAgentCount}</span>
            {agentsInTransit > 0 && <MyChip chipValue={`+${agentsInTransit}`} />}
          </div>
        )
      },
    },
    {
      field: 'successChanceRange',
      headerName: 'Succ %',
      width: columnWidths['lead_investigations.success_chance_range'],
      renderCell: (params: GridRenderCellParams<LeadInvestigationRow>): React.JSX.Element => {
        if (params.row.state === 'Done') {
          return <MyChip chipValue="Done" />
        }
        if (params.row.state === 'Abandoned') {
          return <MyChip chipValue="Abandoned" reverseColor={true} />
        }
        return <span>{fmtSuccessChanceRange(params.row.successChanceLower, params.row.successChanceUpper)}</span>
      },
    },
    {
      field: 'progress',
      headerName: 'Progress',
      width: columnWidths['lead_investigations.progress'],
      type: 'number',
      renderCell: (params: GridRenderCellParams<LeadInvestigationRow>): React.JSX.Element => (
        <span>{fmtProgress(params.row.progress, params.row.difficulty)}</span>
      ),
    },
    {
      field: 'projectedProgress',
      headerName: 'Proj.',
      width: columnWidths['lead_investigations.projected_progress'],
      renderCell: (params: GridRenderCellParams<LeadInvestigationRow>): React.JSX.Element => {
        const { progress, difficulty, projectedProgress, teamEfficiency } = params.row
        const progressDiffFmt = fmtDec1Diff(progress, projectedProgress)
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>{fmtProgress(projectedProgress, difficulty)}</span>
            {progressDiffFmt !== undefined && <MyChip chipValue={progressDiffFmt} />}
            {progressDiffFmt !== undefined && <MyChip chipValue={`eff. ${fmtPctInt(teamEfficiency)}`} />}
          </div>
        )
      },
    },
  ]

  return columns
}

function fmtProgress(progress: number, difficulty: number): string {
  return `${fmtDec1(progress)}/${fmtDec1(difficulty)}`
}

function fmtSuccessChanceRange(lower: number, upper: number): string {
  return `~${floor(lower * 100)}% - ~${ceil(upper * 100)}%`
}

function fmtPctInt(value: number): string {
  return `${floor(value * 100)}%`
}
