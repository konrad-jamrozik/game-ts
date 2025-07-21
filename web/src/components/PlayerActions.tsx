import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Collapse from '@mui/material/Collapse'
import Stack from '@mui/material/Stack'
import * as React from 'react'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import { hireAgent, sackAgents, assignAgentsToContracting } from '../model/gameStateSlice'
import { clearAgentSelection } from '../model/selectionSlice'

export function PlayerActions(): React.JSX.Element {
  const dispatch = useAppDispatch()
  const agentSelection = useAppSelector((state) => state.selection.agents)
  const agents = useAppSelector((state) => state.undoable.present.gameState.agents)
  const [showAlert, setShowAlert] = React.useState(false)

  const selectedAgentIds = agentSelection.filter((id) => agents.some((agent) => agent.id === id))

  function handleSackAgents(): void {
    dispatch(sackAgents(selectedAgentIds))
    dispatch(clearAgentSelection())
  }

  function handleAssignToContracting(): void {
    // Check if all selected agents are in "Available" state
    const selectedAgents = agents.filter((agent) => selectedAgentIds.includes(agent.id))
    const nonAvailableAgents = selectedAgents.filter((agent) => agent.state !== 'Available')

    if (nonAvailableAgents.length > 0) {
      setShowAlert(true)
      return
    }

    dispatch(assignAgentsToContracting(selectedAgentIds))
    dispatch(clearAgentSelection())
  }

  return (
    <Card>
      <CardHeader title="Player Actions" />
      <CardContent>
        <Stack direction="column" spacing={2}>
          <Collapse in={showAlert}>
            <Alert severity="error" onClose={() => setShowAlert(false)}>
              This action can be done only on available agents!
            </Alert>
          </Collapse>
          <Stack direction="row" spacing={2}>
            <Button variant="contained" onClick={() => dispatch(hireAgent())} fullWidth>
              Hire Agent
            </Button>
            <Button variant="contained" onClick={handleSackAgents} disabled={selectedAgentIds.length === 0} fullWidth>
              Sack {selectedAgentIds.length} Agent{selectedAgentIds.length > 1 ? 's' : ''}
            </Button>
          </Stack>
          <Button variant="contained" onClick={handleAssignToContracting} disabled={selectedAgentIds.length === 0}>
            Assign {selectedAgentIds.length} to contracting
          </Button>
        </Stack>
      </CardContent>
    </Card>
  )
}
