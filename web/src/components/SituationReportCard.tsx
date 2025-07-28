import Stack from '@mui/material/Stack'
import type { GridColDef } from '@mui/x-data-grid'
import * as React from 'react'
import { useAppSelector } from '../app/hooks'
import { DataGridCard } from './DataGridCard'

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
    <Stack spacing={2}>
      <DataGridCard title="Situation Report" rows={panicRows} columns={columns} />
      {redDawnFaction && <DataGridCard title={`${redDawnFaction.name} Report`} rows={redDawnRows} columns={columns} />}
    </Stack>
  )
}
