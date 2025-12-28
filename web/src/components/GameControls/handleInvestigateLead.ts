import type { AppDispatch } from '../../redux/store'
import type { PlayerActionsAPI } from '../../lib/model_utils/playerActionsApiTypes'
import type { GameState } from '../../lib/model/gameStateModel'
import type { AgentId, LeadId, LeadInvestigationId } from '../../lib/model/modelIds'
import { getLeadById } from '../../lib/model_utils/leadUtils'
import { getLeadInvestigationById } from '../../lib/model_utils/leadInvestigationUtils'
import { clearLeadSelection, clearInvestigationSelection, clearAgentSelection } from '../../redux/slices/selectionSlice'
import { assertDefined, assertNotBothTrue, assertNotEmpty, assertTrue } from '../../lib/primitives/assertPrimitives'

export type HandleInvestigateLeadDependencies = {
  api: PlayerActionsAPI
  gameState: GameState
  dispatch: AppDispatch
  selectedLeadId: LeadId | undefined
  selectedInvestigationId: LeadInvestigationId | undefined
  selectedAgentIds: AgentId[]
  setAlertMessage: (message: string) => void
  setShowAlert: (show: boolean) => void
}

/**
 * This function handles what happens when the "investigate lead" button is clicked by the player.
 * There are following happy paths:
 * - 1. When a lead is selected, then a new investigation is created with the selected agents.
 * - 2. When a lead investigation is selected, then the selected agents are added to the investigation.
 *
 * In both cases, all of the selected agents must be available and not exhausted.
 * If either of these conditions is not met, an alert is shown to the player and the function returns early.
 *
 * All other cases should result in assertion failure, because it should not be possible for the
 * player to end up in such a state - UI should have prevented this.
 * This includes cases like:
 * - Both lead and investigation are selected.
 * - No agents are selected.
 * - Any objects cannot be found based on their selected IDs: lead, investigation, agents.
 * - The selected lead already has an active investigation.
 * - The selected lead was already successfully investigated and is not repeatable.
 */
export function handleInvestigateLead(deps: HandleInvestigateLeadDependencies): void {
  const { selectedLeadId, selectedInvestigationId, selectedAgentIds } = deps

  // Assertions for cases that should never happen (UI should prevent these)
  assertNotBothTrue(
    selectedLeadId !== undefined,
    selectedInvestigationId !== undefined,
    'Both lead and investigation cannot be selected at the same time',
  )
  assertNotEmpty(selectedAgentIds, 'At least one agent must be selected')

  // Route to appropriate happy path
  if (selectedInvestigationId !== undefined) {
    handleAddAgentsToInvestigation(deps)
  } else {
    handleStartNewInvestigation(deps)
  }
}

function handleAddAgentsToInvestigation(deps: HandleInvestigateLeadDependencies): void {
  const { api, gameState, dispatch, selectedInvestigationId, selectedAgentIds, setAlertMessage, setShowAlert } = deps

  assertDefined(selectedInvestigationId, 'Investigation ID must be defined')
  // Assert that investigation exists (will throw if not found)
  getLeadInvestigationById(selectedInvestigationId, gameState)

  const result = api.addAgentsToInvestigation({ investigationId: selectedInvestigationId, agentIds: selectedAgentIds })
  if (!result.success) {
    setAlertMessage(result.errorMessage)
    setShowAlert(true)
    return
  }

  setShowAlert(false)
  dispatch(clearInvestigationSelection())
  dispatch(clearAgentSelection())
}

function handleStartNewInvestigation(deps: HandleInvestigateLeadDependencies): void {
  const { api, gameState, dispatch, selectedLeadId, selectedAgentIds, setAlertMessage, setShowAlert } = deps

  assertDefined(selectedLeadId, 'Lead ID must be defined')
  const lead = getLeadById(selectedLeadId)

  // Assert that lead doesn't already have an active investigation
  const hasActiveInvestigationForLead = Object.values(gameState.leadInvestigations).some(
    (investigation) => investigation.leadId === selectedLeadId && investigation.state === 'Active',
  )
  assertTrue(!hasActiveInvestigationForLead, `Lead ${selectedLeadId} already has an active investigation`)

  // Assert that lead is repeatable or hasn't been investigated yet
  const investigationCount = gameState.leadInvestigationCounts[selectedLeadId] ?? 0
  assertTrue(
    lead.repeatable || investigationCount === 0,
    `Lead ${selectedLeadId} has already been investigated and is not repeatable`,
  )

  const result = api.startLeadInvestigation({ leadId: selectedLeadId, agentIds: selectedAgentIds })
  if (!result.success) {
    setAlertMessage(result.errorMessage)
    setShowAlert(true)
    return
  }

  setShowAlert(false)
  dispatch(clearLeadSelection())
  dispatch(clearAgentSelection())
}
