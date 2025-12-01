import { Typography } from '@mui/material'
import Stack from '@mui/material/Stack'
import type { GridColDef, GridRenderCellParams } from '@mui/x-data-grid'
import * as React from 'react'
import { Fragment } from 'react'
import { useAppSelector } from '../app/hooks'
import { f6str } from '../lib/model_utils/formatDomainUtils'
import { f6add } from '../lib/utils/fixed6Utils'
import { f6sub, type Fixed6 } from '../lib/primitives/fixed6Primitives'
import { SUPPRESSION_DECAY } from '../lib/ruleset/constants'
import { decaySuppression, getPanicIncrease, getPanicNewBalance } from '../lib/ruleset/panicRuleset'
import { assertDefined } from '../lib/primitives/assertPrimitives'
import { fmtPctDec0 } from '../lib/primitives/formatPrimitives'
import { ExpandableCard } from './ExpandableCard'
import { MyChip } from './MyChip'
import { StyledDataGrid } from './StyledDataGrid'

export type SituationReportRow = {
  id: number
  metric: string
  value: string
  projected?: string
  diff?: number | Fixed6
  reverseColor?: boolean
}

export function SituationReportCard(): React.JSX.Element {
  const gameState = useAppSelector((state) => state.undoable.present.gameState)
  const { panic, factions, leadInvestigationCounts } = gameState

  const panicPercentage = f6str(panic)
  const panicProjected = getPanicNewBalance(gameState)
  const panicProjectedStr = f6str(panicProjected)
  const panicDiff = f6sub(panicProjected, panic)

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
      value: panicPercentage,
      projected: panicProjectedStr,
      diff: panicDiff,
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
        const threatLevelDiff = redDawnFaction.threatIncrease
        const suppressionProjected = decaySuppression(redDawnFaction.suppression).decayedSuppression
        const suppressionDiff = f6sub(suppressionProjected, redDawnFaction.suppression)
        const panicIncreaseProjected = getPanicIncrease(threatLevelProjected, suppressionProjected)
        const panicIncreaseDiff = f6sub(panicIncreaseProjected, panicIncrease)
        return [
          {
            id: 1,
            metric: 'Threat level',
            value: f6str(redDawnFaction.threatLevel),
            projected: f6str(threatLevelProjected),
            diff: threatLevelDiff,
            reverseColor: true,
          },
          {
            id: 2,
            metric: 'Threat increase',
            value: f6str(redDawnFaction.threatIncrease),
            reverseColor: true,
          },
          {
            id: 3,
            metric: 'Suppression',
            value: f6str(redDawnFaction.suppression),
            projected: f6str(suppressionProjected),
            diff: suppressionDiff,
          },
          {
            id: 4,
            metric: 'Suppr. decay',
            value: fmtPctDec0(SUPPRESSION_DECAY),
          },
          {
            id: 5,
            metric: 'Panic increase',
            value: f6str(panicIncrease),
            projected: f6str(panicIncreaseProjected),
            diff: panicIncreaseDiff,
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
