import type { GridColDef, GridRenderCellParams } from '@mui/x-data-grid'
import { useAppSelector } from '../app/hooks'
import { getMoneyNewBalance, getIntelNewBalance } from '../lib/model/ruleset/ruleset'
import { DataGridCard } from './DataGridCard'
import { MyChip } from './MyChip'

export type BalanceSheetRow = {
  name: 'Money' | 'Projected' | 'Intel'
  value: number
  diff?: number
}

export function BalanceSheetDataGrid(): React.JSX.Element {
  const gameState = useAppSelector((state) => state.undoable.present.gameState)
  const moneyProjected = getMoneyNewBalance(gameState)
  const intelProjected = getIntelNewBalance(gameState)
  const moneyDiff = moneyProjected - gameState.money
  const intelDiff = intelProjected - gameState.intel
  const rows = [
    { name: 'Money', id: 1, value: gameState.money },
    { name: 'Projected', id: 2, value: moneyProjected, diff: moneyDiff },
    { name: 'Intel', id: 3, value: gameState.intel },
    { name: 'Projected', id: 4, value: intelProjected, diff: intelDiff },
  ]
  const columns: GridColDef[] = [
    { field: 'name', headerName: 'Item', minWidth: 120 },
    {
      field: 'value',
      headerName: 'Value',
      minWidth: 100,
      renderCell: (params: GridRenderCellParams<BalanceSheetRow>): React.JSX.Element => {
        const { diff, name, value } = params.row

        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span aria-label={`balance-sheet-row-${name.toLowerCase().replace(' ', '-')}`}>{value}</span>
            <MyChip chipValue={diff} />
          </div>
        )
      },
    },
  ]
  return <DataGridCard title="Balance Sheet" rows={rows} columns={columns} />
}
