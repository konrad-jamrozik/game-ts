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
    <Card sx={{ width: 'min-content' }}>
      <CardContent>
        <Stack minWidth={'300px'}>
          {/* minWidth={'max-content'} */}
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
        </Stack>
        <Typography variant="subtitle1">{description}</Typography>
      </CardContent>
    </Card>
  )
}

export function Leads(): React.JSX.Element {
  const cards: LeadCardProps[] = [
    {
      title: 'Example quite long title indeed',
      intelCost: 50,
      description: 'lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum',
      expiresIn: 3,
    },
    { title: 'bar', intelCost: 80, description: 'dolor sit', expiresIn: 5 },
    { title: 'baz', intelCost: 120, description: 'consectetur foobar', expiresIn: 2 },
    { title: 'qux', intelCost: 70, description: 'sed do baz qux', expiresIn: 7 },
  ]

  // Group cards into pairs
  const cardPairs: LeadCardProps[][] = []
  for (let index = 0; index < cards.length; index += 2) {
    cardPairs.push(cards.slice(index, index + 2))
  }

  return (
    <Card>
      <CardHeader title="Leads" />
      <CardContent>
        <Stack spacing={2}>
          {cardPairs.map((pair) => (
            <Grid container spacing={2} key={pair.map((card) => card.title).join('-')}>
              {pair.map((card) => (
                <Grid size={6} key={card.title}>
                  <LeadCard
                    title={card.title}
                    intelCost={card.intelCost}
                    description={card.description}
                    expiresIn={card.expiresIn}
                  />
                </Grid>
              ))}
            </Grid>
          ))}
        </Stack>
      </CardContent>
    </Card>
  )
}
