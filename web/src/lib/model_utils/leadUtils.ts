import { assertDefined } from '../primitives/assertPrimitives'
import { dataTables } from '../data_tables/dataTables'
import type { Lead } from '../model/leadModel'
import type { LeadId } from '../model/modelIds'
import type { Faction } from '../model/factionModel'
import { isFactionTerminated } from './factionUtils'
import type { Mission } from '../model/missionModel'
import type { GameState } from '../model/gameStateModel'

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

export type LeadStatus = {
  isDiscovered: boolean
  isActive: boolean
  isInactive: boolean
  isArchived: boolean
  hasActiveInvestigation: boolean
  hasDoneInvestigation: boolean
}

/**
 * Returns all discovered leads (leads whose regular dependencies are met).
 * Negated dependencies don't affect discovery.
 */
export function getDiscoveredLeads(gameState: GameState): Lead[] {
  const wonMissionDataIds = new Set<string>(
    gameState.missions.filter((m) => m.state === 'Won').map((m) => m.missionDataId),
  )

  return dataTables.leads.filter((lead): boolean => {
    const parsed = parseNegatedDependencies(lead.dependsOn)
    return parsed.regular.every(
      (dependencyId: string): boolean =>
        (gameState.leadInvestigationCounts[dependencyId] ?? 0) > 0 || wonMissionDataIds.has(dependencyId),
    )
  })
}

/**
 * Computes the status for a single lead.
 */
export function getLeadStatus(lead: Lead, gameState: GameState): LeadStatus {
  const investigationsForLead = Object.values(gameState.leadInvestigations).filter(
    (investigation) => investigation.leadId === lead.id,
  )

  const hasActiveInvestigation = investigationsForLead.some((inv) => inv.state === 'Active')
  const hasDoneInvestigation = investigationsForLead.some((inv) => inv.state === 'Done')

  // Check if lead is discovered (regular dependencies met)
  const wonMissionDataIds = new Set<string>(
    gameState.missions.filter((m) => m.state === 'Won').map((m) => m.missionDataId),
  )
  const parsed = parseNegatedDependencies(lead.dependsOn)
  const isDiscovered = parsed.regular.every(
    (dependencyId: string): boolean =>
      (gameState.leadInvestigationCounts[dependencyId] ?? 0) > 0 || wonMissionDataIds.has(dependencyId),
  )

  // Check negated dependencies
  const negatedStatus = getNegatedDepStatus(parsed.negated, gameState.missions)

  // Determine if lead is archived:
  // - Non-repeatable leads with done investigations are archived
  // - Leads for terminated factions are archived
  // - Negated dependency mission is Won
  const leadFactionTerminated = isFactionForLeadTerminated(lead, gameState.factions, gameState.leadInvestigationCounts)
  const isArchived = (!lead.repeatable && hasDoneInvestigation) || leadFactionTerminated || negatedStatus === 'archived'

  // Determine if lead is inactive:
  // - Negated dependency mission is Active or Deployed (and not archived)
  const isInactive = negatedStatus === 'inactive' && !isArchived

  // Determine if lead is active (discovered, not archived, not inactive)
  const isActive = isDiscovered && !isArchived && !isInactive

  return {
    isDiscovered,
    isActive,
    isInactive,
    isArchived,
    hasActiveInvestigation,
    hasDoneInvestigation,
  }
}

/**
 * Returns leads available for new investigations.
 * A lead is available if it is:
 * - Discovered (regular dependencies met)
 * - Active (not archived, not inactive)
 * - Not already being investigated (no active investigation)
 * - Repeatable or hasn't been investigated yet
 */
export function getAvailableLeadsForInvestigation(gameState: GameState): Lead[] {
  const discoveredLeads = getDiscoveredLeads(gameState)
  const availableLeads: Lead[] = []

  for (const lead of discoveredLeads) {
    const status = getLeadStatus(lead, gameState)

    // Skip if archived or inactive
    if (status.isArchived || status.isInactive) {
      continue
    }

    // Skip if already has an active investigation
    if (status.hasActiveInvestigation) {
      continue
    }

    // Check if lead is repeatable or hasn't been investigated yet
    const investigationCount = gameState.leadInvestigationCounts[lead.id] ?? 0
    if (lead.repeatable || investigationCount === 0) {
      availableLeads.push(lead)
    }
  }

  return availableLeads
}
