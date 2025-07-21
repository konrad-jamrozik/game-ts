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
  const agentSelection = useAppSelector((state) => state.selection.agents)
  const agents = useAppSelector((state) => state.undoable.present.gameState.agents)

  const selectedAgentIds = agentSelection.filter((id) => agents.some((agent) => agent.id === id))

  function handleSackAgents(): void {
    dispatch(sackAgents(selectedAgentIds))
    dispatch(clearAgentSelection())
  }

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
