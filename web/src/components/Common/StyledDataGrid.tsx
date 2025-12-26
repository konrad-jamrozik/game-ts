import Box from '@mui/material/Box'
import type { Theme } from '@mui/material/styles'
import { DataGrid, type GridColDef, type DataGridProps, type GridRowModel } from '@mui/x-data-grid'
import { sum } from 'radash'
import { combineSx } from '../styling/stylePrimitives'

type StyledDataGridProps = {
  rows: readonly GridRowModel[]
  columns: GridColDef[]
} & Omit<DataGridProps, 'rows' | 'columns'>

function defaultSx(theme: Theme): Record<string, unknown> {
  return {
    bgcolor: theme.palette.background.default,
    '& .MuiDataGrid-cell': { fontWeight: 100 },
    '& .MuiDataGrid-columnHeaders': { fontWeight: 700 },
    maxHeight: '80vh',
  }
}

export function StyledDataGrid({ rows, columns, sx, ...dataGridProps }: StyledDataGridProps): React.JSX.Element {
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
        sx={combineSx(defaultSx, sx)}
        {...dataGridProps}
      />
    </Box>
  )
}
