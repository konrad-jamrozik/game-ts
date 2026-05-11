import Box from '@mui/material/Box'
import type { Theme } from '@mui/material/styles'
import { DataGrid, type GridColDef, type DataGridProps, type GridRowModel } from '@mui/x-data-grid'
import { sum } from 'radash'
import { combineSx } from '../styling/stylePrimitives'

const CHECKMARK_COLUMN_WIDTH = 50
const DATA_GRID_BASE_WIDTH = 10

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
  const columnsWidth = sum(columns, (col) => col.width ?? col.minWidth ?? 0)
  const checkboxWidth = dataGridProps.checkboxSelection === true ? CHECKMARK_COLUMN_WIDTH : 0
  const dataGridWidth = DATA_GRID_BASE_WIDTH + columnsWidth + checkboxWidth

  return (
    <Box width={dataGridWidth} minWidth={dataGridWidth}>
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
