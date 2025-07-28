import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import * as React from 'react'
import { useAppSelector } from '../app/hooks'
import { leads } from '../collections/leads'
import { LeadCard } from './LeadCard'

type CardEntry = { leadId: string; displayMode: 'normal' | 'repeated' }

function getArchivedCardEntries(
  discoveredLeads: typeof leads,
  investigatedLeadIds: string[],
  leadInvestigationCounts: Record<string, number>,
): CardEntry[] {
  const archivedCardEntries: CardEntry[] = []

  // Add disabled normal cards (non-repeatable leads that have been investigated)
  for (const lead of discoveredLeads) {
    const isDisabled = !lead.repeatable && investigatedLeadIds.includes(lead.id)
    if (isDisabled) {
      archivedCardEntries.push({ leadId: lead.id, displayMode: 'normal' })
    }
  }

  // Add repeated cards for repeatable leads that have been investigated
  for (const lead of discoveredLeads) {
    if (lead.repeatable && investigatedLeadIds.includes(lead.id) && (leadInvestigationCounts[lead.id] ?? 0) > 0) {
      archivedCardEntries.push({ leadId: lead.id, displayMode: 'repeated' })
    }
  }

  return archivedCardEntries
}

export function ArchivedLeadCards(): React.JSX.Element {
  const investigatedLeadIds = useAppSelector((state) => state.undoable.present.gameState.investigatedLeadIds)
  const leadInvestigationCounts = useAppSelector((state) => state.undoable.present.gameState.leadInvestigationCounts)
  const missionSites = useAppSelector((state) => state.undoable.present.gameState.missionSites)

  // Get mission IDs that have successful mission sites
  const successfulMissionIds = new Set(
    missionSites.filter((site) => site.state === 'Successful').map((site) => site.missionId),
  )

  // Filter out leads that have unmet dependencies
  const discoveredLeads = leads.filter((lead) =>
    lead.dependsOn.every(
      (dependencyId) => investigatedLeadIds.includes(dependencyId) || successfulMissionIds.has(dependencyId),
    ),
  )

  const archivedCardEntries = getArchivedCardEntries(discoveredLeads, investigatedLeadIds, leadInvestigationCounts)

  // Don't render anything if there are no archived leads
  if (archivedCardEntries.length === 0) {
    return <></>
  }

  // Group card entries into pairs
  const cardEntryPairs: CardEntry[][] = []
  for (let index = 0; index < archivedCardEntries.length; index += 2) {
    cardEntryPairs.push(archivedCardEntries.slice(index, index + 2))
  }

  const maxWidth = '800px'
  return (
    <Card sx={{ maxWidth }}>
      <CardHeader title="Archived Leads" />
      <CardContent>
        <Stack spacing={2}>
          {cardEntryPairs.map((pair) => (
            <Grid
              container
              spacing={2}
              columns={2}
              key={pair.map((entry) => `${entry.leadId}-${entry.displayMode}`).join('-')}
            >
              {pair.map((entry) => (
                <Grid size={1} key={`${entry.leadId}-${entry.displayMode}`}>
                  <LeadCard leadId={entry.leadId} displayMode={entry.displayMode} />
                </Grid>
              ))}
              {/* If there was only ever one archived lead, add an invisible filler grid item 
              to prevent the width of the singular LeadCard from being too small. */}
              {archivedCardEntries.length === 1 && <Grid size={1} minWidth={maxWidth} key={'invisible-filler'}></Grid>}
            </Grid>
          ))}
        </Stack>
      </CardContent>
    </Card>
  )
}
