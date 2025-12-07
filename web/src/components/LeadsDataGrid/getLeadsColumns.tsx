import type { GridColDef, GridRenderCellParams } from '@mui/x-data-grid'
import * as React from 'react'
import { assertColumnWidth } from '../Common/assertColumnWidth'
import {
  LEADS_DIFFICULTY_WIDTH,
  LEADS_ID_WIDTH,
  LEADS_INVESTIGATIONS_WIDTH,
  LEADS_REPEATABLE_WIDTH,
} from '../Common/columnWidths'
import { EXPECTED_LEADS_COLUMN_WIDTH } from '../Common/widthConstants'
import type { LeadRow } from './LeadsDataGrid'

export function getLeadsColumns(): GridColDef<LeadRow>[] {
  const columns: GridColDef<LeadRow>[] = [
    {
      field: 'id',
      headerName: 'Lead ID',
      width: LEADS_ID_WIDTH,
      renderCell: (params: GridRenderCellParams<LeadRow, string>) => (
        <span aria-label={`leads-row-id-${params.id}`}>{params.value}</span>
      ),
    },
    {
      field: 'difficulty',
      headerName: 'Difficulty',
      width: LEADS_DIFFICULTY_WIDTH,
      renderCell: (params: GridRenderCellParams<LeadRow, number>) => (
        <span aria-label={`leads-row-difficulty-${params.id}`}>{params.value}</span>
      ),
    },
    {
      field: 'repeatable',
      headerName: 'Repeatable',
      width: LEADS_REPEATABLE_WIDTH,
      renderCell: (params: GridRenderCellParams<LeadRow, boolean>) => (
        <span aria-label={`leads-row-repeatable-${params.id}`}>{params.value === true ? 'Yes' : 'No'}</span>
      ),
    },
    {
      field: 'investigations',
      headerName: 'Investigations',
      width: LEADS_INVESTIGATIONS_WIDTH,
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

  assertColumnWidth(columns, EXPECTED_LEADS_COLUMN_WIDTH, 'Leads')

  return columns
}
