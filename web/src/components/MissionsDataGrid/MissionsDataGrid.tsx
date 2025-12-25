import {
  createRowSelectionManager,
  type GridRowId,
  type GridRowParams,
  type GridRowSelectionModel,
} from '@mui/x-data-grid'
import * as React from 'react'
import { useAppDispatch, useAppSelector } from '../../redux/hooks'
import { getMissionDataById } from '../../lib/data_table_utils/getterUtils'
import type { Mission } from '../../lib/model/missionModel'
import { clearMissionSelection, setMissionSelection } from '../../redux/slices/selectionSlice'
import {
  getActiveOrDeployedMissions,
  getArchivedMissions,
  sortActiveOrDeployedMissions,
  sortMissionsByIdDesc,
} from '../../lib/model_utils/missionUtils'
import { fmtNoPrefix } from '../../lib/primitives/formatPrimitives'
import { getCompletedMissionIds } from '../../lib/model_utils/turnReportUtils'
import { DataGridCard } from '../Common/DataGridCard'
import { MissionsDataGridToolbar } from './MissionsDataGridToolbar'
import { getMissionsColumns } from './getMissionsColumns'
import { MIDDLE_COLUMN_CARD_WIDTH } from '../Common/widthConstants'

export type MissionRow = Mission & {
  rowId: number
  name: string
  displayId: string
}

export function MissionsDataGrid(): React.JSX.Element {
  const dispatch = useAppDispatch()
  const gameState = useAppSelector((state) => state.undoable.present.gameState)
  const { missions, turnStartReport } = gameState
  const selectedMissionId = useAppSelector((state) => state.selection.selectedMissionId)
  const [showArchived, setShowArchived] = React.useState(false)

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

  // Filter rows based on archived checkbox: show ONLY archived when checked, ONLY active when unchecked
  const rows: MissionRow[] = showArchived ? allArchivedRows : allActiveRows

  const columns = getMissionsColumns(dispatch, gameState)

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

  return (
    <DataGridCard
      id="missions"
      title={`Missions (${rows.length})`}
      width={MIDDLE_COLUMN_CARD_WIDTH}
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
          showArchived,
          onToggleArchived: setShowArchived,
        },
      }}
      showToolbar
      sx={{
        '& .missions-expires-in-cell': {
          padding: '4px',
        },
      }}
    />
  )
}
