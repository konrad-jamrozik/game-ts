import type { GridColDef, GridRenderCellParams } from '@mui/x-data-grid'
import * as React from 'react'
import { assertColumnWidth } from '../Common/assertColumnWidth'
import { ASSETS_NAME_WIDTH, ASSETS_PROJECTED_WIDTH, ASSETS_VALUE_WIDTH } from '../Common/columnWidths'
import { EXPECTED_ASSETS_COLUMN_WIDTH } from '../Common/widthConstants'
import { MyChip } from '../Common/MyChip'
import type { AssetRow } from './AssetsDataGrid'

export function getAssetsColumns(): GridColDef<AssetRow>[] {
  const columns: GridColDef<AssetRow>[] = [
    {
      field: 'name',
      headerName: 'Asset',
      width: ASSETS_NAME_WIDTH,
      renderCell: (params: GridRenderCellParams<AssetRow>): React.JSX.Element => {
        const displayName = params.row.displayedName ?? params.row.name
        return <span>{displayName}</span>
      },
    },
    {
      field: 'value',
      headerName: 'Current',
      width: ASSETS_VALUE_WIDTH,
    },
    {
      field: 'projected',
      headerName: 'Projected',
      width: ASSETS_PROJECTED_WIDTH,
      renderCell: (params: GridRenderCellParams<AssetRow>): React.JSX.Element => {
        const { diff, name, projected } = params.row

        if (projected === undefined) {
          return <span />
        }

        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span aria-label={`balance-sheet-row-${name.toLowerCase()}-projected`}>{projected}</span>
            {diff !== undefined && <MyChip chipValue={diff} />}
          </div>
        )
      },
    },
  ]

  assertColumnWidth(columns, EXPECTED_ASSETS_COLUMN_WIDTH, 'Assets')

  return columns
}
