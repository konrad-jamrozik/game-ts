import { assertDefined } from '../primitives/assertPrimitives'
import { dataTables } from '../data_tables/dataTables'
import type { Lead } from '../model/leadModel'
import type { LeadId } from '../model/modelIds'
import type { Faction } from '../model/factionModel'
import { isFactionTerminated } from './factionUtils'
import type { Mission } from '../model/missionModel'

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

export type NegatedDepStatus = 'active' | 'inactive' | 'archived'

export type ParsedDependencies = {
  regular: string[]
  negated: string[]
}

/**
 * Parses dependencies into regular and negated dependencies.
 * Negated dependencies start with '!' prefix.
 */
export function parseNegatedDependencies(dependsOn: string[]): ParsedDependencies {
  const regular: string[] = []
  const negated: string[] = []

  for (const dep of dependsOn) {
    if (dep.startsWith('!')) {
      negated.push(dep.slice(1))
    } else {
      regular.push(dep)
    }
  }

  return { regular, negated }
}

/**
 * Determines the status of a lead based on negated dependencies.
 * Checks mission states for each negated dependency:
 * - Won = archived
 * - Active/Deployed = inactive
 * - Otherwise (no mission, Retreated, Wiped, Expired) = active
 */
export function getNegatedDepStatus(negatedDeps: string[], missions: Mission[]): NegatedDepStatus {
  if (negatedDeps.length === 0) {
    return 'active'
  }

  // Check each negated dependency against missions
  for (const negatedDep of negatedDeps) {
    const matchingMissions = missions.filter((m) => m.missionDataId === negatedDep)

    if (matchingMissions.length === 0) {
      // No matching mission exists, so dependency is satisfied (lead can be active)
      continue
    }

    // Check if any matching mission is Won (archived)
    if (matchingMissions.some((m) => m.state === 'Won')) {
      return 'archived'
    }

    // Check if any matching mission is Active or Deployed (inactive)
    if (matchingMissions.some((m) => m.state === 'Active' || m.state === 'Deployed')) {
      return 'inactive'
    }

    // Mission exists but is in terminal non-success state (Retreated, Wiped, Expired)
    // Lead can be active
  }

  return 'active'
}
