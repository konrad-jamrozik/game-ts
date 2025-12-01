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
import { f6sum, toF } from '../lib/primitives/fixed6'
import type { MissionSite } from '../lib/model/model'
import { clearMissionSelection, setMissionSiteSelection } from '../lib/slices/selectionSlice'
import {
  fmtMissionSiteIdWithMissionId,
  getActiveOrDeployedMissionSites,
  getArchivedMissionSites,
  sortActiveOrDeployedMissionSites,
  sortMissionSitesByIdDesc,
} from '../lib/utils/missionSiteUtils'
import { fmtDec1, fmtNoPrefix } from '../lib/primitives/formatPrimitives'
import { div } from '../lib/primitives/mathPrimitives'
import { getCompletedMissionSiteIds } from '../lib/utils/turnReportUtils'
import { DataGridCard } from './DataGridCard'
import { MissionsDataGridToolbar } from './MissionsDataGridToolbar'
import { MyChip } from './MyChip'

export type MissionRow = MissionSite & {
  rowId: number
  title: string
  displayId: string
}

export function MissionsDataGrid(): React.JSX.Element {
  const dispatch = useAppDispatch()
  const gameState = useAppSelector((state) => state.undoable.present.gameState)
  const { missionSites, turnStartReport } = gameState
  const selectedMissionSiteId = useAppSelector((state) => state.selection.selectedMissionSiteId)
  const [showArchived, setShowArchived] = React.useState(false)

  const completedThisTurnIds: Set<string> = getCompletedMissionSiteIds(turnStartReport)

  // Get active and archived mission sites
  const activeMissionSites = getActiveOrDeployedMissionSites(missionSites)
  const archivedMissionSites = getArchivedMissionSites(missionSites)

  // Include completed missions (Successful, Failed, Expired) in active rows if they completed this turn
  const completedThisTurnSites = archivedMissionSites.filter((site) => completedThisTurnIds.has(site.id))
  const activeMissionSitesIncludingCompleted = [...activeMissionSites, ...completedThisTurnSites]

  const sortedActiveMissionSites = sortActiveOrDeployedMissionSites(activeMissionSitesIncludingCompleted)
  const sortedArchivedMissionSites = sortMissionSitesByIdDesc(archivedMissionSites)

  // Transform all mission sites to rows (both active and archived)
  const allActiveRows: MissionRow[] = sortedActiveMissionSites.map((site, index) => {
    const mission = getMissionById(site.missionId)
    const displayId = fmtNoPrefix(site.id, 'mission-site-')

    return {
      ...site,
      rowId: index,
      title: mission.title,
      displayId,
    }
  })

  const allArchivedRows: MissionRow[] = sortedArchivedMissionSites.map((site, index) => {
    const mission = getMissionById(site.missionId)
    const displayId = fmtNoPrefix(site.id, 'mission-site-')

    return {
      ...site,
      rowId: allActiveRows.length + index,
      title: mission.title,
      displayId,
    }
  })

  // Filter rows based on archived checkbox: show ONLY archived when checked, ONLY active when unchecked
  const rows: MissionRow[] = showArchived ? allArchivedRows : allActiveRows

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
      title={`Missions (${rows.length})`}
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
    />
  )
}

function createMissionColumns(): GridColDef<MissionRow>[] {
  return [
    {
      field: 'id',
      headerName: 'Mission site ID',
      minWidth: 240,
      renderCell: (params: GridRenderCellParams<MissionRow, string>): React.JSX.Element => {
        const displayValue = fmtMissionSiteIdWithMissionId(params.row)
        return <span aria-label={`missions-row-id-${params.id}`}>{displayValue}</span>
      },
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
      renderCell: (params: GridRenderCellParams<MissionRow, string>): React.JSX.Element => {
        if (params.value === 'Successful' || params.value === 'Failed' || params.value === 'Expired') {
          return (
            <span aria-label={`missions-row-state-${params.id}`}>
              <MyChip chipValue={params.value} />
            </span>
          )
        }
        return <span aria-label={`missions-row-state-${params.id}`}>{params.value}</span>
      },
    },
    {
      field: 'expiresIn',
      headerName: 'Expires in',
      width: 90,
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
    {
      field: 'enemies',
      headerName: 'Enemies',
      width: 80,
      valueGetter: (_value, row: MissionRow) => getEnemyCount(row),
      renderCell: (params: GridRenderCellParams<MissionRow>): React.JSX.Element => {
        const enemyCount = getEnemyCount(params.row)
        return <span aria-label={`missions-row-enemies-${params.id}`}>{enemyCount}</span>
      },
    },
    {
      field: 'avgSkill',
      headerName: 'Avg. skill',
      width: 80,
      valueGetter: (_value, row: MissionRow) => getAverageSkill(row),
      renderCell: (params: GridRenderCellParams<MissionRow>): React.JSX.Element => {
        const avgSkill = getAverageSkill(params.row)
        const displayValue = avgSkill === 0 ? '-' : fmtDec1(avgSkill)
        return <span aria-label={`missions-row-avg-skill-${params.id}`}>{displayValue}</span>
      },
    },
  ]
}

function getEnemyCount(row: MissionRow): number {
  return row.enemies.length
}

function getAverageSkill(row: MissionRow): number {
  const { enemies } = row
  if (enemies.length === 0) {
    return 0
  }
  const totalSkill = toF(f6sum(...enemies.map((enemy) => enemy.skill)))
  return div(totalSkill, enemies.length)
}
