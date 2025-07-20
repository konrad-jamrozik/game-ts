import Box from '@mui/material/Box'
import { DataGrid, type GridColDef, type GridRenderCellParams } from '@mui/x-data-grid'
import { useAppSelector } from '../app/hooks'

export type AssetRow = {
  name: 'Money' | 'Agents' | 'Turn'
  value: number
}

export function GameStateDisplay(): React.JSX.Element {
  const gameState = useAppSelector((state) => state.gameState)
  const rows = [
    { name: 'Turn', id: 0, value: gameState.turn },
    { name: 'Agents', id: 1, value: gameState.agents },
    { name: 'Money', id: 2, value: gameState.money },
  ]
  const columns: GridColDef[] = [
    { field: 'name', flex: 1, headerName: 'Asset', minWidth: 100 },
    {
      field: 'value',
      flex: 1,
      headerName: 'Value',
      minWidth: 100,
      renderCell: (params: GridRenderCellParams<AssetRow, boolean | undefined>) => (
        // Use asset name as aria-label, lowercased for test queries
        <span aria-label={params.row.name.toLowerCase()}>{params.value}</span>
      ),
    },
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
