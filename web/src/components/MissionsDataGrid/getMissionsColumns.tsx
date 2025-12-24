import type { GridColDef, GridRenderCellParams } from '@mui/x-data-grid'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import * as React from 'react'
import type { AppDispatch } from '../../redux/store'
import { fmtForDisplay } from '../../lib/data_table_utils/formatModelUtils'
import type { GameState } from '../../lib/model/gameStateModel'
import { columnWidths } from '../Common/columnWidths'
import { MyChip } from '../Common/MyChip'
import { ColorBar } from '../ColorBar/ColorBar'
import type { MissionRow } from './MissionsDataGrid'
import { setViewMissionDetails } from '../../redux/slices/selectionSlice'
import { isMissionConcluded } from '../../lib/ruleset/missionRuleset'

export function getMissionsColumns(dispatch: AppDispatch, gameState: GameState): GridColDef<MissionRow>[] {
  const columns: GridColDef<MissionRow>[] = [
    {
      field: 'id',
      headerName: 'Mission ID',
      width: columnWidths['missions.id'],
      renderCell: (params: GridRenderCellParams<MissionRow, string>): React.JSX.Element => {
        const displayValue = fmtForDisplay(params.row.id, gameState)
        return <span aria-label={`missions-row-id-${params.id}`}>{displayValue}</span>
      },
    },
    {
      field: 'state',
      headerName: 'State',
      width: columnWidths['missions.state'],
      renderCell: (params: GridRenderCellParams<MissionRow, string>): React.JSX.Element => {
        if (isMissionConcluded(params.row)) {
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
      headerName: 'ExpIn',
      width: columnWidths['missions.expires_in'],
      cellClassName: 'missions-expires-in-cell',
      renderCell: (params: GridRenderCellParams<MissionRow, number | 'never'>): React.JSX.Element => {
        if (params.row.state === 'Active' && params.value !== undefined) {
          return renderExpiresInCell(params.value, params.id)
        }
        return <span aria-label={`missions-row-expires-in-${params.id}`}>-</span>
      },
    },
    // {
    //   field: 'enemies',
    //   headerName: 'Enem',
    //   width: columnWidths['missions.enemies'],
    //   valueGetter: (_value, row: MissionRow) => getEnemyCount(row),
    //   renderCell: (params: GridRenderCellParams<MissionRow>): React.JSX.Element => {
    //     const enemyCount = getEnemyCount(params.row)
    //     return <span aria-label={`missions-row-enemies-${params.id}`}>{enemyCount}</span>
    //   },
    // },
    // {
    //   field: 'avgSkill',
    //   headerName: 'AvgSk',
    //   width: columnWidths['missions.avg_skill'],
    //   valueGetter: (_value, row: MissionRow) => getAverageSkill(row),
    //   renderCell: (params: GridRenderCellParams<MissionRow>): React.JSX.Element => {
    //     const avgSkill = getAverageSkill(params.row)
    //     const displayValue = avgSkill === 0 ? '-' : fmtDec1(avgSkill)
    //     return <span aria-label={`missions-row-avg-skill-${params.id}`}>{displayValue}</span>
    //   },
    // },
    {
      field: 'details',
      headerName: 'Details',
      width: columnWidths['missions.details'],
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

  return columns
}

function renderExpiresInCell(expiresIn: number | 'never', rowId: string | number): React.JSX.Element {
  if (expiresIn === 'never') {
    return <span aria-label={`missions-row-expires-in-${rowId}`}>Never</span>
  }

  // Calculate fill percentage: 100% width = 10+ turns, shorten by 10% for each turn less
  const fillPct = Math.min(100, (expiresIn / 10) * 100)

  // Calculate color percentage: 1.0 = green (10+ turns), 0.0 = red (1 turn or less)
  // Map expiresIn from [1, 10+] to [0, 1] for color gradient
  const colorPct = Math.min(1, Math.max(0, (expiresIn - 1) / 9))

  return (
    <ColorBar fillPct={fillPct} colorPct={colorPct}>
      <span aria-label={`missions-row-expires-in-${rowId}`}>{expiresIn}</span>
    </ColorBar>
  )
}

// function getEnemyCount(row: MissionRow): number {
//   return row.enemies.length
// }

// function getAverageSkill(row: MissionRow): number {
//   const { enemies } = row
//   if (enemies.length === 0) {
//     return 0
//   }
//   const totalSkill = toF(f6sum(...enemies.map((enemy) => enemy.skill)))
//   return div(totalSkill, enemies.length)
// }
