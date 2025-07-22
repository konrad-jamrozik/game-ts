import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import * as React from 'react'

type LeadCardProps = {
  title: string
  intelCost: number
  description: string
}

function LeadCard({ title, intelCost, description }: LeadCardProps): React.JSX.Element {
  return (
    <Card sx={{ width: '100%' }}>
      <CardContent>
        <Typography variant="h6" component="div" gutterBottom>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {intelCost} intel
        </Typography>
        <Typography variant="body2">
          {description}
        </Typography>
      </CardContent>
    </Card>
  )
}

export function Leads(): React.JSX.Element {
  return (
    <Card>
      <CardHeader title="Leads" />
      <CardContent>
        <Stack spacing={2}>
          <LeadCard title="foo" intelCost={50} description="lorem ipsum" />
          <LeadCard title="bar" intelCost={80} description="solor denet" />
          <LeadCard title="qux" intelCost={120} description="dolor sit" />
        </Stack>
      </CardContent>
    </Card>
  )
}
