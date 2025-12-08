import type { GridColDef, GridRenderCellParams } from '@mui/x-data-grid'
import * as React from 'react'
import { columnWidths } from '../Common/columnWidths'
import type { LeadRow } from './LeadsDataGrid'

export function getLeadsColumns(): GridColDef<LeadRow>[] {
  const columns: GridColDef<LeadRow>[] = [
    {
      field: 'id',
      headerName: 'Lead ID',
      width: columnWidths['leads.id'],
      renderCell: (params: GridRenderCellParams<LeadRow, string>) => (
        <span aria-label={`leads-row-id-${params.id}`}>{params.value}</span>
      ),
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
      headerName: 'Repeatable',
      width: columnWidths['leads.repeatable'],
      renderCell: (params: GridRenderCellParams<LeadRow, boolean>) => (
        <span aria-label={`leads-row-repeatable-${params.id}`}>{params.value === true ? 'Yes' : 'No'}</span>
      ),
    },
    {
      field: 'investigations',
      headerName: 'Investigations',
      width: columnWidths['leads.investigations'],
      renderCell: (params: GridRenderCellParams<LeadRow>): React.JSX.Element => {
        const { activeInvestigationCount, completedInvestigationCount } = params.row
        if (activeInvestigationCount === 0 && completedInvestigationCount === 0) {
          return <span aria-label={`leads-row-investigations-${params.id}`}>None</span>
        }
        const parts: string[] = []
        if (activeInvestigationCount > 0) {
          parts.push(`${activeInvestigationCount} active`)
        }
        if (completedInvestigationCount > 0) {
          parts.push(`${completedInvestigationCount} completed`)
        }
        return <span aria-label={`leads-row-investigations-${params.id}`}>{parts.join(', ')}</span>
      },
    },
  ]

  return columns
}
