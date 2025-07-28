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
  const { panic, factions } = gameState

  // Calculate panic as percentage out of 10 with 1 decimal place
  const panicPercentage = `${((panic / 10) * 100).toFixed(1)}%`

  const columns: GridColDef[] = [
    { field: 'metric', headerName: 'Metric', minWidth: 80 },
    { field: 'value', headerName: 'Value', minWidth: 80 },
  ]

  const panicRows = [{ id: 1, metric: 'Panic', value: panicPercentage }]

  // Get Red Dawn faction data
  const redDawnFaction = factions.find((faction) => faction.id === 'faction-red-dawn')
  const redDawnRows = redDawnFaction
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
          {redDawnFaction && (
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
