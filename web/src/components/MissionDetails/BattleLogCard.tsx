import type { GridColDef } from '@mui/x-data-grid'
import * as React from 'react'
import { ExpandableCard } from '../Common/ExpandableCard'
import { StyledDataGrid } from '../Common/StyledDataGrid'

type BattleLogRow = {
  id: number
  item: string
  value: string
}

export function BattleLogCard(): React.JSX.Element {
  const rows: BattleLogRow[] = []

  const columns: GridColDef<BattleLogRow>[] = [
    { field: 'item', headerName: 'Item', width: 180 },
    { field: 'value', headerName: 'Value', width: 200 },
  ]

  return (
    <ExpandableCard id="battle-log" title="Battle Log" defaultExpanded={true}>
      <StyledDataGrid rows={rows} columns={columns} aria-label="Battle Log" hideFooter />
    </ExpandableCard>
  )
}
