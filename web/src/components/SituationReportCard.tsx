import { Typography } from '@mui/material'
import Stack from '@mui/material/Stack'
import type { GridColDef, GridRenderCellParams } from '@mui/x-data-grid'
import * as React from 'react'
import { Fragment } from 'react'
import { useAppSelector } from '../redux/hooks'
import { f6add, f6fmtPctDec2, f4fmtPctDec2Diff } from '../lib/primitives/fixed6'
import { SUPPRESSION_DECAY } from '../lib/ruleset/constants'
import { decaySuppression, getPanicIncrease, getPanicNewBalance } from '../lib/ruleset/panicRuleset'
import { assertDefined } from '../lib/primitives/assertPrimitives'
import { fmtPctDec0 } from '../lib/primitives/formatPrimitives'
import { ExpandableCard } from './Common/ExpandableCard'
import { MyChip } from './Common/MyChip'
import { StyledDataGrid } from './Common/StyledDataGrid'

export type SituationReportRow = {
  id: number
  metric: string
  value: string
  projected?: string
  diff?: string
  reverseColor?: boolean
}

export function SituationReportCard(): React.JSX.Element {
  const gameState = useAppSelector((state) => state.undoable.present.gameState)
  const { panic, factions, leadInvestigationCounts } = gameState

  const panicPctStr = f6fmtPctDec2(panic)
  const panicProjected = getPanicNewBalance(gameState)
  const panicProjectedStr = f6fmtPctDec2(panicProjected)
  const panicDiffStr = f4fmtPctDec2Diff(panic, panicProjected)

  const columns: GridColDef[] = [
    { field: 'metric', headerName: 'Metric', minWidth: 120 },
    { field: 'value', headerName: 'Value', minWidth: 80 },
    {
      field: 'projected',
      headerName: 'Projected',
      width: 150,
      renderCell: (params: GridRenderCellParams<SituationReportRow>): React.JSX.Element => {
        const { diff, metric, projected, reverseColor } = params.row

        if (projected === undefined) {
          return <span />
        }

        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span aria-label={`situation-report-row-${metric.toLowerCase().replaceAll(' ', '-')}-projected`}>
              {projected}
            </span>
            {diff !== undefined && <MyChip chipValue={diff} reverseColor={reverseColor ?? false} />}
          </div>
        )
      },
    },
  ]

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

  // Get Red Dawn faction data and check if it's discovered
  const redDawnFaction = factions.find((faction) => faction.id === 'faction-red-dawn')
  assertDefined(redDawnFaction, 'Red Dawn faction should be defined')
  const isRedDawnDiscovered = redDawnFaction.discoveryPrerequisite.every(
    (leadId) => (leadInvestigationCounts[leadId] ?? 0) > 0,
  )
  // Only calculate faction-specific data if Red Dawn is discovered
  const redDawnRows: SituationReportRow[] = isRedDawnDiscovered
    ? (() => {
        const panicIncrease = getPanicIncrease(redDawnFaction.threatLevel, redDawnFaction.suppression)
        const threatLevelProjected = f6add(redDawnFaction.threatLevel, redDawnFaction.threatIncrease)
        const threatLevelDiffStr = f4fmtPctDec2Diff(redDawnFaction.threatLevel, threatLevelProjected)

        const suppressionProjected = decaySuppression(redDawnFaction.suppression).decayedSuppression
        const suppressionDiffStr = f4fmtPctDec2Diff(redDawnFaction.suppression, suppressionProjected)
        const panicIncreaseProjected = getPanicIncrease(threatLevelProjected, suppressionProjected)
        const panicIncreaseDiffStr = f4fmtPctDec2Diff(panicIncrease, panicIncreaseProjected)
        return [
          {
            id: 1,
            metric: 'Threat level',
            value: f6fmtPctDec2(redDawnFaction.threatLevel),
            projected: f6fmtPctDec2(threatLevelProjected),
            diff: threatLevelDiffStr,
            reverseColor: true,
          },
          {
            id: 2,
            metric: 'Threat increase',
            value: f6fmtPctDec2(redDawnFaction.threatIncrease),
            reverseColor: true,
          },
          {
            id: 3,
            metric: 'Suppression',
            value: f6fmtPctDec2(redDawnFaction.suppression),
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
      })()
    : []

  return (
    <ExpandableCard title="Situation Report" defaultExpanded={true}>
      <Stack spacing={2}>
        <StyledDataGrid rows={panicRows} columns={columns} aria-label="Panic data" />
        {isRedDawnDiscovered && (
          <Fragment>
            <Typography variant="h6">{redDawnFaction.name} faction</Typography>
            <StyledDataGrid rows={redDawnRows} columns={columns} aria-label={`${redDawnFaction.name} Report data`} />
          </Fragment>
        )}
      </Stack>
    </ExpandableCard>
  )
}
