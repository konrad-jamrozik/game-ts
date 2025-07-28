import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import type { GridColDef, DataGridProps } from '@mui/x-data-grid'
import { StyledDataGrid } from './StyledDataGrid'

type DataGridCardProps = {
  title: string
  rows: readonly unknown[]
  columns: GridColDef[]
} & Omit<DataGridProps, 'rows' | 'columns'>

export function DataGridCard({ title, rows, columns, ...dataGridProps }: DataGridCardProps): React.JSX.Element {
  // If I want less padding:
  // <CardContent sx={{ padding: 1, margin: 0, '&:last-child': { paddingBottom: 1 } }}>
  return (
    <Card>
      <CardHeader title={title} />
      <CardContent>
        <StyledDataGrid rows={rows} columns={columns} aria-label={title} {...dataGridProps} />
      </CardContent>
    </Card>
  )
}
