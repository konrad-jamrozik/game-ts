import { Typography } from '@mui/material'
import Stack from '@mui/material/Stack'
import * as React from 'react'
import { Fragment } from 'react'
import { useAppSelector } from '../redux/hooks'
import { f6add, f6fmtPctDec2, f4fmtPctDec2Diff } from '../lib/primitives/fixed6'
import { SUPPRESSION_DECAY } from '../lib/ruleset/constants'
import { decaySuppression, getPanicIncrease, getPanicNewBalance } from '../lib/ruleset/panicRuleset'
import { fmtPctDec0 } from '../lib/primitives/formatPrimitives'
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
  threatLevel: ReturnType<typeof f6add>
  threatIncrease: ReturnType<typeof f6add>
  suppression: ReturnType<typeof f6add>
}): SituationReportRow[] {
  const panicIncrease = getPanicIncrease(faction.threatLevel, faction.suppression)
  const threatLevelProjected = f6add(faction.threatLevel, faction.threatIncrease)
  const threatLevelDiffStr = f4fmtPctDec2Diff(faction.threatLevel, threatLevelProjected)

  const suppressionProjected = decaySuppression(faction.suppression).decayedSuppression
  const suppressionDiffStr = f4fmtPctDec2Diff(faction.suppression, suppressionProjected)
  const panicIncreaseProjected = getPanicIncrease(threatLevelProjected, suppressionProjected)
  const panicIncreaseDiffStr = f4fmtPctDec2Diff(panicIncrease, panicIncreaseProjected)
  return [
    {
      id: 1,
      metric: 'Threat level',
      value: f6fmtPctDec2(faction.threatLevel),
      projected: f6fmtPctDec2(threatLevelProjected),
      diff: threatLevelDiffStr,
      reverseColor: true,
    },
    {
      id: 2,
      metric: 'Threat increase',
      value: f6fmtPctDec2(faction.threatIncrease),
      reverseColor: true,
    },
    {
      id: 3,
      metric: 'Suppression',
      value: f6fmtPctDec2(faction.suppression),
      projected: f6fmtPctDec2(suppressionProjected),
      diff: suppressionDiffStr,
    },
    {
      id: 4,
      metric: 'Suppr. decay',
      value: fmtPctDec0(SUPPRESSION_DECAY),
    },
    {
      id: 5,
      metric: 'Panic increase',
      value: f6fmtPctDec2(panicIncrease),
      projected: f6fmtPctDec2(panicIncreaseProjected),
      diff: panicIncreaseDiffStr,
      reverseColor: true,
    },
  ]
}

export function SituationReportCard(): React.JSX.Element {
  const gameState = useAppSelector((state) => state.undoable.present.gameState)
  const { panic, factions, leadInvestigationCounts } = gameState

  const panicPctStr = f6fmtPctDec2(panic)
  const panicProjected = getPanicNewBalance(gameState)
  const panicProjectedStr = f6fmtPctDec2(panicProjected)
  const panicDiffStr = f4fmtPctDec2Diff(panic, panicProjected)

  const columns = getSituationReportColumns()

  const panicRows: SituationReportRow[] = [
    {
      id: 1,
      metric: 'Panic',
      value: panicPctStr,
      projected: panicProjectedStr,
      diff: panicDiffStr,
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
