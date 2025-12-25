import {
  createRowSelectionManager,
  type GridRowId,
  type GridRowParams,
  type GridRowSelectionModel,
} from '@mui/x-data-grid'
import * as React from 'react'
import { useAppDispatch, useAppSelector } from '../../redux/hooks'
import { getLeadById } from '../../lib/data_table_utils/getterUtils'
import { investigatingAgents, inTransitWithAssignmentId } from '../../lib/model_utils/agentUtils'
import { fmtForDisplay } from '../../lib/data_table_utils/formatUtils'
import type { Agent } from '../../lib/model/agentModel'
import type { GameState } from '../../lib/model/gameStateModel'
import type { LeadInvestigation } from '../../lib/model/leadModel'
import type { LeadInvestigationId } from '../../lib/model/modelIds'
import type { LeadInvestigationState } from '../../lib/model/outcomeTypes'
import { getLeadIntelFromAgents, getLeadResistance, getLeadSuccessChance } from '../../lib/ruleset/leadRuleset'
import {
  clearInvestigationSelection,
  clearLeadSelection,
  setInvestigationSelection,
} from '../../redux/slices/selectionSlice'
import { filterLeadInvestigationRows } from './LeadInvestigationsDataGridUtils'
import { getCompletedInvestigationIds } from '../../lib/model_utils/turnReportUtils'
import { MIDDLE_COLUMN_CARD_WIDTH } from '../Common/widthConstants'
import { ExpandableCard } from '../Common/ExpandableCard'
import { LeadInvestigationsToolbar } from './LeadInvestigationsToolbar'
import { StyledDataGrid } from '../Common/StyledDataGrid'
import { getLeadInvestigationsColumns } from './getLeadInvestigationsColumns'

export type LeadInvestigationRow = {
  id: LeadInvestigationId
  rowId: number
  name: string
  intel: number
  successChance: number
  agents: number
  agentsInTransit: number
  startTurn: number
  resistance: number
  projectedIntel: number
  intelDiff: number
  state: LeadInvestigationState
  completedThisTurn: boolean
}

export function LeadInvestigationsDataGrid(): React.JSX.Element {
  const dispatch = useAppDispatch()
  const gameState = useAppSelector((state) => state.undoable.present.gameState)
  const { leadInvestigations, agents, turnStartReport } = gameState
  const selectedInvestigationId = useAppSelector((state) => state.selection.selectedInvestigationId)
  const [showActive, setShowActive] = React.useState(true)
  const [showDone, setShowDone] = React.useState(false)
  const [showAbandoned, setShowAbandoned] = React.useState(false)

  const completedThisTurnIds = getCompletedInvestigationIds(turnStartReport)

  const leadInvestigationColumns = getLeadInvestigationsColumns(gameState)

  // Create all rows from investigations
  const allInvestigationRows = bldAllInvestigationRows(leadInvestigations, agents, completedThisTurnIds, gameState)

  // Filter rows based on checkbox states
  const leadInvestigationRows: LeadInvestigationRow[] = filterLeadInvestigationRows(
    allInvestigationRows,
    showActive,
    showDone,
    showAbandoned,
  )

  function handleRowSelectionChange(newSelectionModel: GridRowSelectionModel): void {
    const mgr = createRowSelectionManager(newSelectionModel)
    const existingRowIds = leadInvestigationRows.map((row) => row.rowId)
    const selectedRowIds = existingRowIds.filter((id) => mgr.has(id))

    if (selectedRowIds.length === 0) {
      dispatch(clearInvestigationSelection())
    } else {
      // We assume disableMultipleRowSelection, so we assume there is exactly one rowId in selectedRowIds
      const [rowId] = selectedRowIds
      const row = leadInvestigationRows.find((rowItem) => rowItem.rowId === rowId)
      if (row?.state === 'Active') {
        // Only allow selection of Active investigations
        // Clear lead selection when investigation is selected
        dispatch(clearLeadSelection())
        dispatch(setInvestigationSelection(row.id))
      } else {
        // If trying to select any other investigation, clear selection
        dispatch(clearInvestigationSelection())
      }
    }
  }

  // Convert selected investigation ID back to row ID for DataGrid
  const rowIds: GridRowId[] = []
  if (selectedInvestigationId !== undefined) {
    const row = leadInvestigationRows.find((rowCandidate) => rowCandidate.id === selectedInvestigationId)
    if (row) {
      rowIds.push(row.rowId)
    }
  }

  const idsSet = new Set<GridRowId>(rowIds)
  const model: GridRowSelectionModel = { type: 'include', ids: idsSet }

  return (
    <ExpandableCard
      id="lead-investigations"
      title={`Lead Investigations (${leadInvestigationRows.length})`}
      defaultExpanded={true}
      sx={{ width: MIDDLE_COLUMN_CARD_WIDTH }}
    >
      <StyledDataGrid
        rows={leadInvestigationRows}
        columns={leadInvestigationColumns}
        aria-label="Lead investigations data"
        checkboxSelection
        disableMultipleRowSelection
        onRowSelectionModelChange={handleRowSelectionChange}
        rowSelectionModel={model}
        getRowId={(row: LeadInvestigationRow) => row.rowId}
        isRowSelectable={(params: GridRowParams<LeadInvestigationRow>) => params.row.state === 'Active'}
        slots={{ toolbar: LeadInvestigationsToolbar }}
        slotProps={{
          toolbar: {
            showActive,
            onToggleActive: setShowActive,
            showDone,
            onToggleDone: setShowDone,
            showAbandoned,
            onToggleAbandoned: setShowAbandoned,
          },
        }}
        showToolbar
      />
    </ExpandableCard>
  )
}

function bldAllInvestigationRows(
  leadInvestigations: Record<string, LeadInvestigation>,
  agents: Agent[],
  completedThisTurnIds: Set<string>,
  gameState: GameState,
): LeadInvestigationRow[] {
  return Object.values(leadInvestigations).map((investigation, index) => {
    const lead = getLeadById(investigation.leadId)
    const successChance = getLeadSuccessChance(investigation.accumulatedIntel, lead.difficulty)

    // Count agents actively working on this investigation (OnAssignment state)
    const activeAgents = investigatingAgents(agents, investigation).length

    // Count agents in transit to this investigation
    const agentsInTransit = inTransitWithAssignmentId(agents, investigation.id).length

    // Calculate resistance for all investigations
    const resistance = getLeadResistance(investigation.accumulatedIntel, lead.difficulty)

    // For Successful investigations, skip projected intel calculations
    let projectedIntel: number = investigation.accumulatedIntel
    let intelDiff = 0

    if (investigation.state === 'Active') {
      // Calculate projected intel using Probability Pressure system
      const agentsInvestigating = investigatingAgents(agents, investigation)
      const intelGain = getLeadIntelFromAgents(agentsInvestigating, investigation.accumulatedIntel, lead.difficulty)
      projectedIntel = investigation.accumulatedIntel + intelGain

      // Calculate diff for chip display
      intelDiff = projectedIntel - investigation.accumulatedIntel
    }

    const rowState: LeadInvestigationState =
      investigation.state === 'Active' ? 'Active' : investigation.state === 'Done' ? 'Done' : 'Abandoned'
    const completedThisTurn = completedThisTurnIds.has(investigation.id)

    return {
      id: investigation.id,
      rowId: index,
      name: fmtForDisplay(investigation.id, gameState),
      intel: investigation.accumulatedIntel,
      successChance,
      agents: activeAgents,
      agentsInTransit,
      startTurn: investigation.startTurn,
      resistance,
      projectedIntel,
      intelDiff,
      state: rowState,
      completedThisTurn,
    }
  })
}
