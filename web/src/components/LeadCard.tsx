import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import * as React from 'react'
import { LabeledValue } from './LabeledValue'

export type LeadCardProps = {
  title: string
  intelCost: number
  description: string
  expiresIn: number
}

export function LeadCard({ title, intelCost, description, expiresIn }: LeadCardProps): React.JSX.Element {
  return (
    <Card>
      <CardHeader title={title} />
      <CardContent>
        <Stack>
          <Stack direction="row" justifyContent="space-between">
            <LabeledValue label="Intel cost" value={intelCost} sx={{ width: 140 }} />
            <LabeledValue label="Expires in" value={expiresIn} sx={{ width: 138 }} />
          </Stack>
        </Stack>
        <Typography sx={{ paddingTop: 1.7 }} variant="body1">
          {description}
        </Typography>
      </CardContent>
    </Card>
  )
}
