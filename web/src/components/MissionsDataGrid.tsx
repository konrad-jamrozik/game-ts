import type { GridColDef, GridRenderCellParams } from '@mui/x-data-grid'
import * as React from 'react'
import { useAppSelector } from '../app/hooks'
import { getMissionById } from '../lib/collections/missions'
import type { MissionSite } from '../lib/model/model'
import { getActiveOrDeployedMissionSites, sortActiveOrDeployedMissionSites } from '../lib/utils/MissionSiteUtils'
import { fmtNoPrefix } from '../lib/utils/formatUtils'
import { DataGridCard } from './DataGridCard'

export type MissionRow = MissionSite & {
  rowId: number
  title: string
  displayId: string
}

export function MissionsDataGrid(): React.JSX.Element {
  const missionSites = useAppSelector((state) => state.undoable.present.gameState.missionSites)

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

  return (
    <DataGridCard
      title={`Missions (${rows.length})`}
      rows={rows}
      columns={columns}
      getRowId={(row: MissionRow) => row.rowId}
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
