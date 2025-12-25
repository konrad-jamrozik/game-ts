import type { LeadInvestigation } from '../model/leadModel'
import type { LeadId, LeadInvestigationId } from '../model/modelIds'
import { fmtLeadInvestigationId } from '../model_utils/formatUtils'
import { assertDefined } from '../primitives/assertPrimitives'

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

type CreateLeadInvestigationParams =
  | (BaseCreateLeadInvestigationParams & { investigationCount: number; id?: never })
  | (BaseCreateLeadInvestigationParams & { id: LeadInvestigation['id']; investigationCount?: never })

type BaseCreateLeadInvestigationParams = Partial<Omit<LeadInvestigation, 'id' | 'leadId'>> & {
  leadId: LeadId
}

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
    assertDefined(investigationCount, 'Investigation count must be provided if ID is not provided')
    investigation.id = fmtLeadInvestigationId(investigationCount)
  }

  return investigation
}
