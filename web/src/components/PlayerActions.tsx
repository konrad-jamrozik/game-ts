import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Stack from '@mui/material/Stack'
import * as React from 'react'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import { hireAgent, sackAgents } from '../model/gameStateSlice'
import { clearAgentSelection } from '../model/selectionSlice'

export function PlayerActions(): React.JSX.Element {
  const dispatch = useAppDispatch()
  const agentsRowSelectionModel = useAppSelector((state) => state.selection.agents)
  const agents = useAppSelector((state) => state.undoable.present.gameState.agents)
  console.log('rendering PlayerActions')

  // Since agentsRowSelectionModel now contains agent IDs, we can use them directly
  const selectedAgentIds = agentsRowSelectionModel.ids.filter(
    (id): id is string => typeof id === 'string' && agents.some((agent) => agent.id === id),
  )

  function handleSackAgents(): void {
    dispatch(sackAgents(selectedAgentIds))
    dispatch(clearAgentSelection())
  }

  console.log('agents:', agents)
  console.log('selectedAgentIds:', selectedAgentIds)

  return (
    <Card>
      <CardHeader title="Player Actions" />
      <CardContent>
        <Stack direction="row" spacing={2}>
          <Button variant="contained" onClick={() => dispatch(hireAgent())}>
            Hire Agent
          </Button>
          <Button variant="contained" onClick={handleSackAgents} disabled={selectedAgentIds.length === 0}>
            Sack {selectedAgentIds.length} Agent{selectedAgentIds.length > 1 ? 's' : ''}
          </Button>
        </Stack>
      </CardContent>
    </Card>
  )
}
