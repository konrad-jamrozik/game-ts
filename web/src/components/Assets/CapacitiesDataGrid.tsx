import {
  createRowSelectionManager,
  type GridRowId,
  type GridRowParams,
  type GridRowSelectionModel,
} from '@mui/x-data-grid'
import * as React from 'react'
import { getUpgradeIncrement, UPGRADE_PRICES } from '../../lib/data_tables/upgrades'
import { useAppDispatch, useAppSelector } from '../../redux/hooks'
import { clearUpgradeSelection, openUpgradesDrilldown, setUpgradeSelection } from '../../redux/slices/selectionSlice'
import { StyledDataGrid } from '../Common/StyledDataGrid'
import { getRemainingTransportCap } from '../../lib/model_utils/missionUtils'
import { onTrainingAssignment } from '../../lib/model_utils/agentUtils'
import { getReadOnlyCapabilitiesColumns, getShopCapabilitiesColumns, type UpgradeRow } from './getCapabilitiesColumns'
import { getCurrentTurnState } from '../../redux/storeUtils'
import { DATA_GRID_CELL_PADDING } from '../styling/spacing'
import { clickableRowSx, combineSx } from '../styling/stylePrimitives'

export function CapacitiesDataGrid({ mode = 'readOnly' }: CapacitiesDataGridProps): React.JSX.Element {
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
      upgrade: getUpgradeIncrement('Agent cap'),
      price: UPGRADE_PRICES['Agent cap'],
    },
    {
      name: 'Transport cap',
      id: 5,
      value: `${remainingTransportCap} / ${gameState.transportCap}`,
      remaining: remainingTransportCap,
      total: gameState.transportCap,
      upgrade: getUpgradeIncrement('Transport cap'),
      price: UPGRADE_PRICES['Transport cap'],
    },
    {
      name: 'Training cap',
      id: 6,
      value: `${remainingTrainingCap} / ${gameState.trainingCap}`,
      remaining: remainingTrainingCap,
      total: gameState.trainingCap,
      upgrade: getUpgradeIncrement('Training cap'),
      price: UPGRADE_PRICES['Training cap'],
    },
  ]

  function handleCapacitySelectionChange(newSelectionModel: GridRowSelectionModel): void {
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

  function handleCapacityRowClick(params: GridRowParams<UpgradeRow>): void {
    dispatch(openUpgradesDrilldown(params.row.name))
  }

  const selectedCapacityRow = capacityRows.find((row) => row.name === selectedUpgradeName)
  const capacitySelectionModel: GridRowSelectionModel = {
    type: 'include',
    ids: selectedCapacityRow ? new Set<GridRowId>([selectedCapacityRow.id]) : new Set<GridRowId>(),
  }

  if (mode === 'shop') {
    return (
      <StyledDataGrid
        rows={capacityRows}
        columns={getShopCapabilitiesColumns()}
        aria-label="Capacities"
        checkboxSelection
        rowSelectionModel={capacitySelectionModel}
        onRowSelectionModelChange={handleCapacitySelectionChange}
        disableRowSelectionOnClick={false}
        disableMultipleRowSelection
        sx={{
          '& .capabilities-color-bar-cell': {
            padding: DATA_GRID_CELL_PADDING,
          },
        }}
      />
    )
  }

  return (
    <StyledDataGrid
      rows={capacityRows}
      columns={getReadOnlyCapabilitiesColumns()}
      aria-label="Capacities"
      onRowClick={handleCapacityRowClick}
      disableRowSelectionOnClick
      sx={combineSx(clickableRowSx, capacitiesColorBarSx)}
    />
  )
}

type CapacitiesDataGridProps = {
  mode?: 'readOnly' | 'shop'
}

const capacitiesColorBarSx = {
  '& .capabilities-color-bar-cell': {
    padding: DATA_GRID_CELL_PADDING,
  },
}
