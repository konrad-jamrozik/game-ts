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

  // Filter out leads that have unmet dependencies
  const discoveredLeads = leads.filter((lead) =>
    lead.dependsOn.every((dependencyId) => investigatedLeadIds.includes(dependencyId)),
  )

  // Sort lead IDs: non-investigated first, then investigated in reverse order (first investigated last)
  const sortedLeadIds = discoveredLeads
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

  const maxWidth = '800px'
  return (
    <Card sx={{ maxWidth }}>
      <CardHeader title="Leads" />
      <CardContent>
        <Stack spacing={2}>
          {leadIdPairs.map((pair) => (
            <Grid container spacing={2} columns={2} key={pair.join('-')}>
              {pair.map((leadId) => (
                <Grid size={1} key={leadId}>
                  <LeadCard leadId={leadId} />
                </Grid>
              ))}
              {/* If there was only ever one discovered lead, add an invisible filler grid item 
              to prevent the width of the singular LeadCard from being too small. */}
              {discoveredLeads.length === 1 && <Grid size={1} minWidth={maxWidth} key={'invisible-filler'}></Grid>}
            </Grid>
          ))}
        </Stack>
      </CardContent>
    </Card>
  )
}
