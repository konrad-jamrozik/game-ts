import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Collapse from '@mui/material/Collapse'
import Stack from '@mui/material/Stack'
import * as React from 'react'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import { getLeadById } from '../lib/collections/leads'
import {
  assignAgentsToContracting,
  assignAgentsToEspionage,
  deployAgentsToMission,
  hireAgent,
  investigateLead,
  recallAgents,
  sackAgents,
} from '../lib/slices/gameStateSlice'
import { clearAgentSelection, clearLeadSelection, clearMissionSelection } from '../lib/slices/selectionSlice'
import { fmtAgentCount, fmtMissionTarget } from '../lib/utils/formatUtils'
import { validateMissionSiteDeployment } from '../lib/utils/MissionSiteUtils'
import { destructiveButtonSx } from '../styling/styleUtils'
import { agsV } from '../lib/model/agents/AgentsView'
import { getMoneyNewBalance } from '../lib/model/ruleset/ruleset'

export function PlayerActions(): React.JSX.Element {
  const dispatch = useAppDispatch()
  const agentSelection = useAppSelector((state) => state.selection.agents)
  const selectedLeadId = useAppSelector((state) => state.selection.selectedLeadId)
  const selectedMissionSiteId = useAppSelector((state) => state.selection.selectedMissionSiteId)

  const gameState = useAppSelector((state) => state.undoable.present.gameState)
  const agents = agsV(gameState.agents)
  const [showAlert, setShowAlert] = React.useState(false)
  const [alertMessage, setAlertMessage] = React.useState('')

  const selectedAgentIds = agentSelection.filter((id) => agents.some((agent) => agent.agent().id === id))

  function handleHireAgent(): void {
    // Note: the newBalance here is counted before subtracting the about-to-be-hired agent hiring cost.
    // As such, if current balance is below AGENT_HIRE_COST, the alert will still be hired,
    // the newBalance will become negative, and no more agents will be hireable.
    // This is by design: player can get into projected negative balance, but once they are in it,
    // they cannot hire any more agents.
    const newBalance = getMoneyNewBalance(gameState)
    if (newBalance <= 0) {
      setAlertMessage('Insufficient funds')
      setShowAlert(true)
      return
    }

    setShowAlert(false) // Hide alert on successful action
    dispatch(hireAgent())
  }

  function handleSackAgents(): void {
    // Validate that all selected agents are available
    const validationResult = agents.validateAvailable(selectedAgentIds)

    if (!validationResult.isValid) {
      setAlertMessage(validationResult.errorMessage ?? 'Unknown error')
      setShowAlert(true)
      return
    }

    setShowAlert(false) // Hide alert on successful action
    dispatch(sackAgents(selectedAgentIds))
    dispatch(clearAgentSelection())
  }

  function handleAssignToContracting(): void {
    // Validate that all selected agents are available
    const validationResult = agents.validateAvailable(selectedAgentIds)

    if (!validationResult.isValid) {
      setAlertMessage(validationResult.errorMessage ?? 'Unknown error')
      setShowAlert(true)
      return
    }

    setShowAlert(false) // Hide alert on successful action
    dispatch(assignAgentsToContracting(selectedAgentIds))
    dispatch(clearAgentSelection())
  }

  function handleAssignToEspionage(): void {
    // Validate that all selected agents are available
    const validationResult = agents.validateAvailable(selectedAgentIds)

    if (!validationResult.isValid) {
      setAlertMessage(validationResult.errorMessage ?? 'Unknown error')
      setShowAlert(true)
      return
    }

    setShowAlert(false) // Hide alert on successful action
    dispatch(assignAgentsToEspionage(selectedAgentIds))
    dispatch(clearAgentSelection())
  }

  function handleRecallAgents(): void {
    // Check if all selected agents are in "OnAssignment" state
    const validationResult = agents.validateOnAssignment(selectedAgentIds)
    if (!validationResult.isValid) {
      setAlertMessage(validationResult.errorMessage ?? 'Unknown error')
      setShowAlert(true)
      return
    }

    setShowAlert(false) // Hide alert on successful action
    dispatch(recallAgents(selectedAgentIds))
    dispatch(clearAgentSelection())
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
    if (!lead.repeatable && (gameState.leadInvestigationCounts[selectedLeadId] ?? 0) > 0) {
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

    setShowAlert(false) // Hide alert on successful action
    dispatch(investigateLead({ leadId: selectedLeadId, intelCost: lead.intelCost }))
    dispatch(clearLeadSelection())
  }

  function handleDeployAgents(): void {
    if (selectedMissionSiteId === undefined) {
      setAlertMessage('No mission selected!')
      setShowAlert(true)
      return
    }

    // Validate agents are available
    const agentValidation = agents.validateAvailable(selectedAgentIds)
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

    setShowAlert(false) // Hide alert on successful action
    dispatch(deployAgentsToMission({ missionSiteId: selectedMissionSiteId, agentIds: selectedAgentIds }))
    dispatch(clearAgentSelection())
    dispatch(clearMissionSelection())
  }

  return (
    <Card sx={{ width: 380 }}>
      <CardHeader title="Player Actions" />
      <CardContent>
        <Stack direction="column" spacing={2}>
          <Stack direction="row" spacing={2}>
            <Button variant="contained" onClick={handleHireAgent} fullWidth>
              Hire Agent
            </Button>
            <Button
              variant="contained"
              onClick={handleSackAgents}
              disabled={selectedAgentIds.length === 0}
              sx={destructiveButtonSx}
              fullWidth
            >
              Sack {fmtAgentCount(selectedAgentIds.length)}
            </Button>
          </Stack>
          <Stack direction="row" spacing={2}>
            <Button variant="contained" onClick={handleRecallAgents} disabled={selectedAgentIds.length === 0} fullWidth>
              Recall {fmtAgentCount(selectedAgentIds.length)}
            </Button>
          </Stack>
          <Button variant="contained" onClick={handleAssignToContracting} disabled={selectedAgentIds.length === 0}>
            Assign {fmtAgentCount(selectedAgentIds.length)} to contracting
          </Button>
          <Button variant="contained" onClick={handleAssignToEspionage} disabled={selectedAgentIds.length === 0}>
            Assign {fmtAgentCount(selectedAgentIds.length)} to espionage
          </Button>
          <Button
            variant="contained"
            onClick={handleDeployAgents}
            disabled={selectedMissionSiteId === undefined || selectedAgentIds.length === 0}
          >
            Deploy {fmtAgentCount(selectedAgentIds.length)} on {fmtMissionTarget(selectedMissionSiteId)}
          </Button>
          <Button variant="contained" onClick={handleInvestigateLead} disabled={selectedLeadId === undefined}>
            Investigate lead
          </Button>
          <Collapse in={showAlert}>
            <Alert
              severity="error"
              onClose={() => setShowAlert(false)}
              sx={{ textAlign: 'center', alignItems: 'center' }}
              aria-label="player-actions-alert"
            >
              {alertMessage}
            </Alert>
          </Collapse>
        </Stack>
      </CardContent>
    </Card>
  )
}
