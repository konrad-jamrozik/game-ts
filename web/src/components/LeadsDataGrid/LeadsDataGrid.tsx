import {
  createRowSelectionManager,
  type GridRowId,
  type GridRowParams,
  type GridRowSelectionModel,
} from '@mui/x-data-grid'
import * as React from 'react'
import { useAppDispatch, useAppSelector } from '../../redux/hooks'
import { dataTables } from '../../lib/data_tables/dataTables'
import { clearInvestigationSelection, clearLeadSelection, setLeadSelection } from '../../redux/slices/selectionSlice'
import { DataGridCard } from '../Common/DataGridCard'
import { LeadsDataGridToolbar } from './LeadsDataGridToolbar'
import { getLeadsColumns, type LeadRow } from './getLeadsColumns'
import { MIDDLE_COLUMN_CARD_WIDTH } from '../Common/widthConstants'
import {
  isFactionForLeadTerminated,
  parseNegatedDependencies,
  getNegatedDepStatus,
  type ParsedDependencies,
} from '../../lib/model_utils/leadUtils'
import { calculateLeadCounts } from './leadCounts'
import { LeadsDataGridTitle } from './LeadsDataGridTitle'

export function LeadsDataGrid(): React.JSX.Element {
  const dispatch = useAppDispatch()
  const selectedLeadId = useAppSelector((state) => state.selection.selectedLeadId)
  const gameState = useAppSelector((state) => state.undoable.present.gameState)
  const { leadInvestigationCounts, leadInvestigations, missions, factions } = gameState
  const [filterType, setFilterType] = React.useState<'active' | 'inactive' | 'archived'>('active')

  // Get mission data IDs that have won missions
  const wonMissionDataIds = new Set<string>(missions.filter((m) => m.state === 'Won').map((m) => m.missionDataId))

  // Filter out leads that have unmet regular dependencies (negated dependencies don't affect discovery)
  const discoveredLeads = dataTables.leads.filter((lead): boolean => {
    const parsed: ParsedDependencies = parseNegatedDependencies(lead.dependsOn)
    return parsed.regular.every(
      (dependencyId: string): boolean =>
        (leadInvestigationCounts[dependencyId] ?? 0) > 0 || wonMissionDataIds.has(dependencyId),
    )
  })

  // Transform all discovered leads to rows (active, inactive, and archived)
  const allRows: LeadRow[] = discoveredLeads.map((lead, index) => {
    const investigationsForLead = Object.values(leadInvestigations).filter(
      (investigation) => investigation.leadId === lead.id,
    )

    const hasActiveInvestigation = investigationsForLead.some((inv) => inv.state === 'Active')
    const hasDoneInvestigation = investigationsForLead.some((inv) => inv.state === 'Done')
    const activeInvestigationCount = investigationsForLead.filter((inv) => inv.state === 'Active').length
    const doneInvestigationCount = investigationsForLead.filter((inv) => inv.state === 'Done').length

    // Check negated dependencies
    const parsed: ParsedDependencies = parseNegatedDependencies(lead.dependsOn)
    const negatedStatus = getNegatedDepStatus(parsed.negated, missions)

    // Determine if lead is archived:
    // - Non-repeatable leads with done investigations are archived
    // - Leads for terminated factions are archived
    // - Negated dependency mission is Won
    const isFactionTerminated = isFactionForLeadTerminated(lead, factions, leadInvestigationCounts)
    const isArchived = (!lead.repeatable && hasDoneInvestigation) || isFactionTerminated || negatedStatus === 'archived'

    // Determine if lead is inactive:
    // - Negated dependency mission is Active or Deployed (and not archived)
    const isInactive = negatedStatus === 'inactive' && !isArchived

    return {
      rowId: index,
      id: lead.id,
      name: lead.name,
      difficulty: lead.difficulty,
      repeatable: lead.repeatable,
      hasActiveInvestigation,
      hasDoneInvestigation,
      isArchived,
      isInactive,
      activeInvestigationCount,
      doneInvestigationCount,
    }
  })

  // Filter rows based on filter type: show ONLY the selected type
  const rows: LeadRow[] = allRows.filter((row): boolean => {
    if (filterType === 'active') {
      return !row.isArchived && !row.isInactive
    }
    if (filterType === 'inactive') {
      return row.isInactive
    }
    // filterType === 'archived'
    return row.isArchived
  })

  const columns = getLeadsColumns()

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

  const leadCounts = calculateLeadCounts(
    discoveredLeads,
    leadInvestigations,
    factions,
    leadInvestigationCounts,
    missions,
  )
  const title = <LeadsDataGridTitle counts={leadCounts} />

  return (
    <DataGridCard
      id="leads"
      title={title}
      width={MIDDLE_COLUMN_CARD_WIDTH}
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
          filterType,
          onFilterTypeChange: setFilterType,
        },
      }}
      showToolbar
    />
  )
}

// Check if a row is disabled (same logic as LeadCard for normal displayMode)
function isRowDisabled(row: LeadRow): boolean {
  // For normal displayMode leads:
  // - Repeatable: disabled if hasActiveInvestigation (only 1 active investigation at a time)
  // - Non-repeatable: disabled if hasActiveInvestigation OR hasDoneInvestigation
  return row.hasActiveInvestigation || (!row.repeatable && row.hasDoneInvestigation)
}
