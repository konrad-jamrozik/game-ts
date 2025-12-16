import type { GridColDef, GridRenderCellParams } from '@mui/x-data-grid'
import * as React from 'react'
import { fmtDec1, fmtDec1Diff, fmtPctDec2 } from '../../lib/primitives/formatPrimitives'
import { fmtForDisplay } from '../../lib/model_utils/formatModelUtils'
import type { GameState } from '../../lib/model/gameStateModel'
import { columnWidths } from '../Common/columnWidths'
import { MyChip } from '../Common/MyChip'
import type { LeadInvestigationRow } from './LeadInvestigationsDataGrid'

export function getLeadInvestigationsColumns(gameState: GameState): GridColDef<LeadInvestigationRow>[] {
  const columns: GridColDef<LeadInvestigationRow>[] = [
    {
      field: 'name',
      headerName: 'Investigation',
      width: columnWidths['lead_investigations.name'],
      renderCell: (params: GridRenderCellParams<LeadInvestigationRow, string>): React.JSX.Element => {
        const displayValue = fmtForDisplay(params.row.id, gameState)
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
      field: 'successChance',
      headerName: 'Succ %',
      width: columnWidths['lead_investigations.success_chance'],
      renderCell: (params: GridRenderCellParams<LeadInvestigationRow>): React.JSX.Element => {
        if (params.row.state === 'Done') {
          return <MyChip chipValue="Done" />
        }
        if (params.row.state === 'Abandoned') {
          return <MyChip chipValue="Abandoned" reverseColor={true} />
        }
        return <span>{fmtPctDec2(params.row.successChance)}</span>
      },
    },
    {
      field: 'intel',
      headerName: 'Intel',
      width: columnWidths['lead_investigations.intel'],
      type: 'number',
      renderCell: (params: GridRenderCellParams<LeadInvestigationRow>): React.JSX.Element => (
        <span>{fmtDec1(params.row.intel)}</span>
      ),
    },

    {
      field: 'resistance',
      headerName: 'Resistance',
      width: columnWidths['lead_investigations.resistance'],
      renderCell: (params: GridRenderCellParams<LeadInvestigationRow>): React.JSX.Element => (
        <span>{fmtPctDec2(params.row.resistance)}</span>
      ),
    },
    {
      field: 'projectedIntel',
      headerName: 'Proj. intel',
      width: columnWidths['lead_investigations.projected_intel'],
      renderCell: (params: GridRenderCellParams<LeadInvestigationRow>): React.JSX.Element => {
        const { intel, projectedIntel } = params.row
        const intelDiffFmt = fmtDec1Diff(intel, projectedIntel)
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>{fmtDec1(projectedIntel)}</span>
            {intelDiffFmt !== undefined && <MyChip chipValue={intelDiffFmt} />}
          </div>
        )
      },
    },
  ]

  return columns
}
