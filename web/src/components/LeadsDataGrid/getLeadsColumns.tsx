import type { GridColDef, GridRenderCellParams } from '@mui/x-data-grid'
import * as React from 'react'
import { assertColumnWidth } from '../Common/assertColumnWidth'
import type { LeadRow } from './LeadsDataGrid'

const EXPECTED_TOTAL_COLUMN_WIDTH = 620

export function getLeadsColumns(): GridColDef<LeadRow>[] {
  const columns: GridColDef<LeadRow>[] = [
    {
      field: 'id',
      headerName: 'Lead ID',
      width: 300,
      renderCell: (params: GridRenderCellParams<LeadRow, string>) => (
        <span aria-label={`leads-row-id-${params.id}`}>{params.value}</span>
      ),
    },
    {
      field: 'difficulty',
      headerName: 'Difficulty',
      width: 100,
      renderCell: (params: GridRenderCellParams<LeadRow, number>) => (
        <span aria-label={`leads-row-difficulty-${params.id}`}>{params.value}</span>
      ),
    },
    {
      field: 'repeatable',
      headerName: 'Repeatable',
      width: 100,
      renderCell: (params: GridRenderCellParams<LeadRow, boolean>) => (
        <span aria-label={`leads-row-repeatable-${params.id}`}>{params.value === true ? 'Yes' : 'No'}</span>
      ),
    },
    {
      field: 'investigations',
      headerName: 'Investigations',
      width: 120,
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

  assertColumnWidth(columns, EXPECTED_TOTAL_COLUMN_WIDTH, 'Leads')

  return columns
}
