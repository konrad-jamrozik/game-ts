import { DataGrid, type GridColDef } from '@mui/x-data-grid'
import { useGameStateContext } from '../contexts/GameStateContextProvider'

export function GameStateDisplay(): React.JSX.Element {
  const { turn, agents, money } = useGameStateContext()
  const columns: GridColDef[] = [
    { field: 'turn', flex: 1, headerName: 'Turn', minWidth: 80 },
    { field: 'agents', flex: 1, headerName: 'Agents', minWidth: 80 },
    { field: 'money', flex: 1, headerName: 'Money', minWidth: 80 },
  ]
  const rows = [{ agents, id: 0, money, turn }]
  return (
    <div style={{ display: 'flex', maxWidth: 400, width: '100%' }}>
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
    </div>
  )
}
