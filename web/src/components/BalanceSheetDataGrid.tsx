import type { GridColDef, GridRenderCellParams } from '@mui/x-data-grid'
import { useAppSelector } from '../app/hooks'
import { DataGridCard } from './DataGridCard'

export type BalanceSheetRow = {
  name: 'Money' | 'Funding' | 'Generated' | 'Agent upkeep' | 'Diff' | 'Projected'
  value: number
}

export function BalanceSheetDataGrid(): React.JSX.Element {
  const gameState = useAppSelector((state) => state.undoable.present.gameState)
  const rows = [
    { name: 'Money', id: 1, value: gameState.money },
    { name: 'Funding', id: 2, value: 0 },
    { name: 'Generated', id: 3, value: 0 },
    { name: 'Agent upkeep', id: 4, value: 0 },
    { name: 'Diff', id: 5, value: 0 },
    { name: 'Projected', id: 6, value: 0 },
  ]
  const columns: GridColDef[] = [
    { field: 'name', headerName: 'Item', minWidth: 120 },
    {
      field: 'value',
      headerName: 'Value',
      minWidth: 100,
      renderCell: (params: GridRenderCellParams<BalanceSheetRow, boolean | undefined>) => (
        // Use item name as aria-label, lowercased for test queries
        <span aria-label={`balance-sheet-row-${params.row.name.toLowerCase().replace(' ', '-')}`}>{params.value}</span>
      ),
    },
  ]
  return <DataGridCard title="Balance Sheet" rows={rows} columns={columns} />
}
