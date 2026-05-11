import type { GridCellParams, GridColDef, GridRenderCellParams } from '@mui/x-data-grid'
import * as React from 'react'
import { columnWidths } from '../Common/columnWidths'
import { ColorBar } from '../ColorBar/ColorBar'
import { AGENTS_SKILL_BAR_GREY, ROLL_BAR_GREY } from '../ColorBar/colorBarUtils'

export type CapabilityRow = {
  id: number
  name:
    | 'Agent cap'
    | 'Transport cap'
    | 'Training cap'
    | 'Training skill gain'
    | 'Exhaustion recovery %'
    | 'Hit points recovery %'
    | 'Hit points'
    | 'Weapon damage'
  displayedName?: string
  value: number | string
  remaining?: number
  total?: number
}

export type UpgradeRow = CapabilityRow & {
  upgrade: number | string
  price: number
}

export function getReadOnlyCapabilitiesColumns(): GridColDef<CapabilityRow>[] {
  return getBaseCapabilitiesColumns()
}

export function getShopCapabilitiesColumns(): GridColDef<UpgradeRow>[] {
  return [
    ...getBaseCapabilitiesColumns<UpgradeRow>(),
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
}

function getBaseCapabilitiesColumns<Row extends CapabilityRow>(): GridColDef<Row>[] {
  return [
    {
      field: 'name',
      headerName: 'Capacity',
      width: columnWidths['capabilities.name'],
      renderCell: (params: GridRenderCellParams<Row>): React.JSX.Element => {
        const displayName = params.row.displayedName ?? params.row.name
        return <span>{displayName}</span>
      },
    },
    {
      field: 'value',
      headerName: 'Available',
      width: columnWidths['capabilities.value'],
      cellClassName: (params: GridCellParams<Row>): string =>
        params.row.remaining !== undefined && params.row.total !== undefined ? 'capabilities-color-bar-cell' : '',
      renderCell: (params: GridRenderCellParams<Row>): React.JSX.Element => {
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
  ]
}
