import {
  createRowSelectionManager,
  type GridColDef,
  type GridRenderCellParams,
  type GridRowId,
  type GridRowSelectionModel,
} from '@mui/x-data-grid'
import Stack from '@mui/material/Stack'
import * as React from 'react'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import { getMoneyNewBalance } from '../lib/model/ruleset/moneyRuleset'
import { getIntelNewBalance } from '../lib/model/ruleset/intelRuleset'
import { agsV } from '../lib/model/agents/AgentsView'
import { setUpgradeSelection, clearUpgradeSelection } from '../lib/slices/selectionSlice'
import { ExpandableCard } from './ExpandableCard'
import { StyledDataGrid } from './StyledDataGrid'
import { MyChip } from './MyChip'
import { f2fmt } from '../lib/model/fixed2'

export type AssetRow = {
  id: number
  name: 'Money' | 'Intel' | 'Agents' | 'Funding'
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
    | 'Hit points recovery %'
  displayedName?: string
  value: number | string
  price: number
}

export function AssetsDataGrid(): React.JSX.Element {
  const dispatch = useAppDispatch()
  const gameState = useAppSelector((state) => state.undoable.present.gameState)
  const selectedUpgradeName = useAppSelector((state) => state.selection.selectedUpgradeName)
  const moneyProjected = getMoneyNewBalance(gameState)
  const intelProjected = getIntelNewBalance(gameState)
  const moneyDiff = moneyProjected - gameState.money
  const intelDiff = intelProjected - gameState.intel
  const agentCount = agsV(gameState.agents).notTerminated().length

  // First card: Assets with Current and Projected columns
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

  // Second card: Upgrades with Current and Price columns
  const UPGRADE_PRICE = 100
  const upgradeRows: UpgradeRow[] = [
    { name: 'Agent cap', id: 4, value: gameState.agentCap, price: UPGRADE_PRICE },
    { name: 'Transport cap', id: 5, value: gameState.transportCap, price: UPGRADE_PRICE },
    { name: 'Training cap', id: 6, value: gameState.trainingCap, price: UPGRADE_PRICE },
    { name: 'Training skill gain', id: 7, value: f2fmt(gameState.trainingSkillGain), price: UPGRADE_PRICE },
    {
      name: 'Exhaustion recovery',
      id: 8,
      value: gameState.exhaustionRecovery,
      displayedName: 'Exhaustion recov.',
      price: UPGRADE_PRICE,
    },
    {
      name: 'Hit points recovery %',
      id: 9,
      value: gameState.hitPointsRecoveryPct,
      displayedName: 'Hit points recov. %',
      price: UPGRADE_PRICE,
    },
  ]

  function handleUpgradeSelectionChange(newSelectionModel: GridRowSelectionModel): void {
    const mgr = createRowSelectionManager(newSelectionModel)
    const existingRowIds = upgradeRows.map((row) => row.id)
    const includedRowIds = existingRowIds.filter((id) => mgr.has(id))

    if (includedRowIds.length > 0) {
      const [selectedRowId] = includedRowIds
      const selectedRow = upgradeRows.find((row) => row.id === selectedRowId)
      if (selectedRow) {
        dispatch(setUpgradeSelection(selectedRow.name))
      }
    } else {
      dispatch(clearUpgradeSelection())
    }
  }

  const selectedUpgradeRow = upgradeRows.find((row) => row.name === selectedUpgradeName)
  const upgradeSelectionModel: GridRowSelectionModel = {
    type: 'include',
    ids: selectedUpgradeRow ? new Set<GridRowId>([selectedUpgradeRow.id]) : new Set<GridRowId>(),
  }

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
      field: 'price',
      headerName: 'Price for 1',
      minWidth: 100,
    },
  ]

  return (
    <ExpandableCard title="Assets" defaultExpanded={true}>
      <Stack spacing={2}>
        <StyledDataGrid rows={assetRows} columns={assetColumns} aria-label="Assets" />
        <StyledDataGrid
          rows={upgradeRows}
          columns={upgradeColumns}
          aria-label="Upgrades"
          checkboxSelection
          rowSelectionModel={upgradeSelectionModel}
          onRowSelectionModelChange={handleUpgradeSelectionChange}
          disableRowSelectionOnClick={false}
          disableMultipleRowSelection
        />
      </Stack>
    </ExpandableCard>
  )
}
