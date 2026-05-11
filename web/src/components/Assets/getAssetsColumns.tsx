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

export type AssetsColumnOptions = {
  nameHeaderName: string
  valueHeaderName: string
  miniGrid: 'operations_agents' | 'operations_finances'
}

export function getAssetsColumns(options: AssetsColumnOptions): GridColDef<AssetRow>[] {
  const { name: nameWidth, value: valueWidth } = getOperationsMiniGridColumnWidths(options.miniGrid)

  const columns: GridColDef<AssetRow>[] = [
    {
      field: 'name',
      headerName: options.nameHeaderName,
      width: nameWidth,
      renderCell: (params: GridRenderCellParams<AssetRow>): React.JSX.Element => {
        const displayName = params.row.displayedName ?? params.row.name
        return <span>{displayName}</span>
      },
    },
    {
      field: 'value',
      headerName: options.valueHeaderName,
      width: valueWidth,
      renderCell: getAssetValueCell,
    },
  ]

  return columns
}

function getOperationsMiniGridColumnWidths(
  miniGrid: AssetsColumnOptions['miniGrid'],
): { name: number; value: number } {
  if (miniGrid === 'operations_agents') {
    return {
      name: columnWidths['operations_agents.name'],
      value: columnWidths['operations_agents.value'],
    }
  }
  return {
    name: columnWidths['operations_finances.name'],
    value: columnWidths['operations_finances.value'],
  }
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
