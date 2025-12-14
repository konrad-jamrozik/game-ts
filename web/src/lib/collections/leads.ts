import type { Lead } from '../model/leadModel'
import { assertDefined } from '../primitives/assertPrimitives'
import { factionTemplates, expandTemplateString } from './factions'
import { LEADS_DATA, type LeadStats } from './leadStatsTables'

function toLeads(stats: LeadStats[]): Lead[] {
  // Separate static leads (no {facId} template) from faction-specific leads
  const staticLeads: Lead[] = []
  const factionSpecificStats: LeadStats[] = []

  for (const stat of stats) {
    if (stat.id.includes('{facId}')) {
      factionSpecificStats.push(stat)
    } else {
      staticLeads.push({
        id: stat.id,
        name: stat.name,
        description: stat.description,
        difficulty: stat.difficulty,
        dependsOn: stat.dependsOn,
        repeatable: stat.repeatable,
        ...(stat.enemyEstimate !== undefined && { enemyEstimate: stat.enemyEstimate }),
      })
    }
  }

  // Generate faction-specific leads
  const factionSpecificLeads: Lead[] = factionTemplates.flatMap((faction) =>
    factionSpecificStats.map((stat) => ({
      id: expandTemplateString(stat.id, faction),
      name: expandTemplateString(stat.name, faction),
      description: expandTemplateString(stat.description, faction),
      difficulty: stat.difficulty,
      dependsOn: stat.dependsOn.map((dep) => expandTemplateString(dep, faction)),
      repeatable: stat.repeatable,
      ...(stat.enemyEstimate !== undefined && {
        enemyEstimate: expandTemplateString(stat.enemyEstimate, faction),
      }),
    })),
  )

  return [...staticLeads, ...factionSpecificLeads]
}

export const leads: Lead[] = toLeads(LEADS_DATA)

export function getLeadById(leadId: string): Lead {
  const foundLead = leads.find((lead) => lead.id === leadId)
  assertDefined(foundLead, `Lead with id ${leadId} not found`)
  return foundLead
}
