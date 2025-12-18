import { Typography } from '@mui/material'
import Stack from '@mui/material/Stack'
import * as React from 'react'
import { Fragment } from 'react'
import { useAppSelector } from '../redux/hooks'
import { f6fmtPctDec2 } from '../lib/primitives/fixed6'
import {
  getActivityLevelName,
  getActivityLevelConfig,
  assertIsActivityLevel,
} from '../lib/ruleset/activityLevelRuleset'
import { ExpandableCard } from './Common/ExpandableCard'
import { RIGHT_COLUMN_CARD_WIDTH } from './Common/widthConstants'
import { StyledDataGrid } from './Common/StyledDataGrid'
import { getSituationReportColumns } from './SituationReport/getSituationReportColumns'

export type SituationReportRow = {
  id: number
  metric: string
  value: string
  projected?: string
  diff?: string
  reverseColor?: boolean
}

function isFactionDiscovered(
  faction: { discoveryPrerequisite: string[] },
  leadInvestigationCounts: Record<string, number>,
): boolean {
  return faction.discoveryPrerequisite.every((leadId) => (leadInvestigationCounts[leadId] ?? 0) > 0)
}

function getFactionRows(faction: {
  activityLevel: number
  turnsAtCurrentLevel: number
  turnsUntilNextOperation: number
  suppressionTurns: number
}): SituationReportRow[] {
  assertIsActivityLevel(faction.activityLevel)
  const config = getActivityLevelConfig(faction.activityLevel)
  const levelName = getActivityLevelName(faction.activityLevel)

  // Format progression display as "current/min" (see about_faction_activity_level.md)
  const progressionDisplay = config.turnsMin === Infinity ? '-' : `${faction.turnsAtCurrentLevel}/${config.turnsMin}`

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

  const panicPctStr = f6fmtPctDec2(panic)

  const columns = getSituationReportColumns()

  const panicRows: SituationReportRow[] = [
    {
      id: 1,
      metric: 'Panic',
      value: panicPctStr,
      reverseColor: true,
    },
  ]

  const discoveredFactions = factions.filter((faction) => isFactionDiscovered(faction, leadInvestigationCounts))

  return (
    <ExpandableCard
      id="situation-report"
      title="Situation Report"
      defaultExpanded={true}
      sx={{ minWidth: RIGHT_COLUMN_CARD_WIDTH }}
    >
      <Stack spacing={2}>
        <StyledDataGrid rows={panicRows} columns={columns} aria-label="Panic data" />
        {discoveredFactions.map((faction) => (
          <Fragment key={faction.id}>
            <Typography variant="h6">{faction.name} faction</Typography>
            <StyledDataGrid
              rows={getFactionRows(faction)}
              columns={columns}
              aria-label={`${faction.name} Report data`}
            />
          </Fragment>
        ))}
      </Stack>
    </ExpandableCard>
  )
}
