import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import type { GridColDef } from '@mui/x-data-grid'
import * as React from 'react'
import { useAppSelector } from '../app/hooks'
import { StyledDataGrid } from './StyledDataGrid'

export function SituationReportCard(): React.JSX.Element {
  const gameState = useAppSelector((state) => state.undoable.present.gameState)
  const { factions, investigatedLeadIds } = gameState

  // Calculate panic as percentage based on sum of all faction threat levels
  // 100% panic = 10,000, so divide by 100 to get percentage
  const totalThreatLevel = factions.reduce((sum, faction) => sum + faction.threatLevel, 0)
  const panicPercentage = `${(totalThreatLevel / 100).toFixed(1)}%`

  const columns: GridColDef[] = [
    { field: 'metric', headerName: 'Metric', minWidth: 80 },
    { field: 'value', headerName: 'Value', minWidth: 80 },
  ]

  const panicRows = [{ id: 1, metric: 'Panic', value: panicPercentage }]

  // Get Red Dawn faction data and check if it's discovered
  const redDawnFaction = factions.find((faction) => faction.id === 'faction-red-dawn')
  const isRedDawnDiscovered = redDawnFaction
    ? redDawnFaction.discoveryPrerequisite.every((leadId) => investigatedLeadIds.includes(leadId))
    : false

  const redDawnRows =
    redDawnFaction && isRedDawnDiscovered
      ? [
          { id: 1, metric: 'Threat lvl', value: redDawnFaction.threatLevel },
          { id: 2, metric: 'Suppr. lvl', value: `${((redDawnFaction.suppressionLevel / 100) * 100).toFixed(1)}%` },
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
