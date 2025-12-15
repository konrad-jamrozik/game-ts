import type { Lead, LeadId } from '../model/leadModel'
import { assertDefined } from '../primitives/assertPrimitives'
import { expandTemplateString } from './factions'
import { FACTION_DATA, type FactionStats } from './factionStatsTables'
import { LEADS_DATA, type LeadStats } from './leadStatsTables'

export const leads: Lead[] = toLeads(LEADS_DATA)

export function getLeadById(leadId: LeadId): Lead {
  const foundLead = leads.find((lead) => lead.id === leadId)
  assertDefined(foundLead, `Lead with id ${leadId} not found`)
  return foundLead
}

function toLeads(stats: LeadStats[]): Lead[] {
  const result: Lead[] = []

  for (const stat of stats) {
    if (stat.id.includes('{facId}')) {
      // Faction-specific lead: generate for each faction
      for (const faction of FACTION_DATA) {
        result.push(bldLead(stat, faction))
      }
    } else {
      // Static lead: generate once (expandTemplateString will be no-op)
      result.push(bldLead(stat))
    }
  }

  return result
}

function bldLead(stat: LeadStats, faction?: FactionStats): Lead {
  return {
    id: expandTemplateString(stat.id, faction) as LeadId,
    name: expandTemplateString(stat.name, faction),
    description: expandTemplateString(stat.description, faction),
    difficulty: stat.difficulty,
    dependsOn: stat.dependsOn.map((dep) => expandTemplateString(dep, faction)),
    repeatable: stat.repeatable,
    ...(stat.enemyEstimate !== undefined && { enemyEstimate: expandTemplateString(stat.enemyEstimate, faction) }),
  }
}
