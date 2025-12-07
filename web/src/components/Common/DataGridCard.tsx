import type { GridColDef, DataGridProps, GridRowModel } from '@mui/x-data-grid'
import * as React from 'react'
import { CARD_WIDTH } from './constants'
import { ExpandableCard } from './ExpandableCard'
import { StyledDataGrid } from './StyledDataGrid'

type DataGridCardProps = {
  title: string
  rows: GridRowModel[]
  columns: GridColDef[]
} & Omit<DataGridProps, 'rows' | 'columns'>

export function DataGridCard({ title, rows, columns, ...dataGridProps }: DataGridCardProps): React.JSX.Element {
  return (
    <ExpandableCard
      title={title}
      defaultExpanded={true}
      sx={{ minWidth: CARD_WIDTH }}
    >
      <StyledDataGrid rows={rows} columns={columns} aria-label={title} {...dataGridProps} />
    </ExpandableCard>
  )
}
