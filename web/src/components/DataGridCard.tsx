import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import { DataGrid, type GridColDef, type DataGridProps } from '@mui/x-data-grid'

type DataGridCardProps = {
  title: string
  rows: readonly unknown[]
  columns: GridColDef[]
  ariaLabel: string
} & Omit<DataGridProps, 'rows' | 'columns'>

export function DataGridCard({
  title,
  rows,
  columns,
  ariaLabel,
  ...dataGridProps
}: DataGridCardProps): React.JSX.Element {
  const colsMinWidth = columns.reduce((sum, col) => sum + (col.minWidth ?? 0), 0)

  return (
    <Card>
      <CardHeader title={title} />
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
              maxHeight: '80vh',
            })}
            aria-label={ariaLabel}
            {...dataGridProps}
          />
        </Box>
      </CardContent>
    </Card>
  )
}
