import type { GridColDef, GridRenderCellParams } from '@mui/x-data-grid'
import Stack from '@mui/material/Stack'
import { useAppSelector } from '../app/hooks'
import { getMoneyNewBalance, getIntelNewBalance } from '../lib/model/ruleset/ruleset'
import { agsV } from '../lib/model/agents/AgentsView'
import { ExpandableCard } from './ExpandableCard'
import { StyledDataGrid } from './StyledDataGrid'
import { MyChip } from './MyChip'

export type AssetRow = {
  id: number
  name: 'Money' | 'Intel' | 'Agents'
  displayedName?: string
  value: number
  projected?: number
  diff?: number
}

export type UpgradeRow = {
  id: number
  name:
    | 'Agent cap'
    | 'Transport cap'
    | 'Training cap'
    | 'Training skill gain'
    | 'Exhaustion recovery'
    | 'Health recovery'
  displayedName?: string
  value: number
  buy: number
}

export function AssetsDataGrid(): React.JSX.Element {
  const gameState = useAppSelector((state) => state.undoable.present.gameState)
  const moneyProjected = getMoneyNewBalance(gameState)
  const intelProjected = getIntelNewBalance(gameState)
  const moneyDiff = moneyProjected - gameState.money
  const intelDiff = intelProjected - gameState.intel
  const agentCount = agsV(gameState.agents).notTerminated().length

  // First card: Assets with Current and Projected columns
  const assetRows: AssetRow[] = [
    { name: 'Agents', id: 1, value: agentCount },
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

  // Second card: Upgrades with Current and Buy columns
  const upgradeRows: UpgradeRow[] = [
    { name: 'Agent cap', id: 4, value: gameState.agentCap, buy: 0 },
    { name: 'Transport cap', id: 5, value: gameState.transportCap, buy: 0 },
    { name: 'Training cap', id: 6, value: gameState.trainingCap, buy: 0 },
    { name: 'Training skill gain', id: 7, value: gameState.trainingSkillGain, buy: 0 },
    {
      name: 'Exhaustion recovery',
      id: 8,
      value: gameState.exhaustionRecovery,
      displayedName: 'Exhaustion recov.',
      buy: 0,
    },
    { name: 'Health recovery', id: 9, value: gameState.healthRecovery, displayedName: 'Health recov.', buy: 0 },
  ]

  const upgradeColumns: GridColDef[] = [
    {
      field: 'name',
      headerName: 'Asset',
      width: 160,
      renderCell: (params: GridRenderCellParams<UpgradeRow>): React.JSX.Element => {
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
      field: 'buy',
      headerName: 'Buy',
      minWidth: 100,
    },
  ]

  return (
    <ExpandableCard title="Assets" defaultExpanded={true}>
      <Stack spacing={2}>
        <StyledDataGrid rows={assetRows} columns={assetColumns} aria-label="Assets" />
        <StyledDataGrid rows={upgradeRows} columns={upgradeColumns} aria-label="Upgrades" />
      </Stack>
    </ExpandableCard>
  )
}
