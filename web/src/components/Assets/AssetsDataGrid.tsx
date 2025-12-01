import type { GridColDef, GridRenderCellParams } from '@mui/x-data-grid'
import * as React from 'react'
import { useAppSelector } from '../app/hooks'
import { getMoneyNewBalance } from '../lib/ruleset/moneyRuleset'
import { getIntelNewBalance } from '../lib/ruleset/intelRuleset'
import { notTerminated } from '../lib/model_utils/agentUtils'
import { StyledDataGrid } from '../Common/StyledDataGrid'
import { MyChip } from '../Common/MyChip'

export type AssetRow = {
  id: number
  name: 'Money' | 'Intel' | 'Agents' | 'Funding'
  displayedName?: string
  value: number
  projected?: number
  diff?: number
}

export function AssetsDataGrid(): React.JSX.Element {
  const gameState = useAppSelector((state) => state.undoable.present.gameState)
  const moneyProjected = getMoneyNewBalance(gameState)
  const intelProjected = getIntelNewBalance(gameState)
  const moneyDiff = moneyProjected - gameState.money
  const intelDiff = intelProjected - gameState.intel
  const agentCount = notTerminated(gameState.agents).length

  const assetRows: AssetRow[] = [
    { name: 'Agents', id: 1, value: agentCount },
    { name: 'Funding', id: 4, value: gameState.funding },
    { name: 'Money', id: 2, value: gameState.money, projected: moneyProjected, diff: moneyDiff },
    { name: 'Intel', id: 3, value: gameState.intel, projected: intelProjected, diff: intelDiff },
  ]

  const assetColumns: GridColDef[] = [
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
      minWidth: 100,
    },
    {
      field: 'projected',
      headerName: 'Projected',
      minWidth: 120,
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

  return <StyledDataGrid rows={assetRows} columns={assetColumns} aria-label="Assets" />
}
