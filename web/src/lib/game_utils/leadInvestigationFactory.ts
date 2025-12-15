import type { GameState } from '../model/gameStateModel'
import type { AgentId } from '../model/agentModel'
import type { LeadId, LeadInvestigation, LeadInvestigationId } from '../model/leadModel'

type CreateLeadInvestigationParams = {
  state: GameState
  leadId: LeadId
  agentIds: AgentId[]
}

/**
 * Creates a new lead investigation and adds it to the game state.
 * Returns the created lead investigation.
 */
export function bldLeadInvestigation(params: CreateLeadInvestigationParams): LeadInvestigation {
  const { state, leadId, agentIds } = params

  // Invariant: next investigation numeric id is always the current number of investigations
  const nextInvestigationNumericId = Object.keys(state.leadInvestigations).length
  const investigationId: LeadInvestigationId = `investigation-${nextInvestigationNumericId.toString().padStart(3, '0')}`

  const newInvestigation: LeadInvestigation = {
    id: investigationId,
    leadId,
    accumulatedIntel: 0,
    agentIds,
    startTurn: state.turn,
    state: 'Active',
  }

  state.leadInvestigations[investigationId] = newInvestigation

  return newInvestigation
}
