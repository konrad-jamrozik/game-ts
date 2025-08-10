import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import Typography from '@mui/material/Typography'
import * as React from 'react'
import { useAppSelector } from '../app/hooks'
import type { GameEvent } from '../model/eventsSlice'
import { assertEqual } from '../utils/assert'

function formatMissionRewards(event: Extract<GameEvent, { type: 'MissionCompleted' }>): string {
  const { rewards } = event
  const parts: string[] = []
  if (rewards.money !== undefined) parts.push(`+$${rewards.money}`)
  if (rewards.intel !== undefined) parts.push(`+${rewards.intel} intel`)
  if (rewards.funding !== undefined) parts.push(`+${rewards.funding} funding`)
  if (rewards.panicReduction !== undefined) parts.push(`-${rewards.panicReduction} panic`)
  return parts.join(', ')
}

function renderPrimaryListItemText(event: GameEvent): string {
  if (event.type === 'Text') {
    return event.message
  }
  assertEqual(event.type, 'MissionCompleted')
  const rewardsSummary = formatMissionRewards(event)
  const details = `id=${event.missionSiteId}, state=${event.finalState}, lost=${event.agentsLost}, wounded=${event.agentsWounded}, unscathed=${event.agentsUnscathed}`
  const base = rewardsSummary
    ? `Mission "${event.missionTitle}" completed: ${rewardsSummary}`
    : `Mission "${event.missionTitle}" completed`
  return `${base} [${details}]`
}

export function EventLog(): React.JSX.Element {
  const events = useAppSelector((state) => state.events.events)

  return (
    <Card
      sx={{
        minWidth: 300,
        maxWidth: 380,
      }}
    >
      <CardHeader title="Event Log" />
      <CardContent>
        {events.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No events yet
          </Typography>
        ) : (
          <List dense>
            {events.map((event: GameEvent) => (
              <ListItem key={event.id} disablePadding>
                <ListItemText
                  primary={renderPrimaryListItemText(event)}
                  secondary={`T ${event.turn} / A ${event.actionsCount}`}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                  slotProps={{
                    primary: {
                      component: 'span',
                    },
                    secondary: {
                      component: 'span',
                      sx: { marginLeft: 2, flexShrink: 0 },
                    },
                  }}
                />
              </ListItem>
            ))}
          </List>
        )}
      </CardContent>
    </Card>
  )
}
