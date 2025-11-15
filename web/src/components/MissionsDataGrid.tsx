import {
  createRowSelectionManager,
  type GridColDef,
  type GridRenderCellParams,
  type GridRowId,
  type GridRowParams,
  type GridRowSelectionModel,
} from '@mui/x-data-grid'
import * as React from 'react'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import { getMissionById } from '../lib/collections/missions'
import type { MissionSite } from '../lib/model/model'
import { clearMissionSelection, setMissionSiteSelection } from '../lib/slices/selectionSlice'
import { getActiveOrDeployedMissionSites, sortActiveOrDeployedMissionSites } from '../lib/utils/MissionSiteUtils'
import { fmtNoPrefix } from '../lib/utils/formatUtils'
import { DataGridCard } from './DataGridCard'

export type MissionRow = MissionSite & {
  rowId: number
  title: string
  displayId: string
}

export function MissionsDataGrid(): React.JSX.Element {
  const dispatch = useAppDispatch()
  const missionSites = useAppSelector((state) => state.undoable.present.gameState.missionSites)
  const selectedMissionSiteId = useAppSelector((state) => state.selection.selectedMissionSiteId)

  // Get and sort active mission sites
  const activeMissionSites = getActiveOrDeployedMissionSites(missionSites)
  const sortedActiveMissionSites = sortActiveOrDeployedMissionSites(activeMissionSites)

  // Transform mission sites to rows with mission data
  const rows: MissionRow[] = sortedActiveMissionSites.map((site, index) => {
    const mission = getMissionById(site.missionId)
    const displayId = fmtNoPrefix(site.id, 'mission-site-')

    return {
      ...site,
      rowId: index,
      title: mission.title,
      displayId,
    }
  })

  const columns = createMissionColumns()

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
  const rowIds: GridRowId[] = []
  if (selectedMissionSiteId !== undefined) {
    const row = rows.find((rowCandidate) => rowCandidate.id === selectedMissionSiteId)
    if (row) {
      rowIds.push(row.rowId)
    }
  }

  const idsSet = new Set<GridRowId>(rowIds)
  const model: GridRowSelectionModel = { type: 'include', ids: idsSet }

  return (
    <DataGridCard
      title={`Missions (${rows.length})`}
      rows={rows}
      columns={columns}
      getRowId={(row: MissionRow) => row.rowId}
      checkboxSelection
      disableMultipleRowSelection
      onRowSelectionModelChange={handleRowSelectionChange}
      rowSelectionModel={model}
      isRowSelectable={(params: GridRowParams<MissionRow>) => params.row.state === 'Active'}
    />
  )
}

function createMissionColumns(): GridColDef<MissionRow>[] {
  return [
    {
      field: 'id',
      headerName: 'Mission site ID',
      minWidth: 200,
      renderCell: (params: GridRenderCellParams<MissionRow, string>) => (
        <span aria-label={`missions-row-id-${params.id}`}>{params.value}</span>
      ),
    },
    // {
    //   field: 'title',
    //   headerName: 'Title',
    //   minWidth: 260,
    //   renderCell: (params: GridRenderCellParams<MissionRow, string>) => (
    //     <span aria-label={`missions-row-title-${params.id}`}>{params.value}</span>
    //   ),
    // },
    {
      field: 'state',
      headerName: 'State',
      minWidth: 120,
      renderCell: (params: GridRenderCellParams<MissionRow, string>) => (
        <span aria-label={`missions-row-state-${params.id}`}>{params.value}</span>
      ),
    },
    {
      field: 'expiresIn',
      headerName: 'Expires In',
      minWidth: 120,
      renderCell: (params: GridRenderCellParams<MissionRow, number | 'never'>): React.JSX.Element => {
        if (params.row.state === 'Active') {
          return (
            <span aria-label={`missions-row-expires-in-${params.id}`}>
              {params.value === 'never' ? 'Never' : params.value}
            </span>
          )
        }
        return <span aria-label={`missions-row-expires-in-${params.id}`}>-</span>
      },
    },
  ]
}
