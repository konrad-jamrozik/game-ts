import type { GridColDef } from '@mui/x-data-grid'
import * as React from 'react'
import { ExpandableCard } from '../Common/ExpandableCard'
import { StyledDataGrid } from '../Common/StyledDataGrid'

type CombatDetailsRow = {
  id: number
  item: string
  value: string
}

export function CombatDetailsCard(): React.JSX.Element {
  const rows: CombatDetailsRow[] = []

  const columns: GridColDef<CombatDetailsRow>[] = [
    { field: 'item', headerName: 'Item', width: 180 },
    { field: 'value', headerName: 'Value', width: 200 },
  ]

  return (
    <ExpandableCard id="combat-details" title="Combat details" defaultExpanded={true}>
      <StyledDataGrid rows={rows} columns={columns} aria-label="Combat details" hideFooter />
    </ExpandableCard>
  )
}
