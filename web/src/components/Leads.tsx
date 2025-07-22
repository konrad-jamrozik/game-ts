import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import * as React from 'react'

type LeadCardProps = {
  title: string
  intelCost: number
  description: string
  expiresIn: number
}

function LeadCard({ title, intelCost, description, expiresIn }: LeadCardProps): React.JSX.Element {
  return (
    <Card sx={{ width: '100%' }}>
      <CardContent>
        <Typography variant="h4" component="div" gutterBottom>
          {title}
        </Typography>
        <Stack direction="row" justifyContent="space-between">
          <Typography variant="h6" color="text.secondary">
            {intelCost} intel
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Expires in {expiresIn}
          </Typography>
        </Stack>
        <Typography variant="subtitle1">{description}</Typography>
      </CardContent>
    </Card>
  )
}

export function Leads(): React.JSX.Element {
  const cards: LeadCardProps[] = [
    { title: 'foo', intelCost: 50, description: 'lorem ipsum', expiresIn: 3 },
    { title: 'bar', intelCost: 80, description: 'dolor sit', expiresIn: 5 },
    { title: 'baz', intelCost: 120, description: 'consectetur foobar', expiresIn: 2 },
    // { title: 'qux', intelCost: 70, description: 'sed do baz qux', expiresIn: 7 },
  ]

  return (
    <Card>
      <CardHeader title="Leads" />
      <CardContent>
        <Grid container spacing={2} sx={{ overflowX: 'auto', width: '100%' }}>
          {cards.map((card) => (
            <Grid size={6} key={card.title} sx={{ minWidth: 0 }}>
              <LeadCard
                title={card.title}
                intelCost={card.intelCost}
                description={card.description}
                expiresIn={card.expiresIn}
              />
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  )
}
