import { createRowSelectionManager, type GridRowId, type GridRowSelectionModel } from '@mui/x-data-grid'
import * as React from 'react'
import { useAppDispatch, useAppSelector } from '../../redux/hooks'
import type { Agent } from '../../lib/model/agentModel'
import { clearAgentSelection, setAgentSelection } from '../../redux/slices/selectionSlice'
import { DataGridCard } from '../Common/DataGridCard'
import { AgentsToolbar } from './AgentsToolbar'
import { filterAgentRows, filterVisibleAgentColumns } from './AgentsDataGridUtils'
import { getAgentsColumns } from './getAgentsColumns'

export type AgentRow = Agent & {
  // row id for DataGrid (required by MUI DataGrid)
  // https://mui.com/x/react-data-grid/row-definition/
  rowId: number
}

export function AgentsDataGrid(): React.JSX.Element {
  const dispatch = useAppDispatch()
  const gameState = useAppSelector((state) => state.undoable.present.gameState)
  const agentSelection = useAppSelector((state) => state.selection.agents)
  const [showOnlyTerminated, setShowOnlyTerminated] = React.useState(false)
  const [showOnlyAvailable, setShowOnlyAvailable] = React.useState(false)
  const [showRecovering, setShowRecovering] = React.useState(false)
  const [showStats, setShowStats] = React.useState(false)

  // Handlers that enforce mutual exclusivity: only one checkbox can be selected at a time
  function handleToggleAvailable(checked: boolean): void {
    setShowOnlyAvailable(checked)
    if (checked) {
      setShowOnlyTerminated(false)
      setShowRecovering(false)
      setShowStats(false)
    }
  }

  function handleToggleTerminated(checked: boolean): void {
    setShowOnlyTerminated(checked)
    if (checked) {
      setShowOnlyAvailable(false)
      setShowRecovering(false)
      setShowStats(false)
      dispatch(clearAgentSelection())
    }
  }

  function handleToggleRecovering(checked: boolean): void {
    setShowRecovering(checked)
    if (checked) {
      setShowOnlyTerminated(false)
      setShowOnlyAvailable(false)
      setShowStats(false)
      dispatch(clearAgentSelection())
    }
  }

  function handleToggleStats(checked: boolean): void {
    setShowStats(checked)
    if (checked) {
      setShowOnlyTerminated(false)
      setShowOnlyAvailable(false)
      setShowRecovering(false)
      dispatch(clearAgentSelection())
    }
  }

  // Get IDs of agents terminated during the last turn advancement from turnStartReport
  const agentsReport = gameState.turnStartReport?.assets.agentsReport
  const terminatedIds = agentsReport && 'terminatedAgentIds' in agentsReport ? agentsReport.terminatedAgentIds : []
  const agentsTerminatedThisTurnIds = new Set<string>(terminatedIds)

  // Transform agents array to include rowId for DataGrid
  const allRows: AgentRow[] = gameState.agents.map((agent, index) => ({
    ...agent,
    rowId: index,
  }))

  // Apply filtering based on checkboxes
  const rows: AgentRow[] = filterAgentRows(
    allRows,
    showOnlyTerminated,
    showOnlyAvailable,
    showRecovering,
    agentsTerminatedThisTurnIds,
  )

  const columns = getAgentsColumns(rows, gameState.missionSites, gameState.turn, gameState.hitPointsRecoveryPct)
  const visibleColumns = filterVisibleAgentColumns(columns, showOnlyTerminated, showRecovering, showStats)

  function handleRowSelectionChange(newSelectionModel: GridRowSelectionModel): void {
    const agentIds: string[] = []
    const mgr = createRowSelectionManager(newSelectionModel)

    const existingRowIds = rows.map((row) => row.rowId)
    const includedRowIds = existingRowIds.filter((id) => mgr.has(id))

    for (const rowId of includedRowIds) {
      // Find the visible row whose stable rowId matches the selected id
      const row = rows.find((rowItem) => rowItem.rowId === rowId)
      if (row) {
        agentIds.push(row.id)
      } else {
        throw new Error(`Agent not found for rowId: ${rowId}`)
      }
    }

    dispatch(setAgentSelection(agentIds))
  }

  // Convert agent IDs from state back to row IDs for DataGrid
  const rowIds: GridRowId[] = []
  for (const agentId of agentSelection) {
    // Find the visible row that contains this agent ID
    const row = rows.find((rowCandidate) => rowCandidate.id === agentId)
    if (row) {
      // Use the stable rowId provided to DataGrid via getRowId
      rowIds.push(row.rowId)
    }
  }

  const idsSet = new Set<GridRowId>(rowIds)
  const model: GridRowSelectionModel = { type: 'include', ids: idsSet }

  // Disable row selection when recovering, stats, or terminated views are active
  const isSelectionDisabled = showRecovering || showStats || showOnlyTerminated

  return (
    <DataGridCard
      title="Agents"
      rows={rows}
      columns={visibleColumns}
      getRowId={(row: AgentRow) => row.rowId}
      checkboxSelection={!isSelectionDisabled}
      onRowSelectionModelChange={handleRowSelectionChange}
      rowSelectionModel={model}
      slots={{ toolbar: AgentsToolbar }}
      slotProps={{
        toolbar: {
          showOnlyTerminated,
          onToggleTerminated: handleToggleTerminated,
          showOnlyAvailable,
          onToggleAvailable: handleToggleAvailable,
          showRecovering,
          onToggleRecovering: handleToggleRecovering,
          showStats,
          onToggleStats: handleToggleStats,
        },
      }}
      showToolbar
    />
  )
}
