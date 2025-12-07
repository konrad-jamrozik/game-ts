import type { GridColDef, GridRenderCellParams } from '@mui/x-data-grid'
import * as React from 'react'
import { assertColumnWidth } from '../Common/assertColumnWidth'
import { EXPECTED_ASSETS_COLUMN_WIDTH } from '../Common/widthConstants'
import { MyChip } from '../Common/MyChip'
import type { AssetRow } from './AssetsDataGrid'

export function getAssetsColumns(): GridColDef<AssetRow>[] {
  const columns: GridColDef<AssetRow>[] = [
    {
      field: 'name',
      headerName: 'Asset',
      width: 160,
      renderCell: (params: GridRenderCellParams<AssetRow>): React.JSX.Element => {
        const displayName = params.row.displayedName ?? params.row.name
        return <span>{displayName}</span>
      },
    },
    {
      field: 'value',
      headerName: 'Current',
      width: 100,
    },
    {
      field: 'projected',
      headerName: 'Projected',
      width: 120,
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
