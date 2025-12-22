import type { LeadId, LeadInvestigation, LeadInvestigationId } from '../model/leadModel'
import { formatLeadInvestigationId } from '../model_utils/formatModelUtils'

/**
 * Prototype lead investigation with all default values.
 * Used as a reference for initial lead investigation properties.
 */
export const initialLeadInvestigation: LeadInvestigation = {
  id: 'investigation-ini' as LeadInvestigationId,
  leadId: 'lead-ini' as LeadId,
  accumulatedIntel: 0,
  agentIds: [],
  startTurn: 1,
  state: 'Active',
}

// KJA1 why omit these? Do not omit. Fix naming.
type CreateLeadInvestigationParams = {
  investigationCount: number
  turn: number
} & Partial<Omit<LeadInvestigation, 'id' | 'startTurn'>>

/**
 * Creates a new lead investigation object.
 * Returns the created lead investigation. The caller is responsible for adding it to state.
 */
export function bldLeadInvestigation(params: CreateLeadInvestigationParams): LeadInvestigation {
  const { investigationCount, turn, ...investigationOverrides } = params

  // Start with initialLeadInvestigation and override with provided values
  const investigation: LeadInvestigation = {
    ...initialLeadInvestigation,
    ...investigationOverrides,
  }

  // Generate ID if not provided
  if (investigation.id === initialLeadInvestigation.id) {
    investigation.id = formatLeadInvestigationId(investigationCount)
  }

  // Set startTurn to turn parameter if not explicitly provided
  if (!('startTurn' in investigationOverrides)) {
    investigation.startTurn = turn
  }

  return investigation
}
