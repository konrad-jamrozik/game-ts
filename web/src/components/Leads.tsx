import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import * as React from 'react'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import { leadCards } from '../collections/leadCards'
import { setLeadSelection } from '../model/selectionSlice'
import { LeadCard, type LeadCardProps } from './LeadCard'

export function Leads(): React.JSX.Element {
  const dispatch = useAppDispatch()
  const selectedLead = useAppSelector((state) => state.selection.selectedLead)
  const investigatedLeads = useAppSelector((state) => state.undoable.present.gameState.investigatedLeads)

  // Sort cards: non-investigated first, then investigated in reverse order (first investigated last)
  const sortedCards = [...leadCards].sort((cardA, cardB) => {
    const aInvestigated = investigatedLeads.includes(cardA.id)
    const bInvestigated = investigatedLeads.includes(cardB.id)

    // If both are investigated or both are not investigated, maintain original order
    if (aInvestigated === bInvestigated) {
      if (aInvestigated) {
        // Both investigated: reverse investigation order (first investigated comes last)
        const aIndex = investigatedLeads.indexOf(cardA.id)
        const bIndex = investigatedLeads.indexOf(cardB.id)
        return bIndex - aIndex // Reverse order
      }
      return 0 // Both not investigated, maintain original order
    }

    // Not investigated cards come before investigated cards
    return aInvestigated ? 1 : -1
  })

  // Group cards into pairs
  const cardPairs: LeadCardProps[][] = []
  for (let index = 0; index < sortedCards.length; index += 2) {
    cardPairs.push(sortedCards.slice(index, index + 2))
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
                      if (!investigatedLeads.includes(card.id)) {
                        dispatch(setLeadSelection(card.id))
                      }
                    }}
                    selected={selectedLead === card.id}
                    disabled={investigatedLeads.includes(card.id)}
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
