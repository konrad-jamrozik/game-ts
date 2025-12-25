import { createRowSelectionManager, type GridRowId, type GridRowSelectionModel } from '@mui/x-data-grid'
import * as React from 'react'
import { useAppDispatch, useAppSelector } from '../../redux/hooks'
import { UPGRADE_PRICES, UPGRADE_INCREMENTS } from '../../lib/data_tables/upgrades'
import { setUpgradeSelection, clearUpgradeSelection } from '../../redux/slices/selectionSlice'
import { StyledDataGrid } from '../Common/StyledDataGrid'
import { isF6, type Fixed6, f6fmtDec2, toF } from '../../lib/primitives/fixed6'
import { getRemainingTransportCap } from '../../lib/model_utils/missionUtils'
import { notTerminated, onTrainingAssignment } from '../../lib/model_utils/agentUtils'
import { getCapabilitiesColumns, type UpgradeRow } from './getCapabilitiesColumns'

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

  const currentAgentCount = notTerminated(gameState.agents).length
  const remainingAgentCap = Math.max(gameState.agentCap - currentAgentCount, 0)
  const remainingTransportCap = getRemainingTransportCap(gameState.missions, gameState.transportCap)
  const agentsInTraining = onTrainingAssignment(gameState.agents).length
  const remainingTrainingCap = Math.max(gameState.trainingCap - agentsInTraining, 0)

  const upgradeRows: UpgradeRow[] = [
    {
      name: 'Agent cap',
      id: 4,
      value: `${remainingAgentCap} / ${gameState.agentCap}`,
      upgrade: formatUpgradeIncrement(UPGRADE_INCREMENTS['Agent cap']),
      price: UPGRADE_PRICES['Agent cap'],
    },
    {
      name: 'Transport cap',
      id: 5,
      value: `${remainingTransportCap} / ${gameState.transportCap}`,
      upgrade: formatUpgradeIncrement(UPGRADE_INCREMENTS['Transport cap']),
      price: UPGRADE_PRICES['Transport cap'],
    },
    {
      name: 'Training cap',
      id: 6,
      value: `${remainingTrainingCap} / ${gameState.trainingCap}`,
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
      value: toF(gameState.exhaustionRecovery),
      upgrade: formatUpgradeIncrement(UPGRADE_INCREMENTS['Exhaustion recovery']),
      displayedName: 'Exhaustion recov.',
      price: UPGRADE_PRICES['Exhaustion recovery'],
    },
    {
      name: 'Hit points recovery %',
      id: 9,
      value: f6fmtDec2(gameState.hitPointsRecoveryPct),
      upgrade: formatUpgradeIncrement(UPGRADE_INCREMENTS['Hit points recovery %']),
      displayedName: 'Hit points recov. %',
      price: UPGRADE_PRICES['Hit points recovery %'],
    },
    {
      name: 'Weapon damage',
      id: 10,
      value: gameState.weaponDamage,
      upgrade: formatUpgradeIncrement(UPGRADE_INCREMENTS['Weapon damage']),
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
    />
  )
}
