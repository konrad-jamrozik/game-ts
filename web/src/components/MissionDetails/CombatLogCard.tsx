import type { GridColDef } from '@mui/x-data-grid'
import * as React from 'react'
import { ExpandableCard } from '../Common/ExpandableCard'
import { StyledDataGrid } from '../Common/StyledDataGrid'

type CombatLogRow = {
  id: number
  item: string
  value: string
}

export function CombatLogCard(): React.JSX.Element {
  const rows: CombatLogRow[] = []

  const columns: GridColDef<CombatLogRow>[] = [
    { field: 'item', headerName: 'Item', width: 180 },
    { field: 'value', headerName: 'Value', width: 200 },
  ]

  return (
    <ExpandableCard id="combat-log" title="Combat Log" defaultExpanded={true}>
      <StyledDataGrid rows={rows} columns={columns} aria-label="Combat Log" hideFooter />
    </ExpandableCard>
  )
}
