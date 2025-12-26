import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Collapse from '@mui/material/Collapse'
import Stack from '@mui/material/Stack'
import * as React from 'react'
import { useAppDispatch, useAppSelector } from '../../redux/hooks'
import { ExpandableCard } from '../Common/ExpandableCard'
import { LEFT_COLUMN_CARD_WIDTH } from '../Common/widthConstants'
import {
  assignAgentsToContracting,
  assignAgentsToTraining,
  buyUpgrade,
  deployAgentsToMission,
  hireAgent,
  recallAgents,
  sackAgents,
} from '../../redux/slices/gameStateSlice'
import { clearAgentSelection, clearMissionSelection } from '../../redux/slices/selectionSlice'
import { fmtAgentCount, fmtMissionTarget } from '../../lib/model_utils/formatUtils'
import { getRemainingTransportCap, validateMissionDeployment } from '../../lib/model_utils/missionUtils'
import { destructiveButtonSx } from '../styling/stylePrimitives'
import { notTerminated, onTrainingAssignment } from '../../lib/model_utils/agentUtils'
import {
  validateAvailableAgents,
  validateOnAssignmentAgents,
  validateNotExhaustedAgents,
} from '../../lib/model_utils/validateAgents'
import { AGENT_HIRE_COST } from '../../lib/data_tables/constants'
import { handleInvestigateLead } from './handleInvestigateLead'

