import {
  createRowSelectionManager,
  type GridColDef,
  type GridRenderCellParams,
  type GridRowId,
  type GridRowSelectionModel,
} from '@mui/x-data-grid'
import * as React from 'react'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import { UPGRADE_PRICES, UPGRADE_INCREMENTS } from '../lib/collections/upgrades'
import { setUpgradeSelection, clearUpgradeSelection } from '../lib/slices/selectionSlice'
import { StyledDataGrid } from '../Common/StyledDataGrid'
import { isF6, type Fixed6 } from '../lib/primitives/fixed6Primitives'
import { f6fmtDec2 } from '../lib/utils/fixed6Utils'

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
  upgrade: number | string
  price: number
}

export function CapabilitiesDataGrid(): React.JSX.Element {
  const dispatch = useAppDispatch()
  const gameState = useAppSelector((state) => state.undoable.present.gameState)
  const selectedUpgradeName = useAppSelector((state) => state.selection.selectedUpgradeName)

  function formatUpgradeIncrement(increment: number | Fixed6): number | string {
    if (isF6(increment)) {
      return f6fmtDec2(increment)
    }
    return increment
  }

  const upgradeRows: UpgradeRow[] = [
    {
      name: 'Agent cap',
      id: 4,
      value: gameState.agentCap,
      upgrade: formatUpgradeIncrement(UPGRADE_INCREMENTS['Agent cap']),
      price: UPGRADE_PRICES['Agent cap'],
    },
    {
      name: 'Transport cap',
      id: 5,
      value: gameState.transportCap,
      upgrade: formatUpgradeIncrement(UPGRADE_INCREMENTS['Transport cap']),
      price: UPGRADE_PRICES['Transport cap'],
    },
    {
      name: 'Training cap',
      id: 6,
      value: gameState.trainingCap,
      upgrade: formatUpgradeIncrement(UPGRADE_INCREMENTS['Training cap']),
      price: UPGRADE_PRICES['Training cap'],
    },
    {
      name: 'Training skill gain',
      id: 7,
      value: f6fmtDec2(gameState.trainingSkillGain),
      upgrade: formatUpgradeIncrement(UPGRADE_INCREMENTS['Training skill gain']),
      price: UPGRADE_PRICES['Training skill gain'],
    },
    {
      name: 'Exhaustion recovery',
      id: 8,
      value: gameState.exhaustionRecovery,
      upgrade: formatUpgradeIncrement(UPGRADE_INCREMENTS['Exhaustion recovery']),
      displayedName: 'Exhaustion recov.',
      price: UPGRADE_PRICES['Exhaustion recovery'],
    },
    {
      name: 'Hit points recovery %',
      id: 9,
      value: gameState.hitPointsRecoveryPct,
      upgrade: formatUpgradeIncrement(UPGRADE_INCREMENTS['Hit points recovery %']),
      displayedName: 'Hit points recov. %',
      price: UPGRADE_PRICES['Hit points recovery %'],
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
      headerName: 'Capability',
      width: 140,
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
      field: 'upgrade',
      headerName: 'Upgrade',
      minWidth: 100,
    },
    {
      field: 'price',
      headerName: 'Price',
      minWidth: 100,
    },
  ]

  return (
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
  )
}
