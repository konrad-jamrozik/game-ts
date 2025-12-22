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

type CreateLeadInvestigationParams = {
  investigationCount: number
} & Partial<LeadInvestigation>

/**
 * Creates a new lead investigation object.
 * Returns the created lead investigation. The caller is responsible for adding it to state.
 */
export function bldLeadInvestigation(params: CreateLeadInvestigationParams): LeadInvestigation {
  const { investigationCount, ...investigationOverrides } = params

  // Start with initialLeadInvestigation and override with provided values
  const investigation: LeadInvestigation = {
    ...initialLeadInvestigation,
    ...investigationOverrides,
  }

  // Generate ID if not provided
  if (investigation.id === initialLeadInvestigation.id) {
    investigation.id = formatLeadInvestigationId(investigationCount)
  }

  return investigation
}
