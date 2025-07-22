import type { GridColDef, GridRenderCellParams } from '@mui/x-data-grid'
import { useAppSelector } from '../app/hooks'
import { getAgentUpkeep, getContractedIncome, getMoneyDiff, getMoneyProjected } from '../model/modelDerived'
import { DataGridCard } from './DataGridCard'

export type BalanceSheetRow = {
  name: 'Money' | 'Funding' | 'Contracted' | 'Agent upkeep' | 'Hire cost' | 'Diff' | 'Projected'
  value: number
}

export function BalanceSheetDataGrid(): React.JSX.Element {
  const gameState = useAppSelector((state) => state.undoable.present.gameState)
  const contracted = getContractedIncome(gameState)
  const agentUpkeep = getAgentUpkeep(gameState)
  const diff = getMoneyDiff(gameState)
  const projected = getMoneyProjected(gameState)
  const rows = [
    { name: 'Money', id: 1, value: gameState.money },
    { name: 'Funding', id: 2, value: gameState.funding },
    { name: 'Contracted', id: 3, value: contracted },
    { name: 'Agent upkeep', id: 4, value: agentUpkeep },
    { name: 'Hire cost', id: 5, value: gameState.hireCost },
    { name: 'Diff', id: 6, value: diff },
    { name: 'Projected', id: 7, value: projected },
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
