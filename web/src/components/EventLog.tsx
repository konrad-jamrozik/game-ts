import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import Typography from '@mui/material/Typography'
import * as React from 'react'
import { useAppSelector } from '../app/hooks'
import type { GameEvent } from '../model/gameStateSlice'

export function EventLog(): React.JSX.Element {
  const events = useAppSelector((state) => state.present.gameState.events)
  const turn = useAppSelector((state) => state.present.gameState.turn)
  const actionsCount = useAppSelector((state) => state.present.gameState.actionsCount)

  return (
    <Card>
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
                <ListItemText primary={event.message} secondary={`T ${turn} / A ${actionsCount}`} />
              </ListItem>
            ))}
          </List>
        )}
      </CardContent>
    </Card>
  )
}
