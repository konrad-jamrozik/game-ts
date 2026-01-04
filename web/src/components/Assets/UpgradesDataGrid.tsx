import { createRowSelectionManager, type GridRowId, type GridRowSelectionModel } from '@mui/x-data-grid'
import * as React from 'react'
import { useAppDispatch, useAppSelector } from '../../redux/hooks'
import { UPGRADE_PRICES, UPGRADE_INCREMENTS } from '../../lib/data_tables/upgrades'
import { setUpgradeSelection, clearUpgradeSelection } from '../../redux/slices/selectionSlice'
import { StyledDataGrid } from '../Common/StyledDataGrid'
import { isF6, type Fixed6, f6fmtDec2 } from '../../lib/primitives/fixed6'
import { getCapabilitiesColumns, type UpgradeRow } from './getCapabilitiesColumns'
import { getCurrentTurnState } from '../../redux/storeUtils'

export function UpgradesDataGrid(): React.JSX.Element {
  const dispatch = useAppDispatch()
  const gameState = useAppSelector(getCurrentTurnState)
  const selectedUpgradeName = useAppSelector((state) => state.selection.selectedUpgradeName)

  const upgradeRows: UpgradeRow[] = [
    {
      name: 'Training skill gain',
      id: 7,
      value: f6fmtDec2(gameState.trainingSkillGain),
      upgrade: fmtUpgradeIncrement(UPGRADE_INCREMENTS['Training skill gain']),
      price: UPGRADE_PRICES['Training skill gain'],
    },
    {
      name: 'Exhaustion recovery %',
      id: 8,
      value: f6fmtDec2(gameState.exhaustionRecovery),
      upgrade: fmtUpgradeIncrement(UPGRADE_INCREMENTS['Exhaustion recovery %']),
      displayedName: 'Exhaustion recov. %',
      price: UPGRADE_PRICES['Exhaustion recovery %'],
    },
    {
      name: 'Hit points recovery %',
      id: 9,
      value: f6fmtDec2(gameState.hitPointsRecoveryPct),
      upgrade: fmtUpgradeIncrement(UPGRADE_INCREMENTS['Hit points recovery %']),
      displayedName: 'Hit points recov. %',
      price: UPGRADE_PRICES['Hit points recovery %'],
    },
    {
      name: 'Hit points',
      id: 10,
      value: gameState.agentMaxHitPoints,
      upgrade: fmtUpgradeIncrement(UPGRADE_INCREMENTS['Hit points']),
      price: UPGRADE_PRICES['Hit points'],
    },
    {
      name: 'Weapon damage',
      id: 11,
      value: gameState.weaponDamage,
      upgrade: fmtUpgradeIncrement(UPGRADE_INCREMENTS['Weapon damage']),
      price: UPGRADE_PRICES['Weapon damage'],
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

  const upgradeColumns = getCapabilitiesColumns()

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
      sx={{
        '& .capabilities-color-bar-cell': {
          padding: '4px',
        },
      }}
    />
  )
}

function fmtUpgradeIncrement(increment: number | Fixed6): number | string {
  if (isF6(increment)) {
    return f6fmtDec2(increment)
  }
  return increment
}
