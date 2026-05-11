import { Typography } from '@mui/material'
import Stack from '@mui/material/Stack'
import * as React from 'react'
import { Fragment } from 'react'
import type { Faction } from '../../lib/model/factionModel'
import { assertIsActivityLevelOrd } from '../../lib/model/modelOrdUtils'
import { getActivityLevelByOrd, getActivityLevelName } from '../../lib/model_utils/factionActivityLevelUtils'
import { getFactionName, isFactionTerminated } from '../../lib/model_utils/factionUtils'
import { StyledDataGrid } from '../Common/StyledDataGrid'
import { getSituationReportColumns, type SituationReportRow } from '../SituationReport/getSituationReportColumns'
import { getFactionNextOperationDisplay, getVisibleFactions } from './factionScreenUtils'

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
  const columns = getSituationReportColumns()
  const visibleFactions = getVisibleFactions(factions, leadInvestigationCounts, revealAllFactionProfiles)

  if (visibleFactions.length === 0) {
    return <Typography>No faction profiles discovered.</Typography>
  }

  return (
    <Stack spacing={2}>
      {visibleFactions.map((faction) => {
        const terminated = isFactionTerminated(faction, leadInvestigationCounts)
        return (
          <Fragment key={faction.id}>
            <Typography variant="h6">{getFactionName(faction)} faction</Typography>
            <StyledDataGrid
              rows={getFactionRows(faction, terminated)}
              columns={columns}
              aria-label={`${getFactionName(faction)} Report data`}
              sx={{
                '& .situation-report-color-bar-cell': {
                  padding: '4px',
                },
              }}
            />
          </Fragment>
        )
      })}
    </Stack>
  )
}

function getFactionRows(faction: Faction, isTerminated: boolean): SituationReportRow[] {
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

  return [
    {
      id: 1,
      metric: 'Activity level',
      value: isTerminated ? 'Terminated' : `${faction.activityLevel} - ${levelName}`,
    },
    {
      id: 2,
      metric: 'Level progress',
      value: progressionDisplay,
      reverseColor: true, // Progress towards higher activity is bad
      ...(levelProgressPct !== undefined ? { levelProgressPct } : {}),
    },
    {
      id: 3,
      metric: 'Next operation',
      value: getFactionNextOperationDisplay(faction, isTerminated),
      reverseColor: true, // Lower is worse for player
    },
    {
      id: 4,
      metric: 'Suppression',
      value: isTerminated ? '-' : faction.suppressionTurns > 0 ? `${faction.suppressionTurns} turns` : '-',
    },
  ]
}
