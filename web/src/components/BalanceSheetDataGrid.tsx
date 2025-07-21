import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import { DataGrid, type GridColDef, type GridRenderCellParams } from '@mui/x-data-grid'
import { useAppSelector } from '../app/hooks'

export type BalanceSheetRow = {
  name: 'Money' | 'Funding' | 'Generated' | 'Agent upkeep' | 'Diff' | 'Projected'
  value: number
}

export function BalanceSheetDataGrid(): React.JSX.Element {
  const gameState = useAppSelector((state) => state.undoable.present.gameState)
  const rows = [
    { name: 'Money', id: 1, value: gameState.money },
    { name: 'Funding', id: 2, value: 0 },
    { name: 'Generated', id: 3, value: 0 },
    { name: 'Agent upkeep', id: 4, value: 0 },
    { name: 'Diff', id: 5, value: 0 },
    { name: 'Projected', id: 6, value: 0 },
  ]
  const columns: GridColDef[] = [
    { field: 'name', headerName: 'Item', minWidth: 120 },
    {
      field: 'value',
      headerName: 'Value',
      minWidth: 100,
      renderCell: (params: GridRenderCellParams<BalanceSheetRow, boolean | undefined>) => (
        // Use item name as aria-label, lowercased for test queries
        <span aria-label={params.row.name.toLowerCase().replace(' ', '-')}>{params.value}</span>
      ),
    },
  ]
  const colsMinWidth = columns.reduce((sum, col) => sum + (col.minWidth ?? 0), 0)
  return (
    <Card>
      <CardHeader title="Balance Sheet" />
      <CardContent>
        <Box minWidth={colsMinWidth}>
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
            aria-label="Balance Sheet"
          />
        </Box>
      </CardContent>
    </Card>
  )
}
