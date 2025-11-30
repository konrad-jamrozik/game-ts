import Stack from '@mui/material/Stack'
import type { GridColDef, GridRenderCellParams } from '@mui/x-data-grid'
import * as React from 'react'
import { useAppSelector } from '../app/hooks'
import { SUPPRESSION_DECAY } from '../lib/model/ruleset/constants'
import { StyledDataGrid } from './StyledDataGrid'
import { fmtPctDec0 } from '../lib/utils/formatUtils'
import { assertDefined } from '../lib/utils/assert'
import { decaySuppression, getPanicIncrease, getPanicNewBalance } from '../lib/model/ruleset/panicRuleset'
import { MyChip } from './MyChip'
import { toF6, toF, type Fixed6 } from '../lib/model/fixed6'
import { f6str } from '../lib/model/f6fmtUtils'
import { ExpandableCard } from './ExpandableCard'
import { Typography } from '@mui/material'
import { Fragment } from 'react'

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
  const panicDiff = toF6(toF(panicProjected) - toF(panic))

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
        // kja review all toF6(toF usages.
        // kja review all toF() + toF() usages
        const panicIncrease = getPanicIncrease(redDawnFaction.threatLevel, redDawnFaction.suppression)
        const threatLevelProjected = toF6(toF(redDawnFaction.threatLevel) + toF(redDawnFaction.threatIncrease))
        const threatLevelDiff = toF6(toF(redDawnFaction.threatIncrease))
        const suppressionProjected = decaySuppression(redDawnFaction.suppression).decayedSuppression
        const suppressionDiff = toF6(toF(suppressionProjected) - toF(redDawnFaction.suppression))
        const panicIncreaseProjected = getPanicIncrease(threatLevelProjected, suppressionProjected)
        const panicIncreaseDiff = toF6(toF(panicIncreaseProjected) - toF(panicIncrease))
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