export function PlayerActions(): React.JSX.Element {
  const dispatch = useAppDispatch()
  const agentSelection = useAppSelector((state) => state.selection.agents)
  const selectedLeadId = useAppSelector((state) => state.selection.selectedLeadId)
  const selectedInvestigationId = useAppSelector((state) => state.selection.selectedInvestigationId)
  const selectedMissionId = useAppSelector((state) => state.selection.selectedMissionId)
  const selectedUpgradeName = useAppSelector((state) => state.selection.selectedUpgradeName)

  const gameState = useAppSelector((state) => state.undoable.present.gameState)
  const [showAlert, setShowAlert] = React.useState(false)
  const [alertMessage, setAlertMessage] = React.useState('')

  const selectedAgentIds = agentSelection.filter((id) => gameState.agents.some((agent) => agent.id === id))

  function handleHireAgent(): void {
    // Check if player has enough money to hire an agent
    if (gameState.money < AGENT_HIRE_COST) {
      setAlertMessage('Insufficient funds')
      setShowAlert(true)
      return
    }

    // Validate agent cap (only count non-terminated agents)
    if (notTerminated(gameState.agents).length >= gameState.agentCap) {
      setAlertMessage(`Cannot hire more than ${gameState.agentCap} agents (agent cap reached)`)
      setShowAlert(true)
      return
    }

    setShowAlert(false) // Hide alert on successful action
    dispatch(hireAgent())
  }

  function handleSackAgents(): void {
    // Validate that all selected agents are available
    const validationResult = validateAvailableAgents(gameState.agents, selectedAgentIds)

    if (!validationResult.isValid) {
      setAlertMessage(validationResult.errorMessage)
      setShowAlert(true)
      return
    }

    setShowAlert(false) // Hide alert on successful action
    dispatch(sackAgents(selectedAgentIds))
    dispatch(clearAgentSelection())
  }

  function handleAssignToContracting(): void {
    // Validate that all selected agents are available
    const availabilityValidation = validateAvailableAgents(gameState.agents, selectedAgentIds)

    if (!availabilityValidation.isValid) {
      setAlertMessage(availabilityValidation.errorMessage)
      setShowAlert(true)
      return
    }

    // Validate that agents are not exhausted
    const exhaustionValidation = validateNotExhaustedAgents(gameState.agents, selectedAgentIds)

    if (!exhaustionValidation.isValid) {
      setAlertMessage(exhaustionValidation.errorMessage)
      setShowAlert(true)
      return
    }

    setShowAlert(false) // Hide alert on successful action
    dispatch(assignAgentsToContracting(selectedAgentIds))
    dispatch(clearAgentSelection())
  }

  function handleAssignToTraining(): void {
    // Validate that all selected agents are available
    const availabilityValidation = validateAvailableAgents(gameState.agents, selectedAgentIds)

    if (!availabilityValidation.isValid) {
      setAlertMessage(availabilityValidation.errorMessage)
      setShowAlert(true)
      return
    }

    // Validate that agents are not exhausted
    const exhaustionValidation = validateNotExhaustedAgents(gameState.agents, selectedAgentIds)

    if (!exhaustionValidation.isValid) {
      setAlertMessage(exhaustionValidation.errorMessage)
      setShowAlert(true)
      return
    }

    // Count how many agents are already in training
    const agentsInTraining = onTrainingAssignment(gameState.agents).length
    const availableTrainingCap = gameState.trainingCap - agentsInTraining

    if (selectedAgentIds.length > availableTrainingCap) {
      setAlertMessage(
        `Cannot assign ${selectedAgentIds.length} agents to training. Only ${availableTrainingCap} training slots available.`,
      )
      setShowAlert(true)
      return
    }

    setShowAlert(false) // Hide alert on successful action
    dispatch(assignAgentsToTraining(selectedAgentIds))
    dispatch(clearAgentSelection())
  }

  function handleRecallAgents(): void {
    // Check if all selected agents are in "OnAssignment" state
    const validationResult = validateOnAssignmentAgents(gameState.agents, selectedAgentIds)
    if (!validationResult.isValid) {
      setAlertMessage(validationResult.errorMessage)
      setShowAlert(true)
      return
    }

    setShowAlert(false) // Hide alert on successful action
    dispatch(recallAgents(selectedAgentIds))
    dispatch(clearAgentSelection())
  }

  function handleInvestigateLeadClick(): void {
    handleInvestigateLead({
      dispatch,
      gameState,
      selectedLeadId,
      selectedInvestigationId,
      selectedAgentIds,
      setAlertMessage,
      setShowAlert,
    })
  }

  function handleDeployAgents(): void {
    if (selectedMissionId === undefined) {
      setAlertMessage('No mission selected!')
      setShowAlert(true)
      return
    }

    // Validate agents are available
    const availabilityValidation = validateAvailableAgents(gameState.agents, selectedAgentIds)
    if (!availabilityValidation.isValid) {
      setAlertMessage(availabilityValidation.errorMessage)
      setShowAlert(true)
      return
    }

    // Validate that agents are not exhausted
    const exhaustionValidation = validateNotExhaustedAgents(gameState.agents, selectedAgentIds)

    if (!exhaustionValidation.isValid) {
      setAlertMessage(exhaustionValidation.errorMessage)
      setShowAlert(true)
      return
    }

    // Validate transport cap
    const remainingTransportCap = getRemainingTransportCap(gameState.missions, gameState.transportCap)
    if (selectedAgentIds.length > remainingTransportCap) {
      setAlertMessage(
        `Cannot deploy ${selectedAgentIds.length} agents. Only ${remainingTransportCap} transport slots available.`,
      )
      setShowAlert(true)
      return
    }

    // Validate mission is available for deployment
    const selectedMission = gameState.missions.find((m) => m.id === selectedMissionId)
    const missionValidation = validateMissionDeployment(selectedMission)
    if (!missionValidation.isValid) {
      setAlertMessage(missionValidation.errorMessage)
      setShowAlert(true)
      return
    }

    setShowAlert(false) // Hide alert on successful action
    dispatch(deployAgentsToMission({ missionId: selectedMissionId, agentIds: selectedAgentIds }))
    dispatch(clearAgentSelection())
    dispatch(clearMissionSelection())
  }

  function handleBuyUpgrade(): void {
    if (selectedUpgradeName === undefined) {
      setAlertMessage('No upgrade selected!')
      setShowAlert(true)
      return
    }

    const UPGRADE_PRICE = 100
    if (gameState.money < UPGRADE_PRICE) {
      setAlertMessage('Insufficient funds')
      setShowAlert(true)
      return
    }

    setShowAlert(false) // Hide alert on successful action
    dispatch(buyUpgrade(selectedUpgradeName))
  }

  return (
    <ExpandableCard
      id="player-actions"
      title="Player Actions"
      defaultExpanded={true}
      sx={{ width: LEFT_COLUMN_CARD_WIDTH }}
    >
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
        <Button variant="contained" onClick={handleAssignToTraining} disabled={selectedAgentIds.length === 0}>
          Assign {fmtAgentCount(selectedAgentIds.length)} to training
        </Button>
        <Button
          variant="contained"
          onClick={handleDeployAgents}
          disabled={selectedMissionId === undefined || selectedAgentIds.length === 0}
        >
          Deploy {fmtAgentCount(selectedAgentIds.length)} on {fmtMissionTarget(selectedMissionId)}
        </Button>
        <Button
          variant="contained"
          onClick={handleInvestigateLeadClick}
          disabled={
            (selectedLeadId === undefined && selectedInvestigationId === undefined) || selectedAgentIds.length === 0
          }
        >
          Investigate lead
        </Button>
        <Button variant="contained" onClick={handleBuyUpgrade} disabled={selectedUpgradeName === undefined}>
          Buy upgrade
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
    </ExpandableCard>
  )
}
