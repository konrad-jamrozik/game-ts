import type { GridColDef, GridRenderCellParams } from '@mui/x-data-grid'
import * as React from 'react'
import { columnWidths } from '../Common/columnWidths'
import type { UpgradeRow } from './CapabilitiesDataGrid'

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
