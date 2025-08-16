import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Collapse from '@mui/material/Collapse'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import * as React from 'react'
import { useAppSelector } from '../app/hooks'
import { leads } from '../lib/collections/leads'
import { LeadCard } from './LeadCard'

type CardEntry = { leadId: string; displayMode: 'normal' | 'repeated' }

function getArchivedCardEntries(
  discoveredLeads: typeof leads,
  leadInvestigationCounts: Record<string, number>,
): CardEntry[] {
  const archivedCardEntries: CardEntry[] = []

  // Add disabled normal cards (non-repeatable leads that have been investigated)
  for (const lead of discoveredLeads) {
    const isDisabled = !lead.repeatable && (leadInvestigationCounts[lead.id] ?? 0) > 0
    if (isDisabled) {
      archivedCardEntries.push({ leadId: lead.id, displayMode: 'normal' })
    }
  }

  // Add repeated cards for repeatable leads that have been investigated
  for (const lead of discoveredLeads) {
    if (lead.repeatable && (leadInvestigationCounts[lead.id] ?? 0) > 0) {
      archivedCardEntries.push({ leadId: lead.id, displayMode: 'repeated' })
    }
  }

  // Sort by lead ID for consistent ordering
  archivedCardEntries.sort((entryA, entryB) => entryA.leadId.localeCompare(entryB.leadId))

  return archivedCardEntries
}

export function ArchivedLeadCards(): React.JSX.Element {
  const [expanded, setExpanded] = React.useState(false)
  const leadInvestigationCounts = useAppSelector((state) => state.undoable.present.gameState.leadInvestigationCounts)
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
      (dependencyId) => (leadInvestigationCounts[dependencyId] ?? 0) > 0 || successfulMissionIds.has(dependencyId),
    ),
  )

  const archivedCardEntries = getArchivedCardEntries(discoveredLeads, leadInvestigationCounts)

  const maxWidth = '800px'
  return (
    <Card sx={{ maxWidth }}>
      <CardHeader
        avatar={
          <IconButton onClick={handleExpandClick} aria-expanded={expanded} aria-label="show more">
            {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        }
        title={`Archived Leads (${archivedCardEntries.length})`}
        slotProps={{ title: { variant: 'h5' } }}
      />
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <CardContent>
          <Stack
            direction="row"
            spacing={0}
            sx={{
              flexWrap: 'wrap',
              '& > *': {
                flex: '0 0 calc(50%)',
              },
            }}
          >
            {archivedCardEntries.map((entry) => (
              <Box key={`${entry.leadId}-${entry.displayMode}`} sx={{ padding: 1 }}>
                <LeadCard leadId={entry.leadId} displayMode={entry.displayMode} />
              </Box>
            ))}
          </Stack>
        </CardContent>
      </Collapse>
    </Card>
  )
}
