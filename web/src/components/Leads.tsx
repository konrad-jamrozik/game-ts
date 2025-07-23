import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import * as React from 'react'
import { LeadCard, type LeadCardProps } from './LeadCard'

export function Leads(): React.JSX.Element {
  const [selectedCard, setSelectedCard] = React.useState<string>()

  const longDescription = Array.from({ length: 10 }).fill('lorem ipsum').join(' ')
  const cards: LeadCardProps[] = [
    {
      title: 'Example quite long title indeed',
      intelCost: 50,
      description: longDescription,
      expiresIn: 3,
    },
    { title: 'bar', intelCost: 9999, description: 'dolor sit', expiresIn: 999 },
    { title: 'baz', intelCost: 120, description: 'consectetur foobar', expiresIn: 2 },
    { title: 'qux', intelCost: 70, description: 'sed do baz qux', expiresIn: 7 },
  ]

  // Group cards into pairs
  const cardPairs: LeadCardProps[][] = []
  for (let index = 0; index < cards.length; index += 2) {
    cardPairs.push(cards.slice(index, index + 2))
  }

  return (
    <Card sx={{ maxWidth: '800px' }}>
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
                    onClick={() => {
                      console.log(`clicked card: ${card.title}`)
                      setSelectedCard(card.title)
                    }}
                    selected={selectedCard === card.title}
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
