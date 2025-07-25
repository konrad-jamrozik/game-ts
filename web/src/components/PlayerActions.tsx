import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Collapse from '@mui/material/Collapse'
import Stack from '@mui/material/Stack'
import * as React from 'react'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import {
  hireAgent,
  sackAgents,
  assignAgentsToContracting,
  assignAgentsToEspionage,
  recallAgents,
  investigateLead,
} from '../model/gameStateSlice'
import { clearAgentSelection, clearLeadSelection } from '../model/selectionSlice'
import { destructiveButtonSx } from '../styling/styleUtils'

export function PlayerActions(): React.JSX.Element {
  const dispatch = useAppDispatch()
  const agentSelection = useAppSelector((state) => state.selection.agents)
  const selectedLead = useAppSelector((state) => state.selection.selectedLead)
  const agents = useAppSelector((state) => state.undoable.present.gameState.agents)
  const gameState = useAppSelector((state) => state.undoable.present.gameState)
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

  function handleAssignToEspionage(): void {
    // Check if all selected agents are in "Available" state
    const selectedAgents = agents.filter((agent) => selectedAgentIds.includes(agent.id))
    const nonAvailableAgents = selectedAgents.filter((agent) => agent.state !== 'Available')

    if (nonAvailableAgents.length > 0) {
      setAlertMessage('This action can be done only on available agents!')
      setShowAlert(true)
      return
    }

    dispatch(assignAgentsToEspionage(selectedAgentIds))
    dispatch(clearAgentSelection())
    setShowAlert(false) // Hide alert on successful action
  }

  function handleRecallAgents(): void {
    // Check if all selected agents are in "OnAssignment" state
    const selectedAgents = agents.filter((agent) => selectedAgentIds.includes(agent.id))
    const nonOnAssignmentAgents = selectedAgents.filter((agent) => agent.state !== 'OnAssignment')

    if (nonOnAssignmentAgents.length > 0) {
      setAlertMessage('This action can be done only on OnAssignment agents!')
      setShowAlert(true)
      return
    }

    dispatch(recallAgents(selectedAgentIds))
    dispatch(clearAgentSelection())
    setShowAlert(false) // Hide alert on successful action
  }

  function handleInvestigateLead(): void {
    if (selectedLead === undefined) {
      setAlertMessage('No lead selected!')
      setShowAlert(true)
      return
    }

    // Check if the lead is already investigated
    if (gameState.investigatedLeads.includes(selectedLead)) {
      setAlertMessage('This lead has already been investigated!')
      setShowAlert(true)
      return
    }

    // Find the selected lead to get its intel cost
    // We need to look up the lead data from Leads component
    // For now, we'll create a mapping of lead IDs to intel costs
    const leadIntelCosts: Record<string, number> = {
      'criminal-orgs': 20,
      'red-dawn-apprehend': 20,
      'red-dawn-interrogate': 0,
      'red-dawn-profile': 50,
      'red-dawn-safehouse': 30,
    }

    const intelCost = leadIntelCosts[selectedLead] ?? 0

    // Check if player has enough intel
    if (gameState.intel < intelCost) {
      setAlertMessage('Not enough intel')
      setShowAlert(true)
      return
    }

    dispatch(investigateLead(selectedLead, intelCost))
    dispatch(clearLeadSelection())
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
          <Button variant="contained" onClick={handleAssignToEspionage} disabled={selectedAgentIds.length === 0}>
            Assign {selectedAgentIds.length} to espionage
          </Button>
          <Button variant="contained" onClick={handleInvestigateLead} disabled={selectedLead === undefined}>
            Investigate lead
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
