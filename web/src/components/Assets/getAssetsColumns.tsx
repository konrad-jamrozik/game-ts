import type { GridColDef, GridRenderCellParams } from '@mui/x-data-grid'
import * as React from 'react'
import { columnWidths } from '../Common/columnWidths'
import { MyChip } from '../Common/MyChip'

export type AssetRow = {
  id: number
  name: 'Money' | 'Agents' | 'Projected'
  displayedName?: string
  value?: number
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
      headerName: 'Value',
      width: columnWidths['assets.value'],
      renderCell: getAssetValueCell,
    },
  ]

  return columns
}

function getAssetValueCell(params: GridRenderCellParams<AssetRow>): React.JSX.Element {
  if (params.row.name === 'Projected') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
        {params.row.diff !== undefined && <MyChip chipValue={params.row.diff} />}
      </div>
    )
  }

  return <span>{params.row.value}</span>
}
