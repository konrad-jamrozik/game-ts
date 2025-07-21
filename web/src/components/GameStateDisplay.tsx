import Box from '@mui/material/Box'
import { DataGrid, type GridColDef, type GridRenderCellParams } from '@mui/x-data-grid'
import { useAppSelector } from '../app/hooks'

export type AssetRow = {
  name: 'Money' | 'Agents' | 'Turn'
  value: number
}

export function GameStateDisplay(): React.JSX.Element {
  const gameState = useAppSelector((state) => state.undoable.present.gameState)
  const rows = [
    { name: 'Agents', id: 2, value: gameState.agents.length },
    { name: 'Money', id: 3, value: gameState.money },
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
    <Box display="flex" minWidth={200}>
      <DataGrid
        rows={rows}
        columns={columns}
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
        aria-label="Game state display"
      />
    </Box>
  )
}
