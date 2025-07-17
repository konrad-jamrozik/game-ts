import Box from '@mui/material/Box'
import { DataGrid, type GridColDef, type GridRenderCellParams } from '@mui/x-data-grid'
import { useGameStateContext } from '../contexts/GameStateContextProvider'

export type AssetRow = {
  name: 'Money' | 'Agents' | 'Turn'
  value: number
}

export function GameStateDisplay(): React.JSX.Element {
  const { turn, agents, money } = useGameStateContext()
  const rows = [
    { name: 'Turn', id: 0, value: turn },
    { name: 'Agents', id: 1, value: agents },
    { name: 'Money', id: 2, value: money },
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
