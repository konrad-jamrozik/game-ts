import { assertDefined } from '../primitives/assertPrimitives'
import { dataTables } from '../data_tables/dataTables'
import type { Lead } from '../model/leadModel'
import type { LeadId } from '../model/modelIds'
import type { Faction } from '../model/factionModel'
import { isFactionTerminated } from './factionUtils'

export function getLeadById(id: LeadId): Lead {
  const found = dataTables.leads.find((lead) => lead.id === id)
  assertDefined(found, `Lead with id ${id} not found`)
  return found
}

/**
 * Checks if the faction associated with a lead has been terminated.
 * Extracts the faction ID from the lead ID and checks termination status.
 * @param lead - The lead to check
 * @param factions - Array of all factions
 * @param leadInvestigationCounts - Record of lead investigation counts
 * @returns true if the lead's faction has been terminated
 */
export function isFactionForLeadTerminated(
  lead: Lead,
  factions: Faction[],
  leadInvestigationCounts: Record<string, number>,
): boolean {
  // Extract faction ID from lead ID (pattern: lead-{facId}-...)
  // For example: 'lead-red-dawn-profile' -> 'red-dawn'
  const leadIdMatch = /^lead-(?<facId>.+)-/u.exec(lead.id)
  if (leadIdMatch === null) {
    return false
  }
  const facId = leadIdMatch[1]

  // Find faction by matching factionDataId (e.g., 'factiondata-red-dawn' matches 'red-dawn')
  const faction = factions.find((f) => f.factionDataId === `factiondata-${facId}`)
  if (faction === undefined) {
    return false
  }

  return isFactionTerminated(faction, leadInvestigationCounts)
}
