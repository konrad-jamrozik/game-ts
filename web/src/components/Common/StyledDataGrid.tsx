import Box from '@mui/material/Box'
import { DataGrid, type GridColDef, type DataGridProps, type GridRowModel } from '@mui/x-data-grid'
import { sum } from 'radash'

type StyledDataGridProps = {
  rows: readonly GridRowModel[]
  columns: GridColDef[]
} & Omit<DataGridProps, 'rows' | 'columns'>

export function StyledDataGrid({ rows, columns, ...dataGridProps }: StyledDataGridProps): React.JSX.Element {
  const colsMinWidth = sum(columns, (col) => col.minWidth ?? 0)

  return (
    <Box minWidth={colsMinWidth}>
      <DataGrid
        rows={rows}
        columns={columns}
        hideFooter
        disableColumnMenu
        disableColumnResize
        disableRowSelectionOnClick
        columnHeaderHeight={40}
        rowHeight={30}
        sx={(theme) => ({
          bgcolor: theme.palette.background.default,
          '& .MuiDataGrid-cell': { fontWeight: 100, fontFamily: 'Courier New' },
          '& .MuiDataGrid-columnHeaders': { fontWeight: 700 },
          maxHeight: '80vh',
        })}
        {...dataGridProps}
      />
    </Box>
  )
}
