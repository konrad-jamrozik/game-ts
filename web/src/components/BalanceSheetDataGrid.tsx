import type { GridColDef, GridRenderCellParams } from '@mui/x-data-grid'
import { useAppSelector } from '../app/hooks'
import { getMoneyDiff, getMoneyNewBalance, getIntelDiff } from '../model/ruleset'
import { agsV } from '../model/views/AgentsView'
import { DataGridCard } from './DataGridCard'

export type BalanceSheetRow = {
  name: 'Money' | 'Funding' | 'Contracted' | 'Agent upkeep' | 'Hire cost' | 'Diff' | 'NewBalance' | 'Intel diff'
  value: number
}

export function BalanceSheetDataGrid(): React.JSX.Element {
  const gameState = useAppSelector((state) => state.undoable.present.gameState)
  const agents = agsV(gameState.agents)
  const contracted = agents.contractingIncome()
  const agentUpkeep = agents.agentUpkeep()
  const diff = getMoneyDiff(gameState)
  const newBalance = getMoneyNewBalance(gameState)
  const intelDiff = getIntelDiff(gameState)
  const rows = [
    { name: 'Money', id: 1, value: gameState.money },
    { name: 'Funding', id: 2, value: gameState.funding },
    { name: 'Contracted', id: 3, value: contracted },
    { name: 'Agent upkeep', id: 4, value: agentUpkeep },
    { name: 'Hire cost', id: 5, value: gameState.hireCost },
    { name: '$ Diff', id: 6, value: diff },
    { name: 'New $ balance', id: 7, value: newBalance },
    { name: 'Intel diff', id: 8, value: intelDiff },
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
