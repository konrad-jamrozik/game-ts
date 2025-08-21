import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import Typography from '@mui/material/Typography'
import * as React from 'react'
import { useAppSelector } from '../app/hooks'
import type { GameEvent } from '../lib/slices/eventsSlice'
import { assertEqual } from '../lib/utils/assert'
import { fmtPctDiv100Dec2 } from '../lib/utils/formatUtils'

function formatMissionRewards(event: Extract<GameEvent, { type: 'MissionCompleted' }>): string {
  const { rewards } = event
  const parts: string[] = []
  if (rewards.money !== undefined) parts.push(`+$${rewards.money}`)
  if (rewards.intel !== undefined) parts.push(`+${rewards.intel} intel`)
  if (rewards.funding !== undefined) parts.push(`+${rewards.funding} funding`)
  if (rewards.panicReduction !== undefined) {
    parts.push(`-${fmtPctDiv100Dec2(rewards.panicReduction)}% panic`)
  }
  return parts.join(', ')
}

function renderPrimaryListItemText(event: GameEvent): string {
  if (event.type === 'Text') {
    return event.message
  }
  assertEqual(event.type, 'MissionCompleted')
  const successful = event.finalState === 'Successful'
  const rewardsSummary = successful ? formatMissionRewards(event) : ''
  const base = `Mission ${event.missionSiteId} "${event.missionTitle}"`
  const msg = rewardsSummary ? `${base} successful: ${rewardsSummary}` : `${base} failed.`
  return msg
}

export function EventLog(): React.JSX.Element {
  const events = useAppSelector((state) => state.events.events)
  const currentTurn = useAppSelector((state) => state.undoable.present.gameState.turn)
  const currentActionsCount = useAppSelector((state) => state.undoable.present.gameState.actionsCount)

  // Hide events that are currently undone (beyond the undo pointer)
  // and also hide any legacy undo/redo/reset text events that may exist in persisted state
  const visibleEvents = events.filter((event) => {
    const notUndone =
      event.turn < currentTurn || (event.turn === currentTurn && event.actionsCount <= currentActionsCount)
    return notUndone
  })

  return (
    <Card
      sx={{
        minWidth: 300,
        maxWidth: 380,
      }}
    >
      <CardHeader title="Event Log" />
      <CardContent>
        {visibleEvents.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No events yet
          </Typography>
        ) : (
          <List dense>
            {visibleEvents.map((event: GameEvent) => (
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
