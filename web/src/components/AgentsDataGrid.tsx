import Box from '@mui/material/Box'
import { DataGrid, type GridColDef, type GridRenderCellParams } from '@mui/x-data-grid'
import { useAppSelector } from '../app/hooks'
import type { Agent } from '../model/gameStateSlice'

export type AgentRow = Agent & {
  // Adding an incremental row id for DataGrid (required by MUI DataGrid)
  rowId: number
}

export function AgentsDataGrid(): React.JSX.Element {
  const gameState = useAppSelector((state) => state.undoable.present.gameState)

  // Transform agents array to include rowId for DataGrid
  const rows: AgentRow[] = gameState.agents.map((agent, index) => ({
    ...agent,
    rowId: index + 1,
  }))

  const columns: GridColDef[] = [
    {
      field: 'id',
      flex: 1,
      headerName: 'ID',
      minWidth: 120,
      renderCell: (params: GridRenderCellParams<AgentRow, string>) => (
        <span aria-label="agent-id-value">{params.value}</span>
      ),
    },
    {
      field: 'turnHired',
      flex: 1,
      headerName: 'Hired',
      minWidth: 100,
      renderCell: (params: GridRenderCellParams<AgentRow, number>) => (
        <span aria-label="hired-on-value">{params.value}</span>
      ),
    },
  ]

  return (
    <Box display="flex" minWidth={250}>
      <DataGrid
        rows={rows}
        columns={columns}
        getRowId={(row: AgentRow) => row.rowId}
        hideFooter
        disableColumnMenu
        disableRowSelectionOnClick
        columnHeaderHeight={40}
        rowHeight={30}
        sx={(theme) => ({
          bgcolor: theme.palette.background.default,
          '& .MuiDataGrid-cell': { fontWeight: 100 },
          '& .MuiDataGrid-columnHeaders': { fontWeight: 700 },
        })}
        aria-label="personnel-table"
      />
    </Box>
  )
}
