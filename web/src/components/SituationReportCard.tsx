import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import type { GridColDef } from '@mui/x-data-grid'
import * as React from 'react'
import { useAppSelector } from '../app/hooks'
import { SUPPRESSION_DECAY_PCT } from '../lib/model/ruleset/constants'
import { StyledDataGrid } from './StyledDataGrid'
import { fmtPctDiv100Dec2, fmtPct } from '../lib/utils/formatUtils'
import { assertDefined } from '../lib/utils/assert'

export function SituationReportCard(): React.JSX.Element {
  const gameState = useAppSelector((state) => state.undoable.present.gameState)
  const { panic, factions, leadInvestigationCounts } = gameState

  // KJA panic must be documented in a better place. I need a document that explains panic and other faction stuff: about_factions.md
  // Calculate panic as percentage from accumulated panic value
  // 100% panic = 10,000, so divide by 100 to get percentage with 2 decimal places
  const panicPercentage = fmtPctDiv100Dec2(panic)

  const columns: GridColDef[] = [
    { field: 'metric', headerName: 'Metric', minWidth: 120 },
    { field: 'value', headerName: 'Value', minWidth: 80 },
  ]

  const panicRows = [{ id: 1, metric: 'Panic', value: panicPercentage }]

  // Get Red Dawn faction data and check if it's discovered
  const redDawnFaction = factions.find((faction) => faction.id === 'faction-red-dawn')
  assertDefined(redDawnFaction, 'Red Dawn faction should be defined')
  const isRedDawnDiscovered = redDawnFaction.discoveryPrerequisite.every(
    (leadId) => (leadInvestigationCounts[leadId] ?? 0) > 0,
  )
  // Only calculate faction-specific data if Red Dawn is discovered
  const redDawnRows = isRedDawnDiscovered
    ? (() => {
        // KJA .threatLevel - .suppression is duplicated with evaluateTurn.ts updatePanic function.
        const panicIncrease = Math.max(0, redDawnFaction.threatLevel - redDawnFaction.suppression)
        return [
          { id: 1, metric: 'Threat level', value: fmtPctDiv100Dec2(redDawnFaction.threatLevel) },
          {
            id: 2,
            metric: 'Threat increase',
            value: fmtPctDiv100Dec2(redDawnFaction.threatIncrease),
          },
          { id: 3, metric: 'Suppression', value: fmtPctDiv100Dec2(redDawnFaction.suppression) },
          {
            id: 4,
            metric: 'Suppr. decay',
            value: fmtPct(SUPPRESSION_DECAY_PCT),
          },
          {
            id: 5,
            metric: 'Panic increase',
            value: fmtPctDiv100Dec2(panicIncrease),
          },
        ]
      })()
    : []

  return (
    <Card>
      <CardHeader title="Situation Report" />
      <CardContent>
        <Stack spacing={2}>
          <StyledDataGrid rows={panicRows} columns={columns} aria-label="Panic data" />
          {isRedDawnDiscovered && (
            <>
              <Typography variant="h5">{redDawnFaction.name} faction</Typography>
              <StyledDataGrid rows={redDawnRows} columns={columns} aria-label={`${redDawnFaction.name} Report data`} />
            </>
          )}
        </Stack>
      </CardContent>
    </Card>
  )
}
