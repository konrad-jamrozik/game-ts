import Stack from '@mui/material/Stack'
import type { GridColDef, GridRenderCellParams } from '@mui/x-data-grid'
import * as React from 'react'
import { useAppSelector } from '../app/hooks'
import { SUPPRESSION_DECAY } from '../lib/model/ruleset/constants'
import { StyledDataGrid } from './StyledDataGrid'
import { fmtPctDec0, str } from '../lib/utils/formatUtils'
import { assertDefined } from '../lib/utils/assert'
import { calculatePanicIncrease, getPanicNewBalance, decaySuppression } from '../lib/model/ruleset/ruleset'
import { MyChip } from './MyChip'
import { bps, type Bps } from '../lib/model/bps'
import { ExpandableCard } from './ExpandableCard'
import { Typography } from '@mui/material'
import { Fragment } from 'react'

export type SituationReportRow = {
  id: number
  metric: string
  value: string
  projected?: string
  diff?: number | Bps
  reverseColor?: boolean
}

export function SituationReportCard(): React.JSX.Element {
  const gameState = useAppSelector((state) => state.undoable.present.gameState)
  const { panic, factions, leadInvestigationCounts } = gameState

  const panicPercentage = str(panic)
  const panicProjected = getPanicNewBalance(gameState)
  const panicProjectedStr = str(panicProjected)
  const panicDiff = bps(panicProjected.value - panic.value)

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
        const panicIncrease = calculatePanicIncrease(redDawnFaction.threatLevel, redDawnFaction.suppression)
        const threatLevelProjected = bps(redDawnFaction.threatLevel.value + redDawnFaction.threatIncrease.value)
        const threatLevelDiff = bps(redDawnFaction.threatIncrease.value)
        const suppressionProjected = decaySuppression(redDawnFaction.suppression)
        const suppressionDiff = bps(suppressionProjected.value - redDawnFaction.suppression.value)
        const panicIncreaseProjected = calculatePanicIncrease(threatLevelProjected, suppressionProjected)
        const panicIncreaseDiff = bps(panicIncreaseProjected.value - panicIncrease.value)
        return [
          {
            id: 1,
            metric: 'Threat level',
            value: str(redDawnFaction.threatLevel),
            projected: str(threatLevelProjected),
            diff: threatLevelDiff,
            reverseColor: true,
          },
          {
            id: 2,
            metric: 'Threat increase',
            value: str(redDawnFaction.threatIncrease),
            reverseColor: true,
          },
          {
            id: 3,
            metric: 'Suppression',
            value: str(redDawnFaction.suppression),
            projected: str(suppressionProjected),
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
            value: str(panicIncrease),
            projected: str(panicIncreaseProjected),
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
