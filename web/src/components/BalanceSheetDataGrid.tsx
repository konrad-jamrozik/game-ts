import type { GridColDef, GridRenderCellParams } from '@mui/x-data-grid'
import { useAppSelector } from '../app/hooks'
import { getMoneyDiff, getMoneyNewBalance, getIntelDiff } from '../lib/model/ruleset/ruleset'
import { DataGridCard } from './DataGridCard'
import { agsV } from '../lib/model/agents/AgentsView'

export type BalanceSheetRow = {
  name: 'Money' | 'Funding' | 'Contracting' | 'Agent upkeep' | 'Hire cost' | 'Diff' | 'NewBalance' | 'Intel diff'
  value: number
}

export function BalanceSheetDataGrid(): React.JSX.Element {
  const gameState = useAppSelector((state) => state.undoable.present.gameState)
  const agents = agsV(gameState.agents)
  const contracting = agents.contractingIncome()
  const agentUpkeep = agents.agentUpkeep()
  const diff = getMoneyDiff(gameState)
  const newBalance = getMoneyNewBalance(gameState)
  const intelDiff = getIntelDiff(gameState)
  const rows = [
    { name: 'Money', id: 1, value: gameState.money },
    { name: 'Funding', id: 2, value: gameState.funding },
    { name: 'Contracting', id: 3, value: contracting },
    { name: 'Agent upkeep', id: 4, value: agentUpkeep },
    { name: 'Hire cost', id: 5, value: gameState.currentTurnTotalHireCost },
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
