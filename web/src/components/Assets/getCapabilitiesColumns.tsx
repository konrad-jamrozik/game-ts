import type { GridCellParams, GridColDef, GridRenderCellParams } from '@mui/x-data-grid'
import * as React from 'react'
import { columnWidths } from '../Common/columnWidths'
import { ColorBar } from '../ColorBar/ColorBar'
import { AGENTS_SKILL_BAR_GREY, ROLL_BAR_GREY } from '../ColorBar/colorBarUtils'

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
  remaining?: number
  total?: number
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
      cellClassName: (params: GridCellParams<UpgradeRow>): string =>
        params.row.remaining !== undefined && params.row.total !== undefined ? 'capabilities-color-bar-cell' : '',
      renderCell: (params: GridRenderCellParams<UpgradeRow>): React.JSX.Element => {
        const { remaining, total } = params.row
        if (remaining !== undefined && total !== undefined) {
          const remainingPct = total > 0 ? Math.min(100, (remaining / total) * 100) : 0
          // Left side: bright grey (remaining), Right side: dark grey (used)
          const backgroundOverride = `linear-gradient(90deg, ${AGENTS_SKILL_BAR_GREY} 0%, ${AGENTS_SKILL_BAR_GREY} ${remainingPct}%, ${ROLL_BAR_GREY} ${remainingPct}%, ${ROLL_BAR_GREY} 100%)`
          return (
            <ColorBar fillPct={remainingPct} colorPct={0} backgroundOverride={backgroundOverride}>
              {params.value}
            </ColorBar>
          )
        }
        return <span>{params.value}</span>
      },
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
