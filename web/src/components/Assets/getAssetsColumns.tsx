import type { GridColDef, GridRenderCellParams } from '@mui/x-data-grid'
import * as React from 'react'
import { columnWidths } from '../Common/columnWidths'
import { MyChip } from '../Common/MyChip'

export type AssetRow = {
  id: number
  name: 'Total' | 'Ready' | 'Exhausted' | 'Away' | 'Recovering' | 'Money' | 'Projected'
  displayedName?: string
  value?: number
  diff?: number
}

type AssetsColumnOptions = {
  nameHeaderName: string
  valueHeaderName: string
}

export function getAssetsColumns(options: AssetsColumnOptions): GridColDef<AssetRow>[] {
  const columns: GridColDef<AssetRow>[] = [
    {
      field: 'name',
      headerName: options.nameHeaderName,
      width: columnWidths['assets.name'],
      renderCell: (params: GridRenderCellParams<AssetRow>): React.JSX.Element => {
        const displayName = params.row.displayedName ?? params.row.name
        return <span>{displayName}</span>
      },
    },
    {
      field: 'value',
      headerName: options.valueHeaderName,
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
