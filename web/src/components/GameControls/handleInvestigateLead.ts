import type { AppDispatch } from '../../redux/store'
import type { GameState } from '../../lib/model/gameStateModel'
import type { AgentId, LeadId, LeadInvestigationId } from '../../lib/model/modelIds'
import { getLeadById } from '../../lib/model_utils/leadUtils'
import { getLeadInvestigationById } from '../../lib/model_utils/leadInvestigationUtils'
import { startLeadInvestigation, addAgentsToInvestigation } from '../../redux/slices/gameStateSlice'
import { clearLeadSelection, clearInvestigationSelection, clearAgentSelection } from '../../redux/slices/selectionSlice'
import { validateAvailableAgents, validateNotExhaustedAgents } from '../../lib/model_utils/validateAgents'
import { assertDefined, assertNotBothTrue, assertNotEmpty, assertTrue } from '../../lib/primitives/assertPrimitives'

export type HandleInvestigateLeadDependencies = {
  dispatch: AppDispatch
  gameState: GameState
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
  const { gameState, selectedLeadId, selectedInvestigationId, selectedAgentIds, setAlertMessage, setShowAlert } = deps

  // Assertions for cases that should never happen (UI should prevent these)
  assertNotBothTrue(
    selectedLeadId !== undefined,
    selectedInvestigationId !== undefined,
    'Both lead and investigation cannot be selected at the same time',
  )
  assertNotEmpty(selectedAgentIds, 'At least one agent must be selected')

  // Common validation: check if agents are available and not exhausted
  // These are user-facing errors, so show alert instead of asserting
  const availabilityValidation = validateAvailableAgents(gameState.agents, selectedAgentIds)
  if (!availabilityValidation.isValid) {
    setAlertMessage(availabilityValidation.errorMessage)
    setShowAlert(true)
    return
  }

  const exhaustionValidation = validateNotExhaustedAgents(gameState.agents, selectedAgentIds)
  if (!exhaustionValidation.isValid) {
    setAlertMessage(exhaustionValidation.errorMessage)
    setShowAlert(true)
    return
  }

  // Route to appropriate happy path
  if (selectedInvestigationId !== undefined) {
    handleAddAgentsToInvestigation(deps)
  } else {
    handleStartNewInvestigation(deps)
  }
}

function handleAddAgentsToInvestigation(deps: HandleInvestigateLeadDependencies): void {
  const { dispatch, gameState, selectedInvestigationId, selectedAgentIds, setShowAlert } = deps

  assertDefined(selectedInvestigationId, 'Investigation ID must be defined')
  // Assert that investigation exists (will throw if not found)
  getLeadInvestigationById(selectedInvestigationId, gameState)

  setShowAlert(false)
  dispatch(addAgentsToInvestigation({ investigationId: selectedInvestigationId, agentIds: selectedAgentIds }))
  dispatch(clearInvestigationSelection())
  dispatch(clearAgentSelection())
}

function handleStartNewInvestigation(deps: HandleInvestigateLeadDependencies): void {
  const { dispatch, gameState, selectedLeadId, selectedAgentIds, setShowAlert } = deps

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

  setShowAlert(false)
  dispatch(startLeadInvestigation({ leadId: selectedLeadId, agentIds: selectedAgentIds }))
  dispatch(clearLeadSelection())
  dispatch(clearAgentSelection())
}
