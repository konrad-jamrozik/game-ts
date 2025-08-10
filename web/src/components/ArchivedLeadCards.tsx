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

  // Sort by investigation order: first investigated being last (reverse order)
  archivedCardEntries.sort((entryA, entryB) => {
    const indexA = investigatedLeadIds.indexOf(entryA.leadId)
    const indexB = investigatedLeadIds.indexOf(entryB.leadId)
    // Reverse order: later investigations come first
    return indexB - indexA
  })

  return archivedCardEntries
}

export function ArchivedLeadCards(): React.JSX.Element {
  const [expanded, setExpanded] = React.useState(false)
  const investigatedLeadIds = useAppSelector((state) => state.undoable.present.gameState.investigatedLeadIds)
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
      (dependencyId) => investigatedLeadIds.includes(dependencyId) || successfulMissionIds.has(dependencyId),
    ),
  )

  const archivedCardEntries = getArchivedCardEntries(discoveredLeads, investigatedLeadIds, leadInvestigationCounts)

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
            spacing={2}
            sx={{
              flexWrap: 'wrap',
              '& > *': {
                flex: '0 0 calc(50% - 8px)', // 50% width minus half the spacing
              },
            }}
          >
            {archivedCardEntries.map((entry) => (
              <Box key={`${entry.leadId}-${entry.displayMode}`}>
                <LeadCard leadId={entry.leadId} displayMode={entry.displayMode} />
              </Box>
            ))}
          </Stack>
        </CardContent>
      </Collapse>
    </Card>
  )
}
