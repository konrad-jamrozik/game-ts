import type { GridColDef, GridRenderCellParams } from '@mui/x-data-grid'
import * as React from 'react'
import { columnWidths } from '../Common/columnWidths'

export type UpgradeRow = {
  id: number
  name:
    | 'Agent cap'
    | 'Transport cap'
    | 'Training cap'
    | 'Training skill gain'
    | 'Exhaustion recovery'
    | 'Hit points recovery %'
    | 'Weapon damage'
  displayedName?: string
  value: number | string
  upgrade: number | string
  price: number
}

export function getCapabilitiesColumns(): GridColDef<UpgradeRow>[] {
  const columns: GridColDef<UpgradeRow>[] = [
    {
      field: 'name',
      headerName: 'Capability',
      width: columnWidths['capabilities.name'],
      renderCell: (params: GridRenderCellParams<UpgradeRow>): React.JSX.Element => {
        const displayName = params.row.displayedName ?? params.row.name
        return <span>{displayName}</span>
      },
    },
    {
      field: 'value',
      headerName: 'Current',
      width: columnWidths['capabilities.value'],
    },
    {
      field: 'upgrade',
      headerName: 'Upgrade',
      width: columnWidths['capabilities.upgrade'],
    },
    {
      field: 'price',
      headerName: 'Price',
      width: columnWidths['capabilities.price'],
    },
  ]

  return columns
}
