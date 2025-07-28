import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Collapse from '@mui/material/Collapse'
import Grid from '@mui/material/Grid'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import * as React from 'react'
import { useAppSelector } from '../app/hooks'
import { leads } from '../collections/leads'
import { LeadCard } from './LeadCard'

export function LeadCards(): React.JSX.Element {
  const [expanded, setExpanded] = React.useState(true)
  const investigatedLeadIds = useAppSelector((state) => state.undoable.present.gameState.investigatedLeadIds)
  const missionSites = useAppSelector((state) => state.undoable.present.gameState.missionSites)

  function handleExpandClick(): void {
    setExpanded(!expanded)
  }

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

  // Create card entries: only enabled normal cards for repeatable leads
  type CardEntry = { leadId: string; displayMode: 'normal' | 'repeated' }
  const cardEntries: CardEntry[] = []

  // Add normal cards for all discovered leads that are enabled (not disabled)
  for (const lead of discoveredLeads) {
    const isEnabled = lead.repeatable || !investigatedLeadIds.includes(lead.id)
    if (isEnabled) {
      cardEntries.push({ leadId: lead.id, displayMode: 'normal' })
    }
  }

  // Group card entries into pairs
  const cardEntryPairs: CardEntry[][] = []
  for (let index = 0; index < cardEntries.length; index += 2) {
    cardEntryPairs.push(cardEntries.slice(index, index + 2))
  }

  const maxWidth = '800px'
  return (
    <Card sx={{ maxWidth }}>
      <CardHeader
        sx={{ minWidth: cardEntryPairs.length === 0 || !expanded ? maxWidth : undefined }}
        avatar={
          <IconButton onClick={handleExpandClick} aria-expanded={expanded} aria-label="show more">
            {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        }
        title={`Leads (${cardEntries.length})`}
        slotProps={{ title: { variant: 'h5' } }}
      />
      <Collapse in={expanded} timeout="auto" unmountOnExit>
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
      </Collapse>
    </Card>
  )
}
