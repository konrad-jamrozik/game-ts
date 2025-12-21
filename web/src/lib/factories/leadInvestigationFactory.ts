import type { AgentId } from '../model/agentModel'
import type { LeadId, LeadInvestigation, LeadInvestigationId } from '../model/leadModel'

/**
 * Creates a new lead investigation object.
 * Returns the created lead investigation. The caller is responsible for adding it to state.
 */
export function bldLeadInvestigation(params: CreateLeadInvestigationParams): LeadInvestigation {
  const { investigationCount, turn, leadId, agentIds } = params

  // Invariant: next investigation numeric id is always the current number of investigations
  const investigationId: LeadInvestigationId = `investigation-${investigationCount.toString().padStart(3, '0')}`

  const newInvestigation: LeadInvestigation = {
    id: investigationId,
    leadId,
    accumulatedIntel: 0,
    agentIds,
    startTurn: turn,
    state: 'Active',
  }

  return newInvestigation
}

type CreateLeadInvestigationParams = {
  investigationCount: number
  turn: number
  leadId: LeadId
  agentIds: AgentId[]
}
