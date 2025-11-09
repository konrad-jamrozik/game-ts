import type { GridColDef, GridRenderCellParams } from '@mui/x-data-grid'
import { useAppSelector } from '../app/hooks'
import { getMoneyNewBalance, getIntelNewBalance } from '../lib/model/ruleset/ruleset'
import { DataGridCard } from './DataGridCard'

export type BalanceSheetRow = {
  name: 'Money' | 'Projected' | 'Intel'
  value: number
}

export function BalanceSheetDataGrid(): React.JSX.Element {
  const gameState = useAppSelector((state) => state.undoable.present.gameState)
  const moneyProjected = getMoneyNewBalance(gameState)
  const intelProjected = getIntelNewBalance(gameState)
  const rows = [
    { name: 'Money', id: 1, value: gameState.money },
    { name: 'Projected', id: 2, value: moneyProjected },
    { name: 'Intel', id: 3, value: gameState.intel },
    { name: 'Projected', id: 4, value: intelProjected },
  ]
  const columns: GridColDef[] = [
    { field: 'name', headerName: 'Item', minWidth: 120 },
    {
      field: 'value',
      headerName: 'Value',
      minWidth: 100,
      renderCell: (params: GridRenderCellParams<BalanceSheetRow, boolean | undefined>) => (
        <span aria-label={`balance-sheet-row-${params.row.name.toLowerCase().replace(' ', '-')}`}>{params.value}</span>
      ),
    },
  ]
  return <DataGridCard title="Balance Sheet" rows={rows} columns={columns} />
}
