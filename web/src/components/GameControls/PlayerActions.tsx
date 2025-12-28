import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Collapse from '@mui/material/Collapse'
import Stack from '@mui/material/Stack'
import * as React from 'react'
import { useAppDispatch, useAppSelector } from '../../redux/hooks'
import { getPlayerActionsApi } from '../../redux/playerActionsApi'
import { ExpandableCard } from '../Common/ExpandableCard'
import { LEFT_COLUMN_CARD_WIDTH } from '../Common/widthConstants'
import { clearAgentSelection, clearMissionSelection } from '../../redux/slices/selectionSlice'
import { fmtAgentCount, fmtMissionTarget } from '../../lib/model_utils/formatUtils'
import { destructiveButtonSx } from '../styling/stylePrimitives'
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
  const api = getPlayerActionsApi(dispatch)

  function handleHireAgent(): void {
    const result = api.hireAgent(gameState)
    if (!result.success) {
      setAlertMessage(result.errorMessage)
      setShowAlert(true)
      return
    }
    setShowAlert(false)
  }

  function handleSackAgents(): void {
    const result = api.sackAgents(gameState, selectedAgentIds)
    if (!result.success) {
      setAlertMessage(result.errorMessage)
      setShowAlert(true)
      return
    }
    setShowAlert(false)
    dispatch(clearAgentSelection())
  }

  function handleAssignToContracting(): void {
    const result = api.assignAgentsToContracting(gameState, selectedAgentIds)
    if (!result.success) {
      setAlertMessage(result.errorMessage)
      setShowAlert(true)
      return
    }
    setShowAlert(false)
    dispatch(clearAgentSelection())
  }

  function handleAssignToTraining(): void {
    const result = api.assignAgentsToTraining(gameState, selectedAgentIds)
    if (!result.success) {
      setAlertMessage(result.errorMessage)
      setShowAlert(true)
      return
    }
    setShowAlert(false)
    dispatch(clearAgentSelection())
  }

  function handleRecallAgents(): void {
    const result = api.recallAgents(gameState, selectedAgentIds)
    if (!result.success) {
      setAlertMessage(result.errorMessage)
      setShowAlert(true)
      return
    }
    setShowAlert(false)
    dispatch(clearAgentSelection())
  }

  function handleInvestigateLeadClick(): void {
    handleInvestigateLead({
      api,
      gameState,
      dispatch,
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

    const result = api.deployAgentsToMission(gameState, { missionId: selectedMissionId, agentIds: selectedAgentIds })
    if (!result.success) {
      setAlertMessage(result.errorMessage)
      setShowAlert(true)
      return
    }
    setShowAlert(false)
    dispatch(clearAgentSelection())
    dispatch(clearMissionSelection())
  }

  function handleBuyUpgrade(): void {
    if (selectedUpgradeName === undefined) {
      setAlertMessage('No upgrade selected!')
      setShowAlert(true)
      return
    }

    const result = api.buyUpgrade(gameState, selectedUpgradeName)
    if (!result.success) {
      setAlertMessage(result.errorMessage)
      setShowAlert(true)
      return
    }
    setShowAlert(false)
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
