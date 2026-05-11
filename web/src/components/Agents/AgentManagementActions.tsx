import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Collapse from '@mui/material/Collapse'
import Stack from '@mui/material/Stack'
import * as React from 'react'
import { useAppDispatch, useAppSelector } from '../../redux/hooks'
import { getPlayerActionsApi } from '../../redux/playerActionsApi'
import { clearAgentSelection } from '../../redux/slices/selectionSlice'
import { fmtAgentCount } from '../../lib/model_utils/formatUtils'
import { destructiveButtonSx } from '../styling/stylePrimitives'
import { getCurrentTurnState } from '../../redux/storeUtils'
import { SCREEN_ACTIONS_COLUMN_WIDTH } from '../Common/dataGridLayout'

export function AgentManagementActions(): React.JSX.Element {
  const dispatch = useAppDispatch()
  const agentSelection = useAppSelector((state) => state.selection.agents)
  const gameState = useAppSelector(getCurrentTurnState)
  const [showAlert, setShowAlert] = React.useState(false)
  const [alertMessage, setAlertMessage] = React.useState('')

  const selectedAgentIds = agentSelection.filter((id) => gameState.agents.some((agent) => agent.id === id))
  const api = getPlayerActionsApi(dispatch)

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

  function handleHireAgent(): void {
    const result = api.hireAgent(gameState)
    if (!result.success) {
      setAlertMessage(result.errorMessage)
      setShowAlert(true)
      return
    }
    setShowAlert(false)
  }

  return (
    <Stack spacing={2} alignItems="center">
      <Stack direction="row" spacing={2} sx={{ width: '100%' }}>
        <Button variant="contained" onClick={handleHireAgent} fullWidth sx={{ minWidth: 0 }}>
          Hire Agent
        </Button>
        <Button
          variant="contained"
          onClick={handleSackAgents}
          disabled={selectedAgentIds.length === 0}
          sx={{ ...destructiveButtonSx, minWidth: 0 }}
          fullWidth
        >
          Sack {fmtAgentCount(selectedAgentIds.length)}
        </Button>
      </Stack>
      <Button
        variant="contained"
        onClick={handleRecallAgents}
        disabled={selectedAgentIds.length === 0}
        sx={{ width: SCREEN_ACTIONS_COLUMN_WIDTH }}
      >
        Recall {fmtAgentCount(selectedAgentIds.length)}
      </Button>
      <Button
        variant="contained"
        onClick={handleAssignToContracting}
        disabled={selectedAgentIds.length === 0}
        sx={{ width: SCREEN_ACTIONS_COLUMN_WIDTH }}
      >
        Assign {fmtAgentCount(selectedAgentIds.length)} to contracting
      </Button>
      <Button
        variant="contained"
        onClick={handleAssignToTraining}
        disabled={selectedAgentIds.length === 0}
        sx={{ width: SCREEN_ACTIONS_COLUMN_WIDTH }}
      >
        Assign {fmtAgentCount(selectedAgentIds.length)} to training
      </Button>
      <Collapse in={showAlert}>
        <Alert
          severity="error"
          onClose={() => setShowAlert(false)}
          sx={{ textAlign: 'center', alignItems: 'center', width: SCREEN_ACTIONS_COLUMN_WIDTH }}
          aria-label="agent-management-actions-alert"
        >
          {alertMessage}
        </Alert>
      </Collapse>
    </Stack>
  )
}
