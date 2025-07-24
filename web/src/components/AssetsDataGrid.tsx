import type { GridColDef, GridRenderCellParams } from '@mui/x-data-grid'
import { useAppSelector } from '../app/hooks'
import { DataGridCard } from './DataGridCard'

export type AssetRow = {
  name: 'Money' | 'Agents' | 'Intel' | 'Turn'
  value: number
}

export function AssetsDataGrid(): React.JSX.Element {
  const gameState = useAppSelector((state) => state.undoable.present.gameState)
  const rows = [
    { name: 'Agents', id: 2, value: gameState.agents.length },
    { name: 'Money', id: 3, value: gameState.money },
    { name: 'Intel', id: 4, value: gameState.intel },
  ]
  const columns: GridColDef[] = [
    { field: 'name', headerName: 'Asset', minWidth: 120 },
    {
      field: 'value',
      headerName: 'Value',
      minWidth: 100,
      renderCell: (params: GridRenderCellParams<AssetRow, boolean | undefined>) => (
        // Use asset name as aria-label, lowercased for test queries
        <span aria-label={`assets-row-${params.row.name.toLowerCase()}`}>{params.value}</span>
      ),
    },
  ]
  return <DataGridCard title="Assets" rows={rows} columns={columns} />
}
