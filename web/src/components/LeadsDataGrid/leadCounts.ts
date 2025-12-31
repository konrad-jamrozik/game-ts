import type { Lead, LeadInvestigation } from '../../lib/model/leadModel'
import type { Faction } from '../../lib/model/factionModel'
import {
  isFactionForLeadTerminated,
  parseNegatedDependencies,
  getNegatedDepStatus,
} from '../../lib/model_utils/leadUtils'
import type { Mission } from '../../lib/model/missionModel'

export type LeadCounts = {
  active: number
  inactive: number
  repeatable: number
  archived: number
}

export function calculateLeadCounts(
  discoveredLeads: Lead[],
  leadInvestigations: Record<string, LeadInvestigation>,
  factions: Faction[],
  leadInvestigationCounts: Record<string, number>,
  missions: Mission[],
): LeadCounts {
  let active = 0
  let inactive = 0
  let repeatable = 0
  let archived = 0

  for (const lead of discoveredLeads) {
    const investigationsForLead = Object.values(leadInvestigations).filter(
      (investigation) => investigation.leadId === lead.id,
    )

    const hasDoneInvestigation = investigationsForLead.some((inv) => inv.state === 'Done')
    const isFactionTerminated = isFactionForLeadTerminated(lead, factions, leadInvestigationCounts)

    // Check negated dependencies
    const { negated } = parseNegatedDependencies(lead.dependsOn)
    const negatedStatus = getNegatedDepStatus(negated, missions)

    // Determine if lead is archived:
    // - Non-repeatable leads with done investigations are archived
    // - Leads for terminated factions are archived
    // - Negated dependency mission is Won
    const isArchived = (!lead.repeatable && hasDoneInvestigation) || isFactionTerminated || negatedStatus === 'archived'

    // Determine if lead is inactive:
    // - Negated dependency mission is Active or Deployed
    const isInactive = negatedStatus === 'inactive' && !isArchived

    if (isArchived) {
      archived += 1
    } else if (isInactive) {
      inactive += 1
    } else {
      active += 1
      if (lead.repeatable) {
        repeatable += 1
      }
    }
  }

  return {
    active,
    inactive,
    repeatable,
    archived,
  }
}
