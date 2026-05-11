import {
  createRowSelectionManager,
  type GridRowId,
  type GridRowParams,
  type GridRowSelectionModel,
} from '@mui/x-data-grid'
import * as React from 'react'
import { useAppDispatch, useAppSelector } from '../../redux/hooks'
import {
  clearMissionSelection,
  openMissionsDrilldown,
  setMissionSelection,
  type MissionsFilterType,
} from '../../redux/slices/selectionSlice'
import {
  getActiveOrDeployedMissions,
  getArchivedMissions,
  getMissionDataById,
  sortActiveOrDeployedMissions,
  sortMissionsByIdDesc,
} from '../../lib/model_utils/missionUtils'
import { fmtNoPrefix } from '../../lib/primitives/formatPrimitives'
import { getCompletedMissionIds } from '../../lib/model_utils/turnReportUtils'
import { StyledDataGrid } from '../Common/StyledDataGrid'
import { MissionsDataGridToolbar } from './MissionsDataGridToolbar'
import { getMissionsColumns, type MissionRow } from './getMissionsColumns'
import { getCurrentTurnState } from '../../redux/storeUtils'
import { DATA_GRID_CELL_PADDING } from '../styling/spacing'

export function MissionsDataGrid(): React.JSX.Element {
  const dispatch = useAppDispatch()
  const gameState = useAppSelector(getCurrentTurnState)
  const { missions, turnStartReport } = gameState
  const selectedMissionId = useAppSelector((state) => state.selection.selectedMissionId)
  const filterType = useAppSelector((state) => state.selection.missionsFilterType ?? 'all')

  const completedThisTurnIds: Set<string> = getCompletedMissionIds(turnStartReport)

  // Get active and archived missions
  const activeMissions = getActiveOrDeployedMissions(missions)
  const archivedMissions = getArchivedMissions(missions)

  // Include completed missions (Won, Wiped, Retreated, Expired) in active rows if they completed this turn
  const completedThisTurnMissions = archivedMissions.filter((mission) => completedThisTurnIds.has(mission.id))
  const activeMissionsIncludingCompleted = [...activeMissions, ...completedThisTurnMissions]

  const sortedActiveMissions = sortActiveOrDeployedMissions(activeMissionsIncludingCompleted)
  const sortedArchivedMissions = sortMissionsByIdDesc(archivedMissions)

  // Transform all missions to rows (both active and archived)
  const allActiveRows: MissionRow[] = sortedActiveMissions.map((mission, index) => {
    const missionData = getMissionDataById(mission.missionDataId)
    const displayId = fmtNoPrefix(mission.id, 'mission-')

    return {
      ...mission,
      rowId: index,
      name: missionData.name,
      displayId,
    }
  })

  const allArchivedRows: MissionRow[] = sortedArchivedMissions.map((mission, index) => {
    const missionData = getMissionDataById(mission.missionDataId)
    const displayId = fmtNoPrefix(mission.id, 'mission-')

    return {
      ...mission,
      rowId: allActiveRows.length + index,
      name: missionData.name,
      displayId,
    }
  })

  const rows = filterMissionRows(allActiveRows, allArchivedRows, filterType)
  const showArchived = filterType === 'archived'

  const columns = getMissionsColumns(dispatch, gameState, showArchived)

  function handleFilterTypeChange(nextFilterType: MissionsFilterType): void {
    dispatch(openMissionsDrilldown(nextFilterType))
  }

  function handleRowSelectionChange(newSelectionModel: GridRowSelectionModel): void {
    const mgr = createRowSelectionManager(newSelectionModel)
    const existingRowIds = rows.map((row) => row.rowId)
    const selectedRowIds = existingRowIds.filter((id) => mgr.has(id))

    if (selectedRowIds.length === 0) {
      dispatch(clearMissionSelection())
    } else {
      // We assume disableMultipleRowSelection, so we assume there is exactly one rowId in selectedRowIds
      const [rowId] = selectedRowIds
      const row = rows.find((rowItem) => rowItem.rowId === rowId)
      if (row && row.state === 'Active') {
        // Only allow selection of Active missions
        dispatch(setMissionSelection(row.id))
      } else {
        // If trying to select any other mission, clear selection
        dispatch(clearMissionSelection())
      }
    }
  }

  // Convert selected mission ID back to row ID for DataGrid
  // Clear selection if selected row is not in currently displayed rows
  const rowIds: GridRowId[] = []
  if (selectedMissionId !== undefined) {
    const row = rows.find((rowCandidate) => rowCandidate.id === selectedMissionId)
    if (row) {
      rowIds.push(row.rowId)
    } else {
      // Selected row is not in currently displayed rows, clear selection
      dispatch(clearMissionSelection())
    }
  }

  const idsSet = new Set<GridRowId>(rowIds)
  const model: GridRowSelectionModel = { type: 'include', ids: idsSet }
  const allCount = allActiveRows.length
  const expiringSoonCount = filterMissionRows(allActiveRows, allArchivedRows, 'expiringSoon').length
  const deployedCount = filterMissionRows(allActiveRows, allArchivedRows, 'deployed').length
  const archivedCount = allArchivedRows.length

  return (
    <StyledDataGrid
      aria-label="Missions"
      rows={rows}
      columns={columns}
      getRowId={(row: MissionRow) => row.rowId}
      checkboxSelection
      disableMultipleRowSelection
      onRowSelectionModelChange={handleRowSelectionChange}
      rowSelectionModel={model}
      isRowSelectable={(params: GridRowParams<MissionRow>) => params.row.state === 'Active'}
      slots={{ toolbar: MissionsDataGridToolbar }}
      slotProps={{
        toolbar: {
          missionsFilterType: filterType,
          allCount,
          expiringSoonCount,
          deployedCount,
          archivedCount,
          onMissionsFilterTypeChange: handleFilterTypeChange,
        },
      }}
      showToolbar
      sx={{
        '& .missions-expires-in-cell': {
          padding: DATA_GRID_CELL_PADDING,
        },
      }}
    />
  )
}

function filterMissionRows(
  allActiveRows: readonly MissionRow[],
  allArchivedRows: readonly MissionRow[],
  filterType: MissionsFilterType,
): MissionRow[] {
  if (filterType === 'archived') {
    return [...allArchivedRows]
  }

  if (filterType === 'expiringSoon') {
    return allActiveRows.filter(
      (mission) => mission.state === 'Active' && mission.expiresIn !== 'never' && mission.expiresIn <= 3,
    )
  }

  if (filterType === 'deployed') {
    return allActiveRows.filter((mission) => mission.state === 'Deployed')
  }

  return [...allActiveRows]
}
