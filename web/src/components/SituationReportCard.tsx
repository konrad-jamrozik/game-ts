import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import type { GridColDef } from '@mui/x-data-grid'
import * as React from 'react'
import { useAppSelector } from '../app/hooks'
import { SUPPRESSION_DECAY_PCT } from '../ruleset/constants'
import { StyledDataGrid } from './StyledDataGrid'

export function SituationReportCard(): React.JSX.Element {
  const gameState = useAppSelector((state) => state.undoable.present.gameState)
  const { panic, factions, investigatedLeadIds } = gameState

  // Calculate panic as percentage from accumulated panic value
  // 100% panic = 10,000, so divide by 100 to get percentage with 2 decimal places
  const panicPercentage = `${(panic / 100).toFixed(2)}%`

  const columns: GridColDef[] = [
    { field: 'metric', headerName: 'Metric', minWidth: 120 },
    { field: 'value', headerName: 'Value', minWidth: 80 },
  ]

  const panicRows = [{ id: 1, metric: 'Panic', value: panicPercentage }]

  // Get Red Dawn faction data and check if it's discovered
  const redDawnFaction = factions.find((faction) => faction.id === 'faction-red-dawn')
  const isRedDawnDiscovered = redDawnFaction
    ? redDawnFaction.discoveryPrerequisite.every((leadId) => investigatedLeadIds.includes(leadId))
    : false

  // 🚧KJA these formulas should be deduped in appropriate view files.
  const redDawnRows =
    redDawnFaction && isRedDawnDiscovered
      ? [
          { id: 1, metric: 'Threat level', value: `${(redDawnFaction.threatLevel / 100).toFixed(2)}%` },
          {
            id: 2,
            metric: 'Threat increase',
            value: `${(redDawnFaction.threatIncrease / 100).toFixed(2)}%`,
          },
          { id: 3, metric: 'Suppression', value: `${(redDawnFaction.suppression / 100).toFixed(2)}%` },
          {
            id: 4,
            metric: 'Suppr. decay',
            value: `${SUPPRESSION_DECAY_PCT.toFixed(0)}%`,
          },
          {
            id: 5,
            metric: 'Panic increase',
            value: `${(Math.max(0, redDawnFaction.threatLevel - redDawnFaction.suppression) / 100).toFixed(2)}%`,
          },
        ]
      : []

  return (
    <Card>
      <CardHeader title="Situation Report" />
      <CardContent>
        <Stack spacing={2}>
          <StyledDataGrid rows={panicRows} columns={columns} aria-label="Panic data" />
          {redDawnFaction && isRedDawnDiscovered && (
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
