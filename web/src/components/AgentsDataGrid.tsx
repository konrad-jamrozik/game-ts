import {
  createRowSelectionManager,
  type GridColDef,
  type GridRenderCellParams,
  type GridRowId,
  type GridRowSelectionModel,
} from '@mui/x-data-grid'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import type { Agent } from '../model/gameStateSlice'
import { setAgentSelection, type SerializableGridRowSelectionModel } from '../model/selectionSlice'
import { DataGridCard } from './DataGridCard'

export type AgentRow = Agent & {
  // Adding an incremental row id for DataGrid (required by MUI DataGrid)
  rowId: number
}

export function AgentsDataGrid(): React.JSX.Element {
  const dispatch = useAppDispatch()
  const gameState = useAppSelector((state) => state.undoable.present.gameState)
  const agentsRowSelectionModel = useAppSelector((state) => state.selection.agents)

  // Transform agents array to include rowId for DataGrid
  const rows: AgentRow[] = gameState.agents.map((agent, index) => ({
    ...agent,
    rowId: index + 1,
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
  ]

  // https://mui.com/x/react-data-grid/row-selection/#controlled-row-selection
  function handleRowSelectionChange(newSelectionModel: GridRowSelectionModel): void {
    // 🚧KJA this is converting GridRowSelectionModel to SerializableGridSelectionModel. Encapsulate.
    const ids: Set<GridRowId> = newSelectionModel.ids
    const serializableIds: (string | number)[] = [...ids]
    const model: SerializableGridRowSelectionModel = { type: newSelectionModel.type, ids: serializableIds }
    dispatch(setAgentSelection(model))
  }

  return (
    <DataGridCard
      title="Agents"
      rows={rows}
      columns={columns}
      getRowId={(row: AgentRow) => row.rowId}
      checkboxSelection
      onRowSelectionModelChange={handleRowSelectionChange}
      rowSelectionModel={agentsRowSelectionModel}
    />
  )
}
