import Box from '@mui/material/Box'
import { DataGrid, type GridColDef } from '@mui/x-data-grid'
import { useGameStateContext } from '../contexts/GameStateContextProvider'

export function GameStateDisplay(): React.JSX.Element {
  const { turn, agents, money } = useGameStateContext()
  const columns: GridColDef[] = [
    { field: 'asset', flex: 1, headerName: 'Asset', minWidth: 100 },
    { field: 'value', flex: 1, headerName: 'Value', minWidth: 100 },
  ]
  const rows = [
    { asset: 'Turn', id: 0, value: turn },
    { asset: 'Agents', id: 1, value: agents },
    { asset: 'Money', id: 2, value: money },
  ]
  return (
    <Box display="flex" maxWidth={400} width="100%">
      <DataGrid
        rows={rows}
        columns={columns}
        hideFooter
        disableColumnMenu
        disableRowSelectionOnClick
        sx={{
          '& .MuiDataGrid-cell': { fontWeight: 600 },
          '& .MuiDataGrid-columnHeaders': { fontWeight: 700 },
        }}
        aria-label="Game state display"
      />
    </Box>
  )
}
