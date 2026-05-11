import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Collapse from '@mui/material/Collapse'
import Stack from '@mui/material/Stack'
import * as React from 'react'
import { useAppDispatch, useAppSelector } from '../../redux/hooks'
import { getPlayerActionsApi } from '../../redux/playerActionsApi'
import { clearAgentSelection, clearMissionSelection } from '../../redux/slices/selectionSlice'
import { fmtAgentCount, fmtMissionTarget } from '../../lib/model_utils/formatUtils'
import { asMissionId } from '../../lib/model/modelIds'
import { getCurrentTurnState } from '../../redux/storeUtils'
import { SCREEN_ACTIONS_COLUMN_WIDTH } from '../Common/dataGridLayout'
import { SECTION_GAP } from '../styling/spacing'

export function MissionDeploymentActions(): React.JSX.Element {
  const dispatch = useAppDispatch()
  const agentSelection = useAppSelector((state) => state.selection.agents)
  const selectedMissionId = useAppSelector((state) => state.selection.selectedMissionId)
  const gameState = useAppSelector(getCurrentTurnState)
  const [showAlert, setShowAlert] = React.useState(false)
  const [alertMessage, setAlertMessage] = React.useState('')

  const selectedAgentIds = agentSelection.filter((id) => gameState.agents.some((agent) => agent.id === id))
  const api = getPlayerActionsApi(dispatch)

  const selectedMission =
    selectedMissionId !== undefined ? gameState.missions.find((m) => m.id === selectedMissionId) : undefined

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

  const deployButtonLabel = getDeployButtonLabel({
    selectedMissionId,
    selectedAgentCount: selectedAgentIds.length,
    missionState: selectedMission?.state,
  })

  const deployDisabled =
    selectedMissionId === undefined ||
    selectedAgentIds.length === 0 ||
    selectedMission === undefined ||
    selectedMission.state !== 'Active'

  return (
    <Stack spacing={SECTION_GAP} sx={{ alignItems: 'center' }}>
      <Button
        variant="contained"
        onClick={handleDeployAgents}
        disabled={deployDisabled}
        sx={{ width: SCREEN_ACTIONS_COLUMN_WIDTH }}
      >
        {deployButtonLabel}
      </Button>
      <Collapse in={showAlert}>
        <Alert
          severity="error"
          onClose={() => setShowAlert(false)}
          sx={{ textAlign: 'center', alignItems: 'center', width: SCREEN_ACTIONS_COLUMN_WIDTH }}
          aria-label="mission-deployment-actions-alert"
        >
          {alertMessage}
        </Alert>
      </Collapse>
    </Stack>
  )
}

function getDeployButtonLabel(params: {
  selectedMissionId: string | undefined
  selectedAgentCount: number
  missionState: string | undefined
}): string {
  const { selectedMissionId, selectedAgentCount, missionState } = params

  if (selectedMissionId === undefined) {
    return 'Select a mission'
  }

  const missionId = asMissionId(selectedMissionId)

  if (missionState !== undefined && missionState !== 'Active') {
    return 'Select an active mission'
  }

  if (selectedAgentCount === 0) {
    return 'Select any ready agent'
  }

  return `Deploy ${fmtAgentCount(selectedAgentCount)} on ${fmtMissionTarget(missionId)}`
}
