import {
  createRowSelectionManager,
  type GridRowId,
  type GridRowParams,
  type GridRowSelectionModel,
} from '@mui/x-data-grid'
import * as React from 'react'
import { useAppDispatch, useAppSelector } from '../../redux/hooks'
import { getMissionSiteDefinitionById } from '../../lib/collections/missions'
import type { MissionSite } from '../../lib/model/missionSiteModel'
import { clearMissionSelection, setMissionSiteSelection } from '../../redux/slices/selectionSlice'
import {
  getActiveOrDeployedMissionSites,
  getArchivedMissionSites,
  sortActiveOrDeployedMissionSites,
  sortMissionSitesByIdDesc,
} from '../../lib/model_utils/missionSiteUtils'
import { fmtNoPrefix } from '../../lib/primitives/formatPrimitives'
import { getCompletedMissionSiteIds } from '../../lib/model_utils/turnReportUtils'
import { DataGridCard } from '../Common/DataGridCard'
import { MissionSitesDataGridToolbar } from './MissionSitesDataGridToolbar'
import { getMissionSitesColumns } from './getMissionSitesColumns'
import { MIDDLE_COLUMN_CARD_WIDTH } from '../Common/widthConstants'

export type MissionRow = MissionSite & {
  rowId: number
  name: string
  displayId: string
}

export function MissionSitesDataGrid(): React.JSX.Element {
  const dispatch = useAppDispatch()
  const gameState = useAppSelector((state) => state.undoable.present.gameState)
  const { missionSites, turnStartReport } = gameState
  const selectedMissionSiteId = useAppSelector((state) => state.selection.selectedMissionSiteId)
  const [showArchived, setShowArchived] = React.useState(false)

  const completedThisTurnIds: Set<string> = getCompletedMissionSiteIds(turnStartReport)

  // Get active and archived mission sites
  const activeMissionSites = getActiveOrDeployedMissionSites(missionSites)
  const archivedMissionSites = getArchivedMissionSites(missionSites)

  // Include completed missions (Won, Wiped, Retreated, Expired) in active rows if they completed this turn
  const completedThisTurnSites = archivedMissionSites.filter((site) => completedThisTurnIds.has(site.id))
  const activeMissionSitesIncludingCompleted = [...activeMissionSites, ...completedThisTurnSites]

  const sortedActiveMissionSites = sortActiveOrDeployedMissionSites(activeMissionSitesIncludingCompleted)
  const sortedArchivedMissionSites = sortMissionSitesByIdDesc(archivedMissionSites)

  // Transform all mission sites to rows (both active and archived)
  const allActiveRows: MissionRow[] = sortedActiveMissionSites.map((site, index) => {
    const missionSiteDefinition = getMissionSiteDefinitionById(site.missionSiteDefinitionId)
    const displayId = fmtNoPrefix(site.id, 'mission-site-')

    return {
      ...site,
      rowId: index,
      name: missionSiteDefinition.name,
      displayId,
    }
  })

  const allArchivedRows: MissionRow[] = sortedArchivedMissionSites.map((site, index) => {
    const missionSiteDefinition = getMissionSiteDefinitionById(site.missionSiteDefinitionId)
    const displayId = fmtNoPrefix(site.id, 'mission-site-')

    return {
      ...site,
      rowId: allActiveRows.length + index,
      name: missionSiteDefinition.name,
      displayId,
    }
  })

  // Filter rows based on archived checkbox: show ONLY archived when checked, ONLY active when unchecked
  const rows: MissionRow[] = showArchived ? allArchivedRows : allActiveRows

  const columns = getMissionSitesColumns(dispatch)

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
        // Only allow selection of Active mission sites
        dispatch(setMissionSiteSelection(row.id))
      } else {
        // If trying to select any other mission site, clear selection
        dispatch(clearMissionSelection())
      }
    }
  }

  // Convert selected mission site ID back to row ID for DataGrid
  // Clear selection if selected row is not in currently displayed rows
  const rowIds: GridRowId[] = []
  if (selectedMissionSiteId !== undefined) {
    const row = rows.find((rowCandidate) => rowCandidate.id === selectedMissionSiteId)
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
      id="mission-sites"
      title={`Mission sites (${rows.length})`}
      width={MIDDLE_COLUMN_CARD_WIDTH}
      rows={rows}
      columns={columns}
      getRowId={(row: MissionRow) => row.rowId}
      checkboxSelection
      disableMultipleRowSelection
      onRowSelectionModelChange={handleRowSelectionChange}
      rowSelectionModel={model}
      isRowSelectable={(params: GridRowParams<MissionRow>) => params.row.state === 'Active'}
      slots={{ toolbar: MissionSitesDataGridToolbar }}
      slotProps={{
        toolbar: {
          showArchived,
          onToggleArchived: setShowArchived,
        },
      }}
      showToolbar
      sx={{
        '& .mission-sites-expires-in-cell': {
          padding: '4px',
        },
      }}
    />
  )
}
