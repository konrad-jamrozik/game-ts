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

  // Create card entries: normal cards + repeated cards for repeatable leads that have been investigated
  type CardEntry = { leadId: string; displayMode: 'normal' | 'repeated' }
  const cardEntries: CardEntry[] = []

  // Add normal cards for all discovered leads
  for (const lead of discoveredLeads) {
    cardEntries.push({ leadId: lead.id, displayMode: 'normal' })
  }

  // Add repeated cards for repeatable leads that have been investigated
  for (const lead of discoveredLeads) {
    if (lead.repeatable && investigatedLeadIds.includes(lead.id) && (leadInvestigationCounts[lead.id] ?? 0) > 0) {
      cardEntries.push({ leadId: lead.id, displayMode: 'repeated' })
    }
  }

  // Sort cards: enabled cards first (normal cards and repeatable leads), then disabled cards (repeated cards)
  const sortedCardEntries = cardEntries.sort((entryA, entryB) => {
    const aLead = leads.find((lead) => lead.id === entryA.leadId)
    const bLead = leads.find((lead) => lead.id === entryB.leadId)

    if (!aLead || !bLead) {
      return 0
    }

    const aEnabled =
      entryA.displayMode === 'normal' && (aLead.repeatable || !investigatedLeadIds.includes(entryA.leadId))
    const bEnabled =
      entryB.displayMode === 'normal' && (bLead.repeatable || !investigatedLeadIds.includes(entryB.leadId))

    // Enabled cards come first
    if (aEnabled && !bEnabled) {
      return -1
    }
    if (!aEnabled && bEnabled) {
      return 1
    }

    // Within the same enabled/disabled group, maintain existing order
    return 0
  })

  // Group card entries into pairs
  const cardEntryPairs: CardEntry[][] = []
  for (let index = 0; index < sortedCardEntries.length; index += 2) {
    cardEntryPairs.push(sortedCardEntries.slice(index, index + 2))
  }

  const maxWidth = '800px'
  return (
    <Card sx={{ maxWidth }}>
      <CardHeader title="Leads" />
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
              {/* If there was only ever one discovered lead, add an invisible filler grid item 
              to prevent the width of the singular LeadCard from being too small. */}
              {cardEntries.length === 1 && <Grid size={1} minWidth={maxWidth} key={'invisible-filler'}></Grid>}
            </Grid>
          ))}
        </Stack>
      </CardContent>
    </Card>
  )
}
