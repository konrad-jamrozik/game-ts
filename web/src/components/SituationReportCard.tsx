import { Typography } from '@mui/material'
import Stack from '@mui/material/Stack'
import * as React from 'react'
import { Fragment } from 'react'
import { useAppSelector } from '../redux/hooks'
import { f6fmtPctDec2, toF } from '../lib/primitives/fixed6'
import { getActivityLevelByOrd, getActivityLevelName } from '../lib/model_utils/factionActivityLevelUtils'
import { getFactionName } from '../lib/model_utils/factionUtils'
import { isFactionDiscovered } from '../lib/ruleset/factionRuleset'
import { assertIsActivityLevelOrd } from '../lib/model/modelOrdUtils'
import { ExpandableCard } from './Common/ExpandableCard'
import { RIGHT_COLUMN_CARD_WIDTH } from './Common/widthConstants'
import { StyledDataGrid } from './Common/StyledDataGrid'
import { getSituationReportColumns, type SituationReportRow } from './SituationReport/getSituationReportColumns'

function getFactionRows(faction: {
  activityLevel: number
  turnsAtCurrentLevel: number
  targetTurnsForProgression: number
  turnsUntilNextOperation: number
  suppressionTurns: number
}): SituationReportRow[] {
  assertIsActivityLevelOrd(faction.activityLevel)
  const config = getActivityLevelByOrd(faction.activityLevel)
  const levelName = getActivityLevelName(faction.activityLevel)

  // Format progression display as "current/min" (see about_faction_activity_level.md)
  const progressionDisplay = config.turnsMin === Infinity ? '-' : `${faction.turnsAtCurrentLevel}/${config.turnsMin}`
  const levelProgressPct =
    config.turnsMin === Infinity ? undefined : (faction.turnsAtCurrentLevel / config.turnsMin) * 100

  // Format next operation display
  const nextOpDisplay =
    faction.activityLevel === 0
      ? '-'
      : faction.suppressionTurns > 0
        ? `${faction.turnsUntilNextOperation} (supp: ${faction.suppressionTurns})`
        : String(faction.turnsUntilNextOperation)

  return [
    {
      id: 1,
      metric: 'Activity level',
      value: `${faction.activityLevel} - ${levelName}`,
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
      value: nextOpDisplay,
      reverseColor: true, // Lower is worse for player
    },
    {
      id: 4,
      metric: 'Suppression',
      value: faction.suppressionTurns > 0 ? `${faction.suppressionTurns} turns` : '-',
    },
  ]
}

export function SituationReportCard(): React.JSX.Element {
  const gameState = useAppSelector((state) => state.undoable.present.gameState)
  const { panic, factions, leadInvestigationCounts } = gameState
  const revealAllFactionProfiles = useAppSelector((state) => state.settings.revealAllFactionProfiles)

  const panicPctStr = f6fmtPctDec2(panic)
  const panicPct = toF(panic) * 100

  const columns = getSituationReportColumns()

  const panicRows: SituationReportRow[] = [
    {
      id: 1,
      metric: 'Panic',
      value: panicPctStr,
      reverseColor: true,
      panicPct,
    },
  ]

  const discoveredFactions = revealAllFactionProfiles
    ? factions
    : factions.filter((faction) => isFactionDiscovered(faction, leadInvestigationCounts))

  return (
    <ExpandableCard
      id="situation-report"
      title="Situation Report"
      defaultExpanded={true}
      sx={{ minWidth: RIGHT_COLUMN_CARD_WIDTH }}
    >
      <Stack spacing={2}>
        <StyledDataGrid
          rows={panicRows}
          columns={columns}
          aria-label="Panic data"
          sx={{
            '& .situation-report-color-bar-cell': {
              padding: '4px',
            },
          }}
        />
        {discoveredFactions.map((faction) => (
          <Fragment key={faction.id}>
            <Typography variant="h6">{getFactionName(faction)} faction</Typography>
            <StyledDataGrid
              rows={getFactionRows(faction)}
              columns={columns}
              aria-label={`${getFactionName(faction)} Report data`}
              sx={{
                '& .situation-report-color-bar-cell': {
                  padding: '4px',
                },
              }}
            />
          </Fragment>
        ))}
      </Stack>
    </ExpandableCard>
  )
}
