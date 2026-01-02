import { createRowSelectionManager, type GridRowId, type GridRowSelectionModel } from '@mui/x-data-grid'
import * as React from 'react'
import { useAppDispatch, useAppSelector } from '../../redux/hooks'
import { UPGRADE_PRICES, UPGRADE_INCREMENTS } from '../../lib/data_tables/upgrades'
import { setUpgradeSelection, clearUpgradeSelection } from '../../redux/slices/selectionSlice'
import { StyledDataGrid } from '../Common/StyledDataGrid'
import { isF6, type Fixed6, f6fmtDec2 } from '../../lib/primitives/fixed6'
import { getRemainingTransportCap } from '../../lib/model_utils/missionUtils'
import { onTrainingAssignment } from '../../lib/model_utils/agentUtils'
import { getCapabilitiesColumns, type UpgradeRow } from './getCapabilitiesColumns'
import { getCurrentTurnState } from '../../redux/storeUtils'

export function CapacitiesDataGrid(): React.JSX.Element {
  const dispatch = useAppDispatch()
  const gameState = useAppSelector(getCurrentTurnState)
  const selectedUpgradeName = useAppSelector((state) => state.selection.selectedUpgradeName)

  const currentAgentCount = gameState.agents.length
  const remainingAgentCap = Math.max(gameState.agentCap - currentAgentCount, 0)
  const remainingTransportCap = getRemainingTransportCap(gameState.missions, gameState.transportCap)
  const agentsInTraining = onTrainingAssignment(gameState.agents).length
  const remainingTrainingCap = Math.max(gameState.trainingCap - agentsInTraining, 0)

  const capacityRows: UpgradeRow[] = [
    {
      name: 'Agent cap',
      id: 4,
      value: `${remainingAgentCap} / ${gameState.agentCap}`,
      remaining: remainingAgentCap,
      total: gameState.agentCap,
      upgrade: fmtUpgradeIncrement(UPGRADE_INCREMENTS['Agent cap']),
      price: UPGRADE_PRICES['Agent cap'],
    },
    {
      name: 'Transport cap',
      id: 5,
      value: `${remainingTransportCap} / ${gameState.transportCap}`,
      remaining: remainingTransportCap,
      total: gameState.transportCap,
      upgrade: fmtUpgradeIncrement(UPGRADE_INCREMENTS['Transport cap']),
      price: UPGRADE_PRICES['Transport cap'],
    },
    {
      name: 'Training cap',
      id: 6,
      value: `${remainingTrainingCap} / ${gameState.trainingCap}`,
      remaining: remainingTrainingCap,
      total: gameState.trainingCap,
      upgrade: fmtUpgradeIncrement(UPGRADE_INCREMENTS['Training cap']),
      price: UPGRADE_PRICES['Training cap'],
    },
  ]

  function handleUpgradeSelectionChange(newSelectionModel: GridRowSelectionModel): void {
    const mgr = createRowSelectionManager(newSelectionModel)
    const existingRowIds = capacityRows.map((row) => row.id)
    const includedRowIds = existingRowIds.filter((id) => mgr.has(id))

    if (includedRowIds.length > 0) {
      const [selectedRowId] = includedRowIds
      const selectedRow = capacityRows.find((row) => row.id === selectedRowId)
      if (selectedRow) {
        dispatch(setUpgradeSelection(selectedRow.name))
      }
    } else {
      dispatch(clearUpgradeSelection())
    }
  }

  const selectedUpgradeRow = capacityRows.find((row) => row.name === selectedUpgradeName)
  const upgradeSelectionModel: GridRowSelectionModel = {
    type: 'include',
    ids: selectedUpgradeRow ? new Set<GridRowId>([selectedUpgradeRow.id]) : new Set<GridRowId>(),
  }

  const capacityColumns = getCapabilitiesColumns()

  return (
    <StyledDataGrid
      rows={capacityRows}
      columns={capacityColumns}
      aria-label="Capacities"
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
