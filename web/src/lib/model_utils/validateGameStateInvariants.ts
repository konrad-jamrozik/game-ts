import type { GameState } from '../model/gameStateModel'
import { validateAgentInvariants } from './validateAgentInvariants'
import { isFactionTerminated } from './factionUtils'
import { getLeadStatus } from './leadUtils'
import { dataTables } from '../data_tables/dataTables'
import { assertTrue } from '../primitives/assertPrimitives'

/**
 * Validates the entire game state invariants.
 * Throws an Error if any invariant is violated.
 *
 * Note: terminatedAgents are NOT validated here because they are immutable
 * after termination. They are validated once at the point of termination
 * (in sackAgents reducer and moveKilledAgentsToTerminated).
 */
export function validateGameStateInvariants(state: GameState): void {
  // Validate all alive agents
  for (const agent of state.agents) {
    validateAgentInvariants(agent, state)
    // Agents in 'agents' array must not be terminated
    assertTrue(
      agent.state !== 'KIA' && agent.state !== 'Sacked',
      `Agent ${agent.id} in agents array has terminated state: ${agent.state}`,
    )
  }

  // Validate terminated faction leads
  validateTerminatedFactionLeads(state)
}

function validateTerminatedFactionLeads(state: GameState): void {
  for (const faction of state.factions) {
    if (!isFactionTerminated(faction, state.leadInvestigationCounts)) {
      continue
    }

    // Get faction ID for lead matching
    const facId = faction.factionDataId.replace('factiondata-', '')
    const factionLeads = dataTables.leads.filter((lead) => lead.id.startsWith(`lead-${facId}-`))

    for (const lead of factionLeads) {
      const status = getLeadStatus(lead, state)

      // If discovered, must be archived
      if (status.isDiscovered) {
        assertTrue(
          status.isArchived,
          `Lead ${lead.id} for terminated faction ${faction.id} is discovered but not archived`,
        )
        assertTrue(!status.isActive, `Lead ${lead.id} for terminated faction ${faction.id} should not be active`)
        assertTrue(!status.isInactive, `Lead ${lead.id} for terminated faction ${faction.id} should not be inactive`)
      }

      // No active investigations for this lead
      assertTrue(
        !status.hasActiveInvestigation,
        `Lead ${lead.id} for terminated faction ${faction.id} has an active investigation`,
      )
    }
  }
}
