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
import { DataGridCard } from './DataGridCard'

export type LeadRow = {
  rowId: number
  id: string
  title: string
  difficulty: number
  repeatable: boolean
  hasActiveInvestigation: boolean
  hasSuccessfulInvestigation: boolean
}

function createLeadColumns(): GridColDef<LeadRow>[] {
  return [
    {
      field: 'id',
      headerName: 'ID',
      minWidth: 200,
      renderCell: (params: GridRenderCellParams<LeadRow, string>) => (
        <span aria-label={`leads-row-id-${params.id}`}>{params.value}</span>
      ),
    },
    {
      field: 'title',
      headerName: 'Title',
      minWidth: 200,
      renderCell: (params: GridRenderCellParams<LeadRow, string>) => (
        <span aria-label={`leads-row-title-${params.id}`}>{params.value}</span>
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
        <span aria-label={`leads-row-repeatable-${params.id}`}>{params.value ? 'Yes' : 'No'}</span>
      ),
    },
  ]
}

export function LeadsDataGrid(): React.JSX.Element {
  const dispatch = useAppDispatch()
  const selectedLeadId = useAppSelector((state) => state.selection.selectedLeadId)
  const leadInvestigationCounts = useAppSelector((state) => state.undoable.present.gameState.leadInvestigationCounts)
  const leadInvestigations = useAppSelector((state) => state.undoable.present.gameState.leadInvestigations)
  const missionSites = useAppSelector((state) => state.undoable.present.gameState.missionSites)

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

  // Filter leads to show (same logic as LeadCards - only normal displayMode leads)
  const leadsToShow = discoveredLeads.filter((lead) => {
    // Get all investigations for this lead
    const investigationsForLead = Object.values(leadInvestigations).filter(
      (investigation) => investigation.leadId === lead.id,
    )

    const hasSuccessfulInvestigation = investigationsForLead.some((inv) => inv.state === 'Successful')

    if (lead.repeatable) {
      // Repeatable leads: always show
      return true
    } else {
      // Non-repeatable leads: show if no successful investigation
      return !hasSuccessfulInvestigation
    }
  })

  // Transform leads to rows
  const rows: LeadRow[] = leadsToShow.map((lead, index) => {
    const investigationsForLead = Object.values(leadInvestigations).filter(
      (investigation) => investigation.leadId === lead.id,
    )

    const hasActiveInvestigation = investigationsForLead.some((inv) => inv.state === 'Active')
    const hasSuccessfulInvestigation = investigationsForLead.some((inv) => inv.state === 'Successful')

    return {
      rowId: index,
      id: lead.id,
      title: lead.title,
      difficulty: lead.difficulty,
      repeatable: lead.repeatable,
      hasActiveInvestigation,
      hasSuccessfulInvestigation,
    }
  })

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

  // Check if a row is disabled (same logic as LeadCard for normal displayMode)
  function isRowDisabled(row: LeadRow): boolean {
    // For normal displayMode leads:
    // - Repeatable: never disabled
    // - Non-repeatable: disabled if hasActiveInvestigation OR hasSuccessfulInvestigation
    return !row.repeatable && (row.hasActiveInvestigation || row.hasSuccessfulInvestigation)
  }

  // Convert selected lead ID back to row ID for DataGrid
  const rowIds: GridRowId[] = []
  if (selectedLeadId !== undefined) {
    const row = rows.find((rowCandidate) => rowCandidate.id === selectedLeadId)
    if (row) {
      rowIds.push(row.rowId)
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
    />
  )
}
