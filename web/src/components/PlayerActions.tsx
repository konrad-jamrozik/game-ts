import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Collapse from '@mui/material/Collapse'
import Stack from '@mui/material/Stack'
import * as React from 'react'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import { hireAgent, sackAgents, assignAgentsToContracting, recallAgents } from '../model/gameStateSlice'
import { clearAgentSelection } from '../model/selectionSlice'
import { destructiveButtonSx } from '../styling/styleUtils'

export function PlayerActions(): React.JSX.Element {
  const dispatch = useAppDispatch()
  const agentSelection = useAppSelector((state) => state.selection.agents)
  const agents = useAppSelector((state) => state.undoable.present.gameState.agents)
  const [showAlert, setShowAlert] = React.useState(false)
  const [alertMessage, setAlertMessage] = React.useState('')

  const selectedAgentIds = agentSelection.filter((id) => agents.some((agent) => agent.id === id))

  function handleSackAgents(): void {
    // Check if all selected agents are in "Available" state
    const selectedAgents = agents.filter((agent) => selectedAgentIds.includes(agent.id))
    const nonAvailableAgents = selectedAgents.filter((agent) => agent.state !== 'Available')

    if (nonAvailableAgents.length > 0) {
      setAlertMessage('This action can be done only on available agents!')
      setShowAlert(true)
      return
    }

    dispatch(sackAgents(selectedAgentIds))
    dispatch(clearAgentSelection())
    setShowAlert(false) // Hide alert on successful action
  }

  function handleAssignToContracting(): void {
    // Check if all selected agents are in "Available" state
    const selectedAgents = agents.filter((agent) => selectedAgentIds.includes(agent.id))
    const nonAvailableAgents = selectedAgents.filter((agent) => agent.state !== 'Available')

    if (nonAvailableAgents.length > 0) {
      setAlertMessage('This action can be done only on available agents!')
      setShowAlert(true)
      return
    }

    dispatch(assignAgentsToContracting(selectedAgentIds))
    dispatch(clearAgentSelection())
    setShowAlert(false) // Hide alert on successful action
  }

  function handleRecallAgents(): void {
    // Check if all selected agents are in "Away" state
    const selectedAgents = agents.filter((agent) => selectedAgentIds.includes(agent.id))
    const nonAwayAgents = selectedAgents.filter((agent) => agent.state !== 'Away')

    if (nonAwayAgents.length > 0) {
      setAlertMessage('This action can be done only on away agents!')
      setShowAlert(true)
      return
    }

    dispatch(recallAgents(selectedAgentIds))
    dispatch(clearAgentSelection())
    setShowAlert(false) // Hide alert on successful action
  }

  return (
    <Card sx={{ width: 380 }}>
      <CardHeader title="Player Actions" />
      <CardContent>
        <Stack direction="column" spacing={2}>
          <Stack direction="row" spacing={2}>
            <Button
              variant="contained"
              onClick={() => {
                dispatch(hireAgent())
                setShowAlert(false) // Hide alert on successful action
              }}
              fullWidth
            >
              Hire Agent
            </Button>
            <Button
              variant="contained"
              onClick={handleSackAgents}
              disabled={selectedAgentIds.length === 0}
              sx={destructiveButtonSx}
              fullWidth
            >
              Sack {selectedAgentIds.length} Agent
              {selectedAgentIds.length === 0 || selectedAgentIds.length > 1 ? 's' : ''}
            </Button>
          </Stack>
          <Stack direction="row" spacing={2}>
            <Button variant="contained" onClick={handleRecallAgents} disabled={selectedAgentIds.length === 0} fullWidth>
              Recall {selectedAgentIds.length} Agent
              {selectedAgentIds.length === 0 || selectedAgentIds.length > 1 ? 's' : ''}
            </Button>
          </Stack>
          <Button variant="contained" onClick={handleAssignToContracting} disabled={selectedAgentIds.length === 0}>
            Assign {selectedAgentIds.length} to contracting
          </Button>
          <Collapse in={showAlert}>
            <Alert
              severity="error"
              onClose={() => setShowAlert(false)}
              sx={{ textAlign: 'center', alignItems: 'center' }}
            >
              {alertMessage}
            </Alert>
          </Collapse>
        </Stack>
      </CardContent>
    </Card>
  )
}
