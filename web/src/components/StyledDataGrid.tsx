import Box from '@mui/material/Box'
import { DataGrid, type GridColDef, type DataGridProps } from '@mui/x-data-grid'

type StyledDataGridProps = {
  rows: readonly unknown[]
  columns: GridColDef[]
} & Omit<DataGridProps, 'rows' | 'columns'>

export function StyledDataGrid({ rows, columns, ...dataGridProps }: StyledDataGridProps): React.JSX.Element {
  const colsMinWidth = columns.reduce((sum, col) => sum + (col.minWidth ?? 0), 0)

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
          '& .MuiDataGrid-cell': { fontWeight: 100 },
          '& .MuiDataGrid-columnHeaders': { fontWeight: 700 },
          maxHeight: '80vh',
        })}
        {...dataGridProps}
      />
    </Box>
  )
}
