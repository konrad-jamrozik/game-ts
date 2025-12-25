import type { GridColDef, GridRenderCellParams } from '@mui/x-data-grid'
import * as React from 'react'
import { columnWidths } from '../Common/columnWidths'
import type { LeadRow } from './LeadsDataGrid'
import { fmtForDisplay } from '../../lib/model_utils/formatUtils'

export function getLeadsColumns(): GridColDef<LeadRow>[] {
  const columns: GridColDef<LeadRow>[] = [
    {
      field: 'id',
      headerName: 'Lead',
      width: columnWidths['leads.id'],
      renderCell: (params: GridRenderCellParams<LeadRow, string>): React.JSX.Element => {
        const displayValue = fmtForDisplay(params.row.id)
        return <span aria-label={`leads-row-id-${params.id}`}>{displayValue}</span>
      },
    },
    {
      field: 'difficulty',
      headerName: 'Difficulty',
      width: columnWidths['leads.difficulty'],
      renderCell: (params: GridRenderCellParams<LeadRow, number>) => (
        <span aria-label={`leads-row-difficulty-${params.id}`}>{params.value}</span>
      ),
    },
    {
      field: 'repeatable',
      headerName: 'Rpt.',
      width: columnWidths['leads.repeatable'],
      renderCell: (params: GridRenderCellParams<LeadRow, boolean>) => (
        <span aria-label={`leads-row-repeatable-${params.id}`}>{params.value === true ? 'Yes' : 'No'}</span>
      ),
    },
    {
      field: 'investigations',
      headerName: 'Investigation',
      width: columnWidths['leads.investigations'],
      renderCell: (params: GridRenderCellParams<LeadRow>): React.JSX.Element => {
        const { activeInvestigationCount, doneInvestigationCount } = params.row
        if (activeInvestigationCount === 0 && doneInvestigationCount === 0) {
          return <span aria-label={`leads-row-investigations-${params.id}`}>None</span>
        }
        const parts: string[] = []
        if (activeInvestigationCount > 0) {
          parts.push(activeInvestigationCount === 1 ? 'Active' : `${activeInvestigationCount} Active`)
        }
        if (doneInvestigationCount > 0) {
          parts.push(doneInvestigationCount === 1 ? 'Done' : `${doneInvestigationCount} Done`)
        }
        return <span aria-label={`leads-row-investigations-${params.id}`}>{parts.join(', ')}</span>
      },
    },
  ]

  return columns
}
