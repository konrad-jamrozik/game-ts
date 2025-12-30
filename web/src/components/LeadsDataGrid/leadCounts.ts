import type { Lead, LeadInvestigation } from '../../lib/model/leadModel'
import type { Faction } from '../../lib/model/factionModel'
import { isFactionForLeadTerminated } from '../../lib/model_utils/leadUtils'

export type LeadCounts = {
  active: number
  repeatable: number
  archived: number
}

export function calculateLeadCounts(
  discoveredLeads: Lead[],
  leadInvestigations: Record<string, LeadInvestigation>,
  factions: Faction[],
  leadInvestigationCounts: Record<string, number>,
): LeadCounts {
  let active = 0
  let repeatable = 0
  let archived = 0

  for (const lead of discoveredLeads) {
    const investigationsForLead = Object.values(leadInvestigations).filter(
      (investigation) => investigation.leadId === lead.id,
    )

    const hasDoneInvestigation = investigationsForLead.some((inv) => inv.state === 'Done')
    const isArchived =
      (!lead.repeatable && hasDoneInvestigation) || isFactionForLeadTerminated(lead, factions, leadInvestigationCounts)

    if (isArchived) {
      archived += 1
    } else {
      active += 1
      if (lead.repeatable) {
        repeatable += 1
      }
    }
  }

  return {
    active,
    repeatable,
    archived,
  }
}
