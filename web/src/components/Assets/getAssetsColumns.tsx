import type { GridColDef, GridRenderCellParams } from '@mui/x-data-grid'
import * as React from 'react'
import { columnWidths } from '../Common/columnWidths'
import { MyChip } from '../Common/MyChip'

export type AssetRow = {
  id: number
  name: 'Money' | 'Agents' | 'Funding'
  displayedName?: string
  value: number
  diff?: number
}

export function getAssetsColumns(): GridColDef<AssetRow>[] {
  const columns: GridColDef<AssetRow>[] = [
    {
      field: 'name',
      headerName: 'Asset',
      width: columnWidths['assets.name'],
      renderCell: (params: GridRenderCellParams<AssetRow>): React.JSX.Element => {
        const displayName = params.row.displayedName ?? params.row.name
        return <span>{displayName}</span>
      },
    },
    {
      field: 'value',
      headerName: 'Current',
      width: columnWidths['assets.value'],
      renderCell: getAssetValueCell,
    },
  ]

  return columns
}

function getAssetValueCell(params: GridRenderCellParams<AssetRow>): React.JSX.Element {
  const { diff, name, value } = params.row

  if (name !== 'Money') {
    return <span>{value}</span>
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span aria-label={`balance-sheet-row-${name.toLowerCase()}-current`}>{value}</span>
      {diff !== undefined && <MyChip chipValue={diff} />}
    </div>
  )
}
