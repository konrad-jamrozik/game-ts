import type { GridColDef, DataGridProps, GridRowModel } from '@mui/x-data-grid'
import * as React from 'react'
import { ExpandableCard } from './ExpandableCard'
import { StyledDataGrid } from './StyledDataGrid'

type DataGridCardProps = {
  id: string
  title: string
  width: number
  rows: GridRowModel[]
  columns: GridColDef[]
} & Omit<DataGridProps, 'rows' | 'columns'>

export function DataGridCard({
  id,
  title,
  rows,
  columns,
  width,
  ...dataGridProps
}: DataGridCardProps): React.JSX.Element {
  return (
    <ExpandableCard id={id} title={title} defaultExpanded={true} sx={{ width }}>
      <StyledDataGrid rows={rows} columns={columns} aria-label={title} {...dataGridProps} />
    </ExpandableCard>
  )
}
