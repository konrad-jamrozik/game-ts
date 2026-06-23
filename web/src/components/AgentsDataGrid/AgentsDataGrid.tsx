import {
  createRowSelectionManager,
  type GridColDef,
  type GridRowId,
  type GridRowSelectionModel,
} from '@mui/x-data-grid'
import * as React from 'react'
import { sum } from 'radash'
import { useAppDispatch, useAppSelector } from '../../redux/hooks'
import type { AgentId } from '../../lib/model/modelIds'
import { f6c0, f6max, type Fixed6 } from '../../lib/primitives/fixed6'
import { openAgentsDrilldown, setAgentSelection, type AgentsFilterType } from '../../redux/slices/selectionSlice'
import { withIds } from '../../lib/model_utils/agentUtils'
import { StyledDataGrid } from '../Common/StyledDataGrid'
import { AgentsToolbar } from './AgentsToolbar'
import { filterAgentRows, filterVisibleAgentColumns } from './AgentsDataGridUtils'
import { getAgentsColumns, type AgentRow } from './getAgentsColumns'
import { calculateAgentCounts } from './agentCounts'
import { calculateCombatRating } from '../../lib/ruleset/combatRatingRuleset'
import { getCurrentTurnState } from '../../redux/storeUtils'
import { DATA_GRID_CELL_PADDING } from '../styling/spacing'
import { AGENTS_ROSTER_TOOLBAR_MIN_WIDTH_PX, getDataGridWidth } from '../Common/dataGridLayout'

export function AgentsDataGrid(): React.JSX.Element {
  const dispatch = useAppDispatch()
  const gameState = useAppSelector(getCurrentTurnState)
  const agentSelection = useAppSelector((state) => state.selection.agents)
  const filterType = useAppSelector((state) => state.selection.agentsFilterType ?? 'all')

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

  // Apply the normalized drilldown filter selected by summary rows or the toolbar.
  const rows: AgentRow[] = filterAgentRows(allRows, filterType, agentsTerminatedThisTurnIds)

  const maxSkillAlive = getMaxSkillAlive(allRows)
  const columns = getAgentsColumns(
    rows,
    maxSkillAlive,
    gameState.missions,
    gameState.turn,
    gameState.hitPointsRecoveryPct,
  )
  const visibleColumns = filterVisibleAgentColumns(columns, filterType)

  function handleFilterTypeChange(nextFilterType: AgentsFilterType): void {
    dispatch(openAgentsDrilldown(nextFilterType))
  }

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
    selectedAgents.length > 0 ? sum(selectedAgents, (agent) => calculateCombatRating(agent)) : undefined

  const agentCounts = getAgentsToolbarCounts(allRows, agentsTerminatedThisTurnIds)
  const dataGridWidth = getStableAgentsDataGridWidth(columns)

  return (
    <StyledDataGrid
      aria-label="Agents"
      rows={rows}
      columns={visibleColumns}
      width={dataGridWidth}
      getRowId={(row: AgentRow) => row.rowId}
      checkboxSelection
      onRowSelectionModelChange={handleRowSelectionChange}
      rowSelectionModel={model}
      slots={{ toolbar: AgentsToolbar }}
      slotProps={{
        toolbar: {
          agentsFilterType: filterType,
          onAgentsFilterTypeChange: handleFilterTypeChange,
          agentCounts,
          ...(selectedAgentsCombatRating !== undefined && { selectedAgentsCombatRating }),
        },
      }}
      showToolbar
      sx={{
        '& .agents-color-bar-cell': {
          padding: DATA_GRID_CELL_PADDING,
        },
      }}
    />
  )
}

function getMaxSkillAlive(rows: AgentRow[]): Fixed6 {
  const aliveRows = rows.filter((row) => row.state !== 'KIA' && row.state !== 'Sacked')
  return aliveRows.reduce((max, row) => f6max(max, row.skill), f6c0)
}

function getAgentsToolbarCounts(
  allRows: AgentRow[],
  agentsTerminatedThisTurnIds: Set<string>,
): ReturnType<typeof calculateAgentCounts> {
  const baseCounts = calculateAgentCounts(allRows)
  return {
    ...baseCounts,
    allActive: filterAgentRows(allRows, 'all', agentsTerminatedThisTurnIds).length,
    ready: filterAgentRows(allRows, 'ready', agentsTerminatedThisTurnIds).length,
    exhausted: filterAgentRows(allRows, 'exhausted', agentsTerminatedThisTurnIds).length,
    away: filterAgentRows(allRows, 'away', agentsTerminatedThisTurnIds).length,
    recovering: filterAgentRows(allRows, 'recovering', agentsTerminatedThisTurnIds).length,
    stats: filterAgentRows(allRows, 'stats', agentsTerminatedThisTurnIds).length,
    terminated: filterAgentRows(allRows, 'terminated', agentsTerminatedThisTurnIds).length,
  }
}

function getStableAgentsDataGridWidth(columns: GridColDef[]): number {
  return Math.max(
    AGENTS_ROSTER_TOOLBAR_MIN_WIDTH_PX,
    getAgentColumnsWidth(columns, 'all'),
    getAgentColumnsWidth(columns, 'recovering'),
    getAgentColumnsWidth(columns, 'stats'),
    getAgentColumnsWidth(columns, 'terminated'),
  )
}

function getAgentColumnsWidth(columns: GridColDef[], filterType: AgentsFilterType): number {
  const visibleColumns = filterVisibleAgentColumns(columns, filterType)
  return getDataGridWidth(visibleColumns, { checkboxSelection: true })
}
