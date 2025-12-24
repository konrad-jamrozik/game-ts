import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import Typography from '@mui/material/Typography'
import * as React from 'react'
import { useAppSelector } from '../redux/hooks'
import { ExpandableCard } from './Common/ExpandableCard'
import { LEFT_COLUMN_CARD_WIDTH } from './Common/widthConstants'
import type { GameEvent } from '../redux/slices/eventsSlice'
import { assertEqual } from '../lib/primitives/assertPrimitives'
import { f6str } from '../lib/data_table_utils/formatModelUtils'

function formatMissionRewards(event: Extract<GameEvent, { type: 'MissionCompleted' }>): string {
  const { rewards } = event
  const parts: string[] = []
  if (rewards.money !== undefined) parts.push(`+$${rewards.money}`)
  if (rewards.funding !== undefined) parts.push(`+${rewards.funding} funding`)
  if (rewards.panicReduction !== undefined) {
    parts.push(`-${f6str(rewards.panicReduction)}% panic`)
  }
  return parts.join(', ')
}

function renderPrimaryListItemText(event: GameEvent): string {
  if (event.type === 'Text') {
    return event.message
  }
  if (event.type === 'TurnAdvancement') {
    return `Turn ${event.turn} Report Available`
  }
  assertEqual(event.type, 'MissionCompleted')
  const won = event.finalState === 'Won'
  const rewardsSummary = won ? formatMissionRewards(event) : ''
  const base = `Mission ${event.missionId} "${event.missionName}"`
  const msg = rewardsSummary ? `${base} won: ${rewardsSummary}` : `${base} ${event.finalState.toLowerCase()}.`
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
    <ExpandableCard id="event-log" title="Event Log" defaultExpanded={true} sx={{ width: LEFT_COLUMN_CARD_WIDTH }}>
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
                  px: 2,
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
    </ExpandableCard>
  )
}
