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
import { fmtPct, str } from '../lib/utils/formatUtils'
import { assertDefined } from '../lib/utils/assert'
import { calculatePanicIncrease } from '../lib/model/ruleset/ruleset'

export function SituationReportCard(): React.JSX.Element {
  const gameState = useAppSelector((state) => state.undoable.present.gameState)
  const { panic, factions, leadInvestigationCounts } = gameState

  const panicPercentage = str(panic)

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
        const panicIncrease = calculatePanicIncrease(redDawnFaction.threatLevel, redDawnFaction.suppression)
        return [
          { id: 1, metric: 'Threat level', value: str(redDawnFaction.threatLevel) },
          {
            id: 2,
            metric: 'Threat increase',
            value: str(redDawnFaction.threatIncrease),
          },
          { id: 3, metric: 'Suppression', value: str(redDawnFaction.suppression) },
          {
            id: 4,
            metric: 'Suppr. decay',
            value: fmtPct(SUPPRESSION_DECAY_PCT),
          },
          {
            id: 5,
            metric: 'Panic increase',
            value: str(panicIncrease),
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
