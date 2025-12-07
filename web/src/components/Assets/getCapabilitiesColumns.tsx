import type { GridColDef, GridRenderCellParams } from '@mui/x-data-grid'
import * as React from 'react'
import { assertColumnWidth } from '../Common/assertColumnWidth'
import {
  CAPABILITIES_NAME_WIDTH,
  CAPABILITIES_PRICE_WIDTH,
  CAPABILITIES_UPGRADE_WIDTH,
  CAPABILITIES_VALUE_WIDTH,
} from '../Common/columnWidths'
import { EXPECTED_CAPABILITIES_COLUMN_WIDTH } from '../Common/widthConstants'
import type { UpgradeRow } from './CapabilitiesDataGrid'

export function getCapabilitiesColumns(): GridColDef<UpgradeRow>[] {
  const columns: GridColDef<UpgradeRow>[] = [
    {
      field: 'name',
      headerName: 'Capability',
      width: CAPABILITIES_NAME_WIDTH,
      renderCell: (params: GridRenderCellParams<UpgradeRow>): React.JSX.Element => {
        const displayName = params.row.displayedName ?? params.row.name
        return <span>{displayName}</span>
      },
    },
    {
      field: 'value',
      headerName: 'Current',
      width: CAPABILITIES_VALUE_WIDTH,
    },
    {
      field: 'upgrade',
      headerName: 'Upgrade',
      width: CAPABILITIES_UPGRADE_WIDTH,
    },
    {
      field: 'price',
      headerName: 'Price',
      width: CAPABILITIES_PRICE_WIDTH,
    },
  ]

  assertColumnWidth(columns, EXPECTED_CAPABILITIES_COLUMN_WIDTH, 'Capabilities')

  return columns
}
