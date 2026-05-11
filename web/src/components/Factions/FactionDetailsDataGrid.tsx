import type { GridColDef, GridRenderCellParams } from '@mui/x-data-grid'
import Typography from '@mui/material/Typography'
import * as React from 'react'
import type { Faction } from '../../lib/model/factionModel'
import { assertIsActivityLevelOrd } from '../../lib/model/modelOrdUtils'
import { getActivityLevelByOrd, getActivityLevelName } from '../../lib/model_utils/factionActivityLevelUtils'
import { getFactionName, isFactionTerminated } from '../../lib/model_utils/factionUtils'
import { ColorBar } from '../ColorBar/ColorBar'
import { columnWidths } from '../Common/columnWidths'
import { StyledDataGrid } from '../Common/StyledDataGrid'
import { getFactionNextOperationDisplay, getVisibleFactions } from './factionScreenUtils'
import { DATA_GRID_CELL_PADDING } from '../styling/spacing'

type FactionDetailsDataGridProps = {
  factions: readonly Faction[]
  leadInvestigationCounts: Record<string, number>
  revealAllFactionProfiles: boolean
}

export function FactionDetailsDataGrid({
  factions,
  leadInvestigationCounts,
  revealAllFactionProfiles,
}: FactionDetailsDataGridProps): React.JSX.Element {
  const visibleFactions = getVisibleFactions(factions, leadInvestigationCounts, revealAllFactionProfiles)

  if (visibleFactions.length === 0) {
    return <Typography>No faction profiles discovered.</Typography>
  }

  return (
    <StyledDataGrid
      rows={getFactionDetailsRows(visibleFactions, leadInvestigationCounts)}
      columns={getFactionDetailsColumns()}
      aria-label="Factions report data"
      sx={{
        '& .faction-level-progress-cell': {
          padding: DATA_GRID_CELL_PADDING,
        },
      }}
    />
  )
}

function getFactionDetailsRows(
  factions: readonly Faction[],
  leadInvestigationCounts: Record<string, number>,
): FactionDetailsRow[] {
  return factions.map((faction) => ({
    id: faction.id,
    name: getFactionName(faction),
    ...getFactionRows(faction, isFactionTerminated(faction, leadInvestigationCounts)),
  }))
}

function getFactionDetailsColumns(): GridColDef<FactionDetailsRow>[] {
  return [
    {
      field: 'name',
      headerName: 'Faction',
      width: columnWidths['factions.name'],
    },
    {
      field: 'activityLevel',
      headerName: 'Activity level',
      width: columnWidths['factions.activity_level'],
      renderCell: getFactionCellRenderer('activityLevel'),
    },
    {
      field: 'levelProgress',
      headerName: 'Level progress',
      width: columnWidths['factions.level_progress'],
      cellClassName: (params): string =>
        params.row.levelProgress.levelProgressPct !== undefined ? 'faction-level-progress-cell' : '',
      renderCell: getFactionCellRenderer('levelProgress'),
    },
    {
      field: 'nextOperation',
      headerName: 'Next operation',
      width: columnWidths['factions.next_operation'],
      renderCell: getFactionCellRenderer('nextOperation'),
    },
    {
      field: 'suppression',
      headerName: 'Suppression',
      width: columnWidths['factions.suppression'],
      renderCell: getFactionCellRenderer('suppression'),
    },
  ]
}

function getFactionCellRenderer(field: FactionDetailsCellField) {
  return (params: GridRenderCellParams<FactionDetailsRow>): React.JSX.Element => {
    const cell = params.row[field]
    if (cell.levelProgressPct !== undefined) {
      const fillPct = Math.max(0, Math.min(100, cell.levelProgressPct))
      const colorPct = fillPct / 100
      return (
        <ColorBar fillPct={fillPct} colorPct={colorPct} linearYellowToRed>
          {cell.value}
        </ColorBar>
      )
    }
    return <span>{cell.value}</span>
  }
}

function getFactionRows(faction: Faction, isTerminated: boolean): FactionRows {
  assertIsActivityLevelOrd(faction.activityLevel)
  const config = getActivityLevelByOrd(faction.activityLevel)
  const levelName = isTerminated ? 'Terminated' : getActivityLevelName(faction.activityLevel)

  // Format progression display as "current/min" (see about_faction_activity_level.md)
  // For terminated factions, show "-"
  const progressionDisplay = isTerminated
    ? '-'
    : config.turnsMin === Infinity
      ? '-'
      : `${faction.turnsAtCurrentLevel}/${config.turnsMin}`
  const levelProgressPct =
    isTerminated || config.turnsMin === Infinity ? undefined : (faction.turnsAtCurrentLevel / config.turnsMin) * 100

  return {
    activityLevel: {
      value: isTerminated ? 'Terminated' : `${faction.activityLevel} - ${levelName}`,
    },
    levelProgress: {
      value: progressionDisplay,
      ...(levelProgressPct !== undefined ? { levelProgressPct } : {}),
    },
    nextOperation: {
      value: getFactionNextOperationDisplay(faction, isTerminated),
    },
    suppression: {
      value: isTerminated ? '-' : faction.suppressionTurns > 0 ? `${faction.suppressionTurns} turns` : '-',
    },
  }
}

type FactionDetailsRow = {
  id: string
  name: string
  activityLevel: FactionDetailsCell
  levelProgress: FactionDetailsCell
  nextOperation: FactionDetailsCell
  suppression: FactionDetailsCell
}

type FactionDetailsCell = {
  value: string
  levelProgressPct?: number
}

type FactionRows = Omit<FactionDetailsRow, 'id' | 'name'>

type FactionDetailsCellField = keyof FactionRows
