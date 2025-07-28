import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import * as React from 'react'
import { useAppSelector } from '../app/hooks'
import { LabeledValue } from './LabeledValue'

export function SituationReportCard(): React.JSX.Element {
  const panic = useAppSelector((state) => state.undoable.present.gameState.panic)

  // Calculate panic as percentage out of 10 with 1 decimal place
  const panicPercentage = `${((panic / 10) * 100).toFixed(1)}%`

  return (
    <Card sx={{ width: 220 }}>
      <CardHeader title="Situation Report" />
      <CardContent>
        <LabeledValue label="Panic" value={panicPercentage} sx={{ width: 120 }} />
      </CardContent>
    </Card>
  )
}
