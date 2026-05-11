import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import * as React from 'react'
import { useAppDispatch, useAppSelector } from '../../redux/hooks'
import { getPlayerActionsApi } from '../../redux/playerActionsApi'
import { getCurrentTurnState } from '../../redux/storeUtils'
import { handleInvestigateLead } from '../GameControls/handleInvestigateLead'
import { SCREEN_ACTIONS_COLUMN_WIDTH } from '../Common/dataGridLayout'
import { SECTION_GAP } from '../styling/spacing'

export function LeadInvestigationActions(): React.JSX.Element {
  const dispatch = useAppDispatch()
  const selectedLeadId = useAppSelector((state) => state.selection.selectedLeadId)
  const selectedInvestigationId = useAppSelector((state) => state.selection.selectedInvestigationId)
  const agentSelection = useAppSelector((state) => state.selection.agents)
  const gameState = useAppSelector(getCurrentTurnState)

  const selectedAgentIds = agentSelection.filter((id) => gameState.agents.some((agent) => agent.id === id))
  const api = getPlayerActionsApi(dispatch)
  const selectedLeadOrInvestigation = selectedLeadId !== undefined || selectedInvestigationId !== undefined

  function handleInvestigateLeadClick(): void {
    handleInvestigateLead({
      api,
      gameState,
      dispatch,
      selectedLeadId,
      selectedInvestigationId,
      selectedAgentIds,
    })
  }

  return (
    <Stack spacing={SECTION_GAP} alignItems="center">
      <Button
        variant="contained"
        onClick={handleInvestigateLeadClick}
        disabled={!selectedLeadOrInvestigation || selectedAgentIds.length === 0}
        sx={{ width: SCREEN_ACTIONS_COLUMN_WIDTH }}
      >
        {getInvestigateLeadButtonLabel(selectedLeadId, selectedInvestigationId, selectedAgentIds.length)}
      </Button>
    </Stack>
  )
}

function getInvestigateLeadButtonLabel(
  selectedLeadId: string | undefined,
  selectedInvestigationId: string | undefined,
  selectedAgentCount: number,
): string {
  if (selectedLeadId === undefined && selectedInvestigationId === undefined) {
    return 'Select a lead'
  }

  if (selectedAgentCount === 0) {
    return 'Select ready agents'
  }

  if (selectedInvestigationId !== undefined) {
    return 'Add agents to investigation'
  }

  return 'Investigate lead'
}
