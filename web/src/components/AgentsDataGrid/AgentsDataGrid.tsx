import { createRowSelectionManager, type GridRowId, type GridRowSelectionModel } from '@mui/x-data-grid'
import * as React from 'react'
import { sum } from 'radash'
import { useAppDispatch, useAppSelector } from '../../redux/hooks'
import type { AgentId } from '../../lib/model/modelIds'
import { f6c0, f6max, type Fixed6 } from '../../lib/primitives/fixed6'
import {
  setAgentSelection,
  setAgentsShowTerminated,
  setAgentsShowAvailable,
  setAgentsShowRecovering,
  setAgentsShowStats,
} from '../../redux/slices/selectionSlice'
import { withIds } from '../../lib/model_utils/agentUtils'
import { DataGridCard } from '../Common/DataGridCard'
import { AgentsToolbar } from './AgentsToolbar'
import { filterAgentRows, filterVisibleAgentColumns } from './AgentsDataGridUtils'
import { getAgentsColumns, type AgentRow } from './getAgentsColumns'
import { MIDDLE_COLUMN_CARD_WIDTH } from '../Common/widthConstants'
import { calculateAgentCounts } from './agentCounts'
import { AgentsDataGridTitle } from './AgentsDataGridTitle'
import { calculateCombatRating } from '../../lib/ruleset/combatRatingRuleset'
import { initialAgent } from '../../lib/factories/agentFactory'
import { getCurrentTurnState } from '../../redux/storeUtils'

export function AgentsDataGrid(): React.JSX.Element {
  const dispatch = useAppDispatch()
  const gameState = useAppSelector(getCurrentTurnState)
  const agentSelection = useAppSelector((state) => state.selection.agents)
  const showOnlyTerminated = useAppSelector((state) => state.selection.agentsShowTerminated ?? false)
  const showOnlyAvailable = useAppSelector((state) => state.selection.agentsShowAvailable ?? false)
  const showRecovering = useAppSelector((state) => state.selection.agentsShowRecovering ?? false)
  const showStats = useAppSelector((state) => state.selection.agentsShowStats ?? false)

  // Handlers that enforce mutual exclusivity: only one checkbox can be selected at a time
  function handleToggleAvailable(checked: boolean): void {
    dispatch(setAgentsShowAvailable(checked))
    if (checked) {
      dispatch(setAgentsShowTerminated(false))
      dispatch(setAgentsShowRecovering(false))
      dispatch(setAgentsShowStats(false))
    }
  }

  function handleToggleTerminated(checked: boolean): void {
    dispatch(setAgentsShowTerminated(checked))
    if (checked) {
      dispatch(setAgentsShowAvailable(false))
      dispatch(setAgentsShowRecovering(false))
      dispatch(setAgentsShowStats(false))
    }
  }

  function handleToggleRecovering(checked: boolean): void {
    dispatch(setAgentsShowRecovering(checked))
    if (checked) {
      dispatch(setAgentsShowTerminated(false))
      dispatch(setAgentsShowAvailable(false))
      dispatch(setAgentsShowStats(false))
    }
  }

  function handleToggleStats(checked: boolean): void {
    dispatch(setAgentsShowStats(checked))
    if (checked) {
      dispatch(setAgentsShowTerminated(false))
      dispatch(setAgentsShowAvailable(false))
      dispatch(setAgentsShowRecovering(false))
    }
  }

  // Get IDs of agents terminated during the last turn advancement from turnStartReport
  const agentsReport = gameState.turnStartReport?.assets.agentsReport
  const terminatedIds = agentsReport && 'terminatedAgentIds' in agentsReport ? agentsReport.terminatedAgentIds : []
  const agentsTerminatedThisTurnIds = new Set<string>(terminatedIds)

  // Merge alive and terminated agents for display
  const allAgents = [...gameState.agents, ...gameState.terminatedAgents]

  // Transform agents array to include rowId for DataGrid
  const allRows: AgentRow[] = allAgents.map((agent, index) => ({
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

  const maxSkillAlive = getMaxSkillAlive(allRows)
  const columns = getAgentsColumns(
    rows,
    maxSkillAlive,
    gameState.missions,
    gameState.turn,
    gameState.hitPointsRecoveryPct,
  )
  const visibleColumns = filterVisibleAgentColumns(columns, showOnlyTerminated, showRecovering, showStats)

  function handleRowSelectionChange(newSelectionModel: GridRowSelectionModel): void {
    const agentIds: AgentId[] = []
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

  // Calculate total Combat Rating for selected agents (normalized)
  const selectedAgents = withIds(gameState.agents, agentSelection)
  const selectedAgentsCombatRating: number | undefined =
    selectedAgents.length > 0
      ? (() => {
          const totalCR = sum(selectedAgents, (agent) => calculateCombatRating(agent))
          const initialAgentCR = calculateCombatRating(initialAgent)
          return totalCR / initialAgentCR
        })()
      : undefined

  const agentCounts = calculateAgentCounts(allAgents)
  const title = <AgentsDataGridTitle counts={agentCounts} />

  return (
    <DataGridCard
      id="agents"
      title={title}
      ariaLabel="Agents"
      width={MIDDLE_COLUMN_CARD_WIDTH}
      rows={rows}
      columns={visibleColumns}
      getRowId={(row: AgentRow) => row.rowId}
      checkboxSelection
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
          ...(selectedAgentsCombatRating !== undefined && { selectedAgentsCombatRating }),
        },
      }}
      showToolbar
      sx={{
        '& .agents-color-bar-cell': {
          padding: '4px',
        },
      }}
    />
  )
}

function getMaxSkillAlive(rows: AgentRow[]): Fixed6 {
  const aliveRows = rows.filter((row) => row.state !== 'KIA' && row.state !== 'Sacked')
  return aliveRows.reduce((max, row) => f6max(max, row.skill), f6c0)
}
