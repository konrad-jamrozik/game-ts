import type { GridColDef, GridRenderCellParams } from '@mui/x-data-grid'
import * as React from 'react'
import { assertColumnWidth } from '../Common/assertColumnWidth'
import { columnWidths } from '../Common/columnWidths'
import { EXPECTED_CAPABILITIES_COLUMN_WIDTH } from '../Common/widthConstants'
import type { UpgradeRow } from './CapabilitiesDataGrid'

export function getCapabilitiesColumns(): GridColDef<UpgradeRow>[] {
  const columns: GridColDef<UpgradeRow>[] = [
    {
      field: 'name',
      headerName: 'Capability',
      width: columnWidths['capabilities.name_width'],
      renderCell: (params: GridRenderCellParams<UpgradeRow>): React.JSX.Element => {
        const displayName = params.row.displayedName ?? params.row.name
        return <span>{displayName}</span>
      },
    },
    {
      field: 'value',
      headerName: 'Current',
      width: columnWidths['capabilities.value_width'],
    },
    {
      field: 'upgrade',
      headerName: 'Upgrade',
      width: columnWidths['capabilities.upgrade_width'],
    },
    {
      field: 'price',
      headerName: 'Price',
      width: columnWidths['capabilities.price_width'],
    },
  ]

  assertColumnWidth(columns, EXPECTED_CAPABILITIES_COLUMN_WIDTH, 'Capabilities')

  return columns
}
