import { Typography } from '@mui/material'
import Stack from '@mui/material/Stack'
import * as React from 'react'
import { Fragment } from 'react'
import { useAppSelector } from '../redux/hooks'
import { f6fmtPctDec2, toF } from '../lib/primitives/fixed6'
import { getActivityLevelByOrd, getActivityLevelName } from '../lib/model_utils/factionActivityLevelUtils'
import { getFactionName, isFactionTerminated } from '../lib/model_utils/factionUtils'
import { isFactionDiscovered } from '../lib/ruleset/factionRuleset'
import { assertIsActivityLevelOrd } from '../lib/model/modelOrdUtils'
import { ExpandableCard } from './Common/ExpandableCard'
import { SITUATION_REPORT_EXPANDABLE_CARD_WIDTH } from './Common/widthConstants'
import { StyledDataGrid } from './Common/StyledDataGrid'
import { getSituationReportColumns, type SituationReportRow } from './SituationReport/getSituationReportColumns'
import { getCurrentTurnState } from '../redux/storeUtils'
import type { Agent } from '../lib/model/agentModel'
import {
  isExhaustedAgentForLeadsPanel,
  isReadyAgentForLeadsPanel,
  isRecoveringAgentForLeadsPanel,
} from '../lib/model_utils/agentReadinessUtils'

function getFactionRows(
  faction: {
    activityLevel: number
    turnsAtCurrentLevel: number
    targetTurnsForProgression: number
    turnsUntilNextOperation: number
    suppressionTurns: number
  },
  isTerminated: boolean,
): SituationReportRow[] {
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

  // Format next operation display
  // For terminated factions, show "-"
  const nextOpDisplay = isTerminated
    ? '-'
    : faction.activityLevel === 0
      ? '-'
      : faction.suppressionTurns > 0
        ? `${faction.turnsUntilNextOperation} (supp: ${faction.suppressionTurns})`
        : String(faction.turnsUntilNextOperation)

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
      value: nextOpDisplay,
      reverseColor: true, // Lower is worse for player
    },
    {
      id: 4,
      metric: 'Suppression',
      value: isTerminated ? '-' : faction.suppressionTurns > 0 ? `${faction.suppressionTurns} turns` : '-',
    },
  ]
}

export function SituationReportCard(): React.JSX.Element {
  const gameState = useAppSelector(getCurrentTurnState)
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

  const agentsSummaryColumns = getSituationReportColumns({ metricHeaderName: 'Item', valueHeaderName: 'Count' })
  const agentsSummaryRows = buildAgentsSummaryRows(gameState.agents)

  const discoveredFactions = revealAllFactionProfiles
    ? factions
    : factions.filter((faction) => isFactionDiscovered(faction, leadInvestigationCounts))

  return (
    <ExpandableCard
      id="situation-report"
      title="Situation Report"
      defaultExpanded={true}
      sx={{ width: SITUATION_REPORT_EXPANDABLE_CARD_WIDTH, alignSelf: 'flex-start' }}
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
        <Typography variant="h6">Agents summary</Typography>
        <StyledDataGrid rows={agentsSummaryRows} columns={agentsSummaryColumns} aria-label="Agents summary data" />
        {discoveredFactions.map((faction) => {
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
    </ExpandableCard>
  )
}

function buildAgentsSummaryRows(agents: Agent[]): SituationReportRow[] {
  let ready = 0
  let exhausted = 0
  let recovering = 0
  let allActive = 0
  for (const agent of agents) {
    if (agent.state === 'KIA' || agent.state === 'Sacked') {
      continue
    }
    allActive += 1
    if (isRecoveringAgentForLeadsPanel(agent)) {
      recovering += 1
    }
    if (isReadyAgentForLeadsPanel(agent)) {
      ready += 1
    } else if (isExhaustedAgentForLeadsPanel(agent)) {
      exhausted += 1
    }
  }
  const away = allActive - ready - exhausted - recovering
  return [
    { id: 1, metric: 'Ready agents', value: String(ready) },
    { id: 2, metric: 'Exhausted agents', value: String(exhausted) },
    { id: 3, metric: 'Recovering agents', value: String(recovering) },
    { id: 4, metric: 'Away agents', value: String(away) },
  ]
}
