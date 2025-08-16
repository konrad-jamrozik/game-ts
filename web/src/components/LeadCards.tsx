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

export function LeadCards(): React.JSX.Element {
  const [expanded, setExpanded] = React.useState(true)
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

  // Create card entries: only enabled normal cards for repeatable leads
  type CardEntry = { leadId: string; displayMode: 'normal' | 'repeated' }
  const cardEntries: CardEntry[] = []

  // Add normal cards for all discovered leads that are enabled (not disabled)
  for (const lead of discoveredLeads) {
    const isEnabled = lead.repeatable || (leadInvestigationCounts[lead.id] ?? 0) === 0
    if (isEnabled) {
      cardEntries.push({ leadId: lead.id, displayMode: 'normal' })
    }
  }

  const maxWidth = '800px'
  return (
    <Card sx={{ maxWidth }}>
      <CardHeader
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
          <Stack
            direction="row"
            spacing={0}
            sx={{
              flexWrap: 'wrap',
              '& > *': {
                flex: '0 0 calc(50% - 8px)', // 50% width minus half the spacing
              },
            }}
          >
            {cardEntries.map((entry) => (
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
