import {
  createRowSelectionManager,
  type GridColDef,
  type GridRenderCellParams,
  type GridRowId,
  type GridRowSelectionModel,
} from '@mui/x-data-grid'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import type { Agent } from '../model/gameStateSlice'
import { setAgentSelection } from '../model/selectionSlice'
import { DataGridCard } from './DataGridCard'

export type AgentRow = Agent & {
  // row id for DataGrid (required by MUI DataGrid)
  // https://mui.com/x/react-data-grid/row-definition/
  rowId: number
}

export function AgentsDataGrid(): React.JSX.Element {
  const dispatch = useAppDispatch()
  const gameState = useAppSelector((state) => state.undoable.present.gameState)
  const agentSelection = useAppSelector((state) => state.selection.agents)

  // Transform agents array to include rowId for DataGrid
  const rows: AgentRow[] = gameState.agents.map((agent, index) => ({
    ...agent,
    rowId: index,
  }))

  const columns: GridColDef[] = [
    {
      field: 'id',
      headerName: 'ID',
      minWidth: 120,
      renderCell: (params: GridRenderCellParams<AgentRow, string>) => (
        <span aria-label="agent-id-value">{params.value}</span>
      ),
    },
    {
      field: 'turnHired',
      headerName: 'T. hired',
      minWidth: 100,
      renderCell: (params: GridRenderCellParams<AgentRow, number>) => (
        <span aria-label="hired-on-value">{params.value}</span>
      ),
    },
    {
      field: 'state',
      headerName: 'State',
      minWidth: 120,
      renderCell: (params: GridRenderCellParams<AgentRow, string>) => (
        <span aria-label="agent-state-value">{params.value}</span>
      ),
    },
  ]

  function handleRowSelectionChange(newSelectionModel: GridRowSelectionModel): void {
    const agentIds: string[] = []
    const mgr = createRowSelectionManager(newSelectionModel)

    const existingRowIds = rows.map((row) => row.rowId)
    const includedRowIds = existingRowIds.filter((id) => mgr.has(id))

    for (const rowId of includedRowIds) {
      const agent = rows[rowId]
      if (agent) {
        agentIds.push(agent.id)
      } else {
        throw new Error(`Agent not found for rowId: ${rowId}`)
      }
    }

    dispatch(setAgentSelection(agentIds))
  }

  // Convert agent IDs from state back to row IDs for DataGrid
  const rowIds: GridRowId[] = []
  for (const agentId of agentSelection) {
    // Find the row that contains this agent ID
    const rowIndex = rows.findIndex((row) => row.id === agentId)
    if (rowIndex !== -1) {
      // rowId is index + 1
      rowIds.push(rowIndex)
    }
  }

  const idsSet = new Set<GridRowId>(rowIds)
  const model: GridRowSelectionModel = { type: 'include', ids: idsSet }

  return (
    <DataGridCard
      title="Agents"
      rows={rows}
      columns={columns}
      getRowId={(row: AgentRow) => row.rowId}
      checkboxSelection
      onRowSelectionModelChange={handleRowSelectionChange}
      rowSelectionModel={model}
    />
  )
}
