import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import * as React from 'react'
import { useAppSelector } from '../app/hooks'
import { leads } from '../collections/leads'
import { LeadCard } from './LeadCard'

export function LeadCards(): React.JSX.Element {
  const investigatedLeadIds = useAppSelector((state) => state.undoable.present.gameState.investigatedLeadIds)

  // Sort lead IDs: non-investigated first, then investigated in reverse order (first investigated last)
  const sortedLeadIds = leads
    .map((lead) => lead.id)
    .sort((idA, idB) => {
      const aInvestigated = investigatedLeadIds.includes(idA)
      const bInvestigated = investigatedLeadIds.includes(idB)

      if (aInvestigated === bInvestigated) {
        if (aInvestigated) {
          const aIndex = investigatedLeadIds.indexOf(idA)
          const bIndex = investigatedLeadIds.indexOf(idB)
          return bIndex - aIndex
        }
        return 0
      }
      return aInvestigated ? 1 : -1
    })

  // Group lead IDs into pairs
  const leadIdPairs: string[][] = []
  for (let index = 0; index < sortedLeadIds.length; index += 2) {
    leadIdPairs.push(sortedLeadIds.slice(index, index + 2))
  }

  return (
    <Card sx={{ maxWidth: '800px' }}>
      <CardHeader title="Leads" />
      <CardContent>
        <Stack spacing={2}>
          {leadIdPairs.map((pair) => (
            <Grid container spacing={2} key={pair.join('-')}>
              {pair.map((leadId) => (
                <Grid size={6} key={leadId}>
                  <LeadCard leadId={leadId} />
                </Grid>
              ))}
            </Grid>
          ))}
        </Stack>
      </CardContent>
    </Card>
  )
}
