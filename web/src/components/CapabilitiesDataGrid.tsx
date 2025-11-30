import {
  createRowSelectionManager,
  type GridColDef,
  type GridRenderCellParams,
  type GridRowId,
  type GridRowSelectionModel,
} from '@mui/x-data-grid'
import * as React from 'react'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import { setUpgradeSelection, clearUpgradeSelection } from '../lib/slices/selectionSlice'
import { StyledDataGrid } from './StyledDataGrid'
import { f6fmtDec2 } from '../lib/model/fixed6'

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

export function CapabilitiesDataGrid(): React.JSX.Element {
  const dispatch = useAppDispatch()
  const gameState = useAppSelector((state) => state.undoable.present.gameState)
  const selectedUpgradeName = useAppSelector((state) => state.selection.selectedUpgradeName)

  const UPGRADE_PRICE = 100
  const upgradeRows: UpgradeRow[] = [
    { name: 'Agent cap', id: 4, value: gameState.agentCap, price: UPGRADE_PRICE },
    { name: 'Transport cap', id: 5, value: gameState.transportCap, price: UPGRADE_PRICE },
    { name: 'Training cap', id: 6, value: gameState.trainingCap, price: UPGRADE_PRICE },
    { name: 'Training skill gain', id: 7, value: f6fmtDec2(gameState.trainingSkillGain), price: UPGRADE_PRICE },
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
      headerName: 'Capability',
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
