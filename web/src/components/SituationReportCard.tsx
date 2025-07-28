import type { GridColDef } from '@mui/x-data-grid'
import * as React from 'react'
import { useAppSelector } from '../app/hooks'
import { DataGridCard } from './DataGridCard'

export function SituationReportCard(): React.JSX.Element {
  const panic = useAppSelector((state) => state.undoable.present.gameState.panic)

  // Calculate panic as percentage out of 10 with 1 decimal place
  const panicPercentage = `${((panic / 10) * 100).toFixed(1)}%`

  const columns: GridColDef[] = [
    { field: 'metric', headerName: 'Metric', minWidth: 80 },
    { field: 'value', headerName: 'Value', minWidth: 80 },
  ]

  const rows = [{ id: 1, metric: 'Panic', value: panicPercentage }]

  return <DataGridCard title="Situation Report" rows={rows} columns={columns} />
}
