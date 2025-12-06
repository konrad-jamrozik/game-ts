import type { GridColDef, GridRenderCellParams } from '@mui/x-data-grid'
import * as React from 'react'
import { fmtMissionSiteIdWithMissionId } from '../../lib/model_utils/missionSiteUtils'
import { f6sum, toF } from '../../lib/primitives/fixed6'
import { fmtDec1 } from '../../lib/primitives/formatPrimitives'
import { div } from '../../lib/primitives/mathPrimitives'
import { MyChip } from '../Common/MyChip'
import type { MissionRow } from './MissionsDataGrid'

const EXPECTED_TOTAL_COLUMN_WIDTH = 610

export function getMissionsColumns(): GridColDef<MissionRow>[] {
  const columns: GridColDef<MissionRow>[] = [
    {
      field: 'id',
      headerName: 'Mission site ID',
      width: 240,
      renderCell: (params: GridRenderCellParams<MissionRow, string>): React.JSX.Element => {
        const displayValue = fmtMissionSiteIdWithMissionId(params.row)
        return <span aria-label={`missions-row-id-${params.id}`}>{displayValue}</span>
      },
    },
    {
      field: 'state',
      headerName: 'State',
      width: 120,
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

  const actualTotalWidth = columns.reduce((sum, col) => sum + (col.width ?? 0), 0)
  if (actualTotalWidth !== EXPECTED_TOTAL_COLUMN_WIDTH) {
    throw new Error(
      `Missions columns total width mismatch: expected ${EXPECTED_TOTAL_COLUMN_WIDTH}, got ${actualTotalWidth}`,
    )
  }

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
