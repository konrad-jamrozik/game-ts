import {
  createRowSelectionManager,
  type GridColDef,
  type GridRenderCellParams,
  type GridRowId,
  type GridRowParams,
  type GridRowSelectionModel,
} from '@mui/x-data-grid'
import * as React from 'react'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import { leads } from '../lib/collections/leads'
import { clearInvestigationSelection, clearLeadSelection, setLeadSelection } from '../lib/slices/selectionSlice'
import { DataGridCard } from '../Common/DataGridCard'
import { LeadsDataGridToolbar } from './LeadsDataGridToolbar'

export type LeadRow = {
  rowId: number
  id: string
  title: string
  difficulty: number
  repeatable: boolean
  hasActiveInvestigation: boolean
  hasSuccessfulInvestigation: boolean
  isArchived: boolean
  activeInvestigationCount: number
  completedInvestigationCount: number
}

export function LeadsDataGrid(): React.JSX.Element {
  const dispatch = useAppDispatch()
  const selectedLeadId = useAppSelector((state) => state.selection.selectedLeadId)
  const leadInvestigationCounts = useAppSelector((state) => state.undoable.present.gameState.leadInvestigationCounts)
  const leadInvestigations = useAppSelector((state) => state.undoable.present.gameState.leadInvestigations)
  const missionSites = useAppSelector((state) => state.undoable.present.gameState.missionSites)
  const [showArchived, setShowArchived] = React.useState(false)

  // Get mission IDs that have successful mission sites
  const successfulMissionIds = new Set(
    missionSites.filter((site) => site.state === 'Successful').map((site) => site.missionId),
  )

  // Filter out leads that have unmet dependencies (same logic as LeadCards)
  const discoveredLeads = leads.filter((lead) =>
    lead.dependsOn.every(
      (dependencyId) => (leadInvestigationCounts[dependencyId] ?? 0) > 0 || successfulMissionIds.has(dependencyId),
    ),
  )

  // Transform all discovered leads to rows (both active and archived)
  const allRows: LeadRow[] = discoveredLeads.map((lead, index) => {
    const investigationsForLead = Object.values(leadInvestigations).filter(
      (investigation) => investigation.leadId === lead.id,
    )

    const hasActiveInvestigation = investigationsForLead.some((inv) => inv.state === 'Active')
    const hasSuccessfulInvestigation = investigationsForLead.some((inv) => inv.state === 'Successful')
    const activeInvestigationCount = investigationsForLead.filter((inv) => inv.state === 'Active').length
    const completedInvestigationCount = investigationsForLead.filter((inv) => inv.state === 'Successful').length

    // Determine if lead is archived:
    // - Only non-repeatable leads with successful investigations are archived
    const isArchived = !lead.repeatable && hasSuccessfulInvestigation

    return {
      rowId: index,
      id: lead.id,
      title: lead.title,
      difficulty: lead.difficulty,
      repeatable: lead.repeatable,
      hasActiveInvestigation,
      hasSuccessfulInvestigation,
      isArchived,
      activeInvestigationCount,
      completedInvestigationCount,
    }
  })

  // Filter rows based on archived checkbox: show ONLY archived when checked, ONLY non-archived when unchecked
  const rows: LeadRow[] = allRows.filter((row) => (showArchived ? row.isArchived : !row.isArchived))

  const columns = createLeadColumns()

  function handleRowSelectionChange(newSelectionModel: GridRowSelectionModel): void {
    const mgr = createRowSelectionManager(newSelectionModel)
    const existingRowIds = rows.map((row) => row.rowId)
    const selectedRowIds = existingRowIds.filter((id) => mgr.has(id))

    if (selectedRowIds.length === 0) {
      dispatch(clearLeadSelection())
    } else {
      // We assume disableMultipleRowSelection, so we assume there is exactly one rowId in selectedRowIds
      const [rowId] = selectedRowIds
      const row = rows.find((rowItem) => rowItem.rowId === rowId)
      if (row && !isRowDisabled(row)) {
        // Only allow selection of non-disabled leads
        // Clear investigation selection when lead is selected (same as LeadCard)
        dispatch(clearInvestigationSelection())
        dispatch(setLeadSelection(row.id))
      } else {
        // If trying to select a disabled lead, clear selection
        dispatch(clearLeadSelection())
      }
    }
  }

  // Convert selected lead ID back to row ID for DataGrid
  // Clear selection if selected row is not in currently displayed rows
  const rowIds: GridRowId[] = []
  if (selectedLeadId !== undefined) {
    const row = rows.find((rowCandidate) => rowCandidate.id === selectedLeadId)
    if (row) {
      rowIds.push(row.rowId)
    } else {
      // Selected row is not in currently displayed rows, clear selection
      dispatch(clearLeadSelection())
    }
  }

  const idsSet = new Set<GridRowId>(rowIds)
  const model: GridRowSelectionModel = { type: 'include', ids: idsSet }

  return (
    <DataGridCard
      title={`Leads (${rows.length})`}
      rows={rows}
      columns={columns}
      getRowId={(row: LeadRow) => row.rowId}
      checkboxSelection
      disableMultipleRowSelection
      onRowSelectionModelChange={handleRowSelectionChange}
      rowSelectionModel={model}
      isRowSelectable={(params: GridRowParams<LeadRow>) => !isRowDisabled(params.row)}
      slots={{ toolbar: LeadsDataGridToolbar }}
      slotProps={{
        toolbar: {
          showArchived,
          onToggleArchived: setShowArchived,
        },
      }}
      showToolbar
    />
  )
}

function createLeadColumns(): GridColDef<LeadRow>[] {
  return [
    {
      field: 'id',
      headerName: 'Lead ID',
      minWidth: 300,
      renderCell: (params: GridRenderCellParams<LeadRow, string>) => (
        <span aria-label={`leads-row-id-${params.id}`}>{params.value}</span>
      ),
    },
    {
      field: 'difficulty',
      headerName: 'Difficulty',
      minWidth: 100,
      renderCell: (params: GridRenderCellParams<LeadRow, number>) => (
        <span aria-label={`leads-row-difficulty-${params.id}`}>{params.value}</span>
      ),
    },
    {
      field: 'repeatable',
      headerName: 'Repeatable',
      minWidth: 100,
      renderCell: (params: GridRenderCellParams<LeadRow, boolean>) => (
        <span aria-label={`leads-row-repeatable-${params.id}`}>{params.value === true ? 'Yes' : 'No'}</span>
      ),
    },
    {
      field: 'investigations',
      headerName: 'Investigations',
      minWidth: 200,
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
}

// Check if a row is disabled (same logic as LeadCard for normal displayMode)
function isRowDisabled(row: LeadRow): boolean {
  // For normal displayMode leads:
  // - Repeatable: never disabled
  // - Non-repeatable: disabled if hasActiveInvestigation OR hasSuccessfulInvestigation
  return !row.repeatable && (row.hasActiveInvestigation || row.hasSuccessfulInvestigation)
}
