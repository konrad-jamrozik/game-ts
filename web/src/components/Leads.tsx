import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import * as React from 'react'
import { LeadCard, type LeadCardProps } from './LeadCard'

export function Leads(): React.JSX.Element {
  const [selectedCard, setSelectedCard] = React.useState<string>()

  // const longDescription = Array.from({ length: 10 }).fill('lorem ipsum').join(' ')
  // TODO leads shouldn't expire often, and be repeatable. But "Operations" should expire relatively quickly.
  const cards: LeadCardProps[] = [
    {
      title: 'Criminal organizations',
      intelCost: 50,
      description: 'Investigate notorious criminal organizations operating from the shadows.',
      expiresIn: 'never',
    },
    {
      title: 'Followers of Dagon member apprehension',
      intelCost: 50,
      description: 'Apprehend a member of the Followers of Dagon cult.',
      expiresIn: 3,
    },
    {
      title: 'Followers of Dagon safe house location',
      intelCost: 50,
      description: 'Locate Followers of Dagon safe house.',
      expiresIn: 'never',
    },
    {
      title: 'Followers of Dagon cult profile',
      intelCost: 100,
      description: 'Establish a basic profile about the Followers of Dagon cult.',
      expiresIn: 'never',
    },
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
