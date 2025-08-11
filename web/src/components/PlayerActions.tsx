import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Collapse from '@mui/material/Collapse'
import Stack from '@mui/material/Stack'
import * as React from 'react'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import { getLeadById } from '../collections/leads'
import { validateMissionSiteDeployment } from '../model/MissionSiteService'
import {
  assignAgentsToContracting,
  assignAgentsToEspionage,
  deployAgentsToMission,
  hireAgent,
  investigateLead,
  recallAgents,
  sackAgents,
} from '../model/gameStateSlice'
import { clearAgentSelection, clearLeadSelection, clearMissionSelection } from '../model/selectionSlice'
import { agsV } from '../model/views/AgentsView'
import { destructiveButtonSx } from '../styling/styleUtils'
import { formatAgentCount, formatMissionTarget } from '../utils/formatUtils'

export function PlayerActions(): React.JSX.Element {
  const dispatch = useAppDispatch()
  const agentSelection = useAppSelector((state) => state.selection.agents)
  const selectedLeadId = useAppSelector((state) => state.selection.selectedLeadId)
  const selectedMissionSiteId = useAppSelector((state) => state.selection.selectedMissionSiteId)
  const agents = useAppSelector((state) => state.undoable.present.gameState.agents)
  const agentsView = agsV(agents)
  const gameState = useAppSelector((state) => state.undoable.present.gameState)
  const [showAlert, setShowAlert] = React.useState(false)
  const [alertMessage, setAlertMessage] = React.useState('')

  const selectedAgentIds = agentSelection.filter((id) => agents.some((agent) => agent.id === id))

  function handleSackAgents(): void {
    // Validate that all selected agents are available
    const validationResult = agentsView.validateAvailable(selectedAgentIds)

    if (!validationResult.isValid) {
      setAlertMessage(validationResult.errorMessage ?? 'Unknown error')
      setShowAlert(true)
      return
    }

    dispatch(sackAgents(selectedAgentIds))
    dispatch(clearAgentSelection())
    setShowAlert(false) // Hide alert on successful action
  }

  function handleAssignToContracting(): void {
    // Validate that all selected agents are available
    const validationResult = agentsView.validateAvailable(selectedAgentIds)

    if (!validationResult.isValid) {
      setAlertMessage(validationResult.errorMessage ?? 'Unknown error')
      setShowAlert(true)
      return
    }

    dispatch(assignAgentsToContracting(selectedAgentIds))
    dispatch(clearAgentSelection())
    setShowAlert(false) // Hide alert on successful action
  }

  function handleAssignToEspionage(): void {
    // Validate that all selected agents are available
    const validationResult = agentsView.validateAvailable(selectedAgentIds)

    if (!validationResult.isValid) {
      setAlertMessage(validationResult.errorMessage ?? 'Unknown error')
      setShowAlert(true)
      return
    }

    dispatch(assignAgentsToEspionage(selectedAgentIds))
    dispatch(clearAgentSelection())
    setShowAlert(false) // Hide alert on successful action
  }

  function handleRecallAgents(): void {
    // Check if all selected agents are in "OnAssignment" state
    const validationResult = agentsView.validateOnAssignment(selectedAgentIds)
    if (!validationResult.isValid) {
      setAlertMessage(validationResult.errorMessage ?? 'Unknown error')
      setShowAlert(true)
      return
    }

    dispatch(recallAgents(selectedAgentIds))
    dispatch(clearAgentSelection())
    setShowAlert(false) // Hide alert on successful action
  }

  function handleInvestigateLead(): void {
    if (selectedLeadId === undefined) {
      setAlertMessage('No lead selected!')
      setShowAlert(true)
      return
    }

    // Find the selected lead to get its properties
    const lead = getLeadById(selectedLeadId)

    // Check if the lead is already investigated and is not repeatable
    if (!lead.repeatable && gameState.investigatedLeadIds.includes(selectedLeadId)) {
      setAlertMessage('This lead has already been investigated!')
      setShowAlert(true)
      return
    }

    // Check if player has enough intel
    if (gameState.intel < lead.intelCost) {
      setAlertMessage('Not enough intel')
      setShowAlert(true)
      return
    }

    dispatch(investigateLead({ leadId: selectedLeadId, intelCost: lead.intelCost }))
    dispatch(clearLeadSelection())
    setShowAlert(false) // Hide alert on successful action
  }

  function handleDeployAgents(): void {
    if (selectedMissionSiteId === undefined) {
      setAlertMessage('No mission selected!')
      setShowAlert(true)
      return
    }

    // Validate agents are available
    const agentValidation = agentsView.validateAvailable(selectedAgentIds)
    if (!agentValidation.isValid) {
      setAlertMessage(agentValidation.errorMessage ?? 'Unknown error')
      setShowAlert(true)
      return
    }

    // Validate mission site is available for deployment
    const selectedMissionSite = gameState.missionSites.find((site) => site.id === selectedMissionSiteId)
    const missionValidation = validateMissionSiteDeployment(selectedMissionSite)
    if (!missionValidation.isValid) {
      setAlertMessage(missionValidation.errorMessage ?? 'Unknown error')
      setShowAlert(true)
      return
    }

    dispatch(deployAgentsToMission({ missionSiteId: selectedMissionSiteId, agentIds: selectedAgentIds }))
    dispatch(clearAgentSelection())
    dispatch(clearMissionSelection())
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
              Sack {formatAgentCount(selectedAgentIds.length)}
            </Button>
          </Stack>
          <Stack direction="row" spacing={2}>
            <Button variant="contained" onClick={handleRecallAgents} disabled={selectedAgentIds.length === 0} fullWidth>
              Recall {formatAgentCount(selectedAgentIds.length)}
            </Button>
          </Stack>
          <Button variant="contained" onClick={handleAssignToContracting} disabled={selectedAgentIds.length === 0}>
            Assign {formatAgentCount(selectedAgentIds.length)} to contracting
          </Button>
          <Button variant="contained" onClick={handleAssignToEspionage} disabled={selectedAgentIds.length === 0}>
            Assign {formatAgentCount(selectedAgentIds.length)} to espionage
          </Button>
          <Button
            variant="contained"
            onClick={handleDeployAgents}
            disabled={selectedMissionSiteId === undefined || selectedAgentIds.length === 0}
          >
            Deploy {formatAgentCount(selectedAgentIds.length)} on {formatMissionTarget(selectedMissionSiteId ?? '')}
          </Button>
          <Button variant="contained" onClick={handleInvestigateLead} disabled={selectedLeadId === undefined}>
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
