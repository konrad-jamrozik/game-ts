import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import * as React from 'react'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import { setLeadSelection } from '../model/selectionSlice'
import { LeadCard, type LeadCardProps } from './LeadCard'

export function Leads(): React.JSX.Element {
  const dispatch = useAppDispatch()
  const selectedLead = useAppSelector((state) => state.selection.selectedLead)

  // const longDescription = Array.from({ length: 10 }).fill('lorem ipsum').join(' ')
  // 🚧KJA leads shouldn't expire often, and be repeatable. But "Missions" should expire relatively quickly.
  const cards: LeadCardProps[] = [
    {
      id: 'criminal-orgs',
      title: 'Criminal organizations',
      intelCost: 20,
      description: 'Investigate notorious criminal organizations operating from the shadows.',
      expiresIn: 'never',
    },
    {
      id: 'red-dawn-apprehend',
      title: 'Red Dawn member apprehension',
      intelCost: 20,
      description: 'Apprehend a member of the Red Dawn cult.',
      expiresIn: 'never',
    },
    {
      id: 'red-dawn-interrogate',
      title: 'Red Dawn member interrogation',
      intelCost: 0,
      description: 'Interrogate a captured member of the Red Dawn cult.',
      expiresIn: 'never',
    },
    {
      id: 'red-dawn-profile',
      title: 'Red Dawn cult profile',
      intelCost: 50,
      description: 'Establish a basic profile about the Red Dawn cult.',
      expiresIn: 'never',
    },
    {
      id: 'red-dawn-safehouse',
      title: 'Red Dawn safe house location',
      intelCost: 30,
      description: 'Locate Red Dawn safe house.',
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
                    id={card.id}
                    title={card.title}
                    intelCost={card.intelCost}
                    description={card.description}
                    expiresIn={card.expiresIn}
                    onClick={() => {
                      dispatch(setLeadSelection(card.id))
                    }}
                    selected={selectedLead === card.id}
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
