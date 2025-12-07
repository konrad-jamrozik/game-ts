import type { GridColDef, GridRenderCellParams } from '@mui/x-data-grid'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import * as React from 'react'
import type { AppDispatch } from '../../redux/store'
import { fmtMissionSiteIdWithMissionId } from '../../lib/model_utils/missionSiteUtils'
import { f6sum, toF } from '../../lib/primitives/fixed6'
import { fmtDec1 } from '../../lib/primitives/formatPrimitives'
import { div } from '../../lib/primitives/mathPrimitives'
import { assertColumnWidth } from '../Common/assertColumnWidth'
import {
  MISSIONS_AVG_SKILL_WIDTH,
  MISSIONS_DETAILS_WIDTH,
  MISSIONS_ENEMIES_WIDTH,
  MISSIONS_EXPIRES_IN_WIDTH,
  MISSIONS_ID_WIDTH,
  MISSIONS_STATE_WIDTH,
} from '../Common/columnWidths'
import { EXPECTED_MISSIONS_COLUMN_WIDTH } from '../Common/widthConstants'
import { MyChip } from '../Common/MyChip'
import type { MissionRow } from './MissionsDataGrid'
import { setViewMissionDetails } from '../../redux/slices/selectionSlice'

export function getMissionsColumns(dispatch: AppDispatch): GridColDef<MissionRow>[] {
  const columns: GridColDef<MissionRow>[] = [
    {
      field: 'id',
      headerName: 'Mission site ID',
      width: MISSIONS_ID_WIDTH,
      renderCell: (params: GridRenderCellParams<MissionRow, string>): React.JSX.Element => {
        const displayValue = fmtMissionSiteIdWithMissionId(params.row)
        return <span aria-label={`missions-row-id-${params.id}`}>{displayValue}</span>
      },
    },
    {
      field: 'state',
      headerName: 'State',
      width: MISSIONS_STATE_WIDTH,
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
      width: MISSIONS_EXPIRES_IN_WIDTH,
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
      width: MISSIONS_ENEMIES_WIDTH,
      valueGetter: (_value, row: MissionRow) => getEnemyCount(row),
      renderCell: (params: GridRenderCellParams<MissionRow>): React.JSX.Element => {
        const enemyCount = getEnemyCount(params.row)
        return <span aria-label={`missions-row-enemies-${params.id}`}>{enemyCount}</span>
      },
    },
    {
      field: 'avgSkill',
      headerName: 'Avg. skill',
      width: MISSIONS_AVG_SKILL_WIDTH,
      valueGetter: (_value, row: MissionRow) => getAverageSkill(row),
      renderCell: (params: GridRenderCellParams<MissionRow>): React.JSX.Element => {
        const avgSkill = getAverageSkill(params.row)
        const displayValue = avgSkill === 0 ? '-' : fmtDec1(avgSkill)
        return <span aria-label={`missions-row-avg-skill-${params.id}`}>{displayValue}</span>
      },
    },
    {
      field: 'details',
      headerName: 'Details',
      width: MISSIONS_DETAILS_WIDTH,
      sortable: false,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params: GridRenderCellParams<MissionRow>): React.JSX.Element => {
        function handleDetailsClick(): void {
          dispatch(setViewMissionDetails(params.row.id))
        }
        return (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              width: '100%',
            }}
          >
            <Button
              variant="contained"
              size="small"
              onClick={handleDetailsClick}
              aria-label={`missions-row-details-${params.id}`}
              sx={{ paddingY: 0, paddingX: 0.5, textTransform: 'none' }}
            >
              Details
            </Button>
          </Box>
        )
      },
    },
  ]

  assertColumnWidth(columns, EXPECTED_MISSIONS_COLUMN_WIDTH, 'Missions')

  return columns
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
