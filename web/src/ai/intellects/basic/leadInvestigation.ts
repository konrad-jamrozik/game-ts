import type { PlayTurnAPI } from '../../../lib/model_utils/playTurnApiTypes'
import type { GameState } from '../../../lib/model/gameStateModel'
import type { Lead, LeadInvestigation } from '../../../lib/model/leadModel'
import type { AgentId, FactionId, LeadId } from '../../../lib/model/modelIds'
import { dataTables } from '../../../lib/data_tables/dataTables'
import { removeAgentsById, selectNextBestReadyAgents, type AgentWithStats } from './agentSelection'
import { pickAtRandom, unassignAgentsFromTraining } from './utils'
import { bldMission } from '../../../lib/factories/missionFactory'
import { canDeployMissionWithCurrentResources } from './missionDeployment'
import { getAvailableLeadsForInvestigation } from '../../../lib/model_utils/leadUtils'
import { NON_REPEATABLE_LEAD_DIFFICULTY_DIVISOR, TARGET_COMBAT_RATING_MULTIPLIER } from './constants'
import { log } from '../../../lib/primitives/logger'

// KJA3_1 generate full spec of all such behaviors in manageAgents and spendMoney.
/**
 * Assigns agents to lead investigations using a smart selection algorithm.
 *
 * Algorithm:
 * 1. Calculates target agent count based on total agent count (1 + floor(totalAgents / 10))
 * 2. Determines how many additional agents need to be assigned
 * 3. For each agent to assign:
 *    a. If a repeatable lead was already selected (in this turn or from a previous turn):
 *       - Pile all remaining agents onto that same investigation
 *       - Stop if the investigation is completed or abandoned
 *    b. Otherwise, select a new lead:
 *       - Prioritize non-repeatable leads (pick randomly if multiple available)
 *       - For repeatable leads only:
 *         * Sort by mission combat rating (descending - hardest missions first)
 *         * For each lead, check if the resulting mission could be deployed successfully
 *           with current resources (agents, threat, transport capacity)
 *         * Collect all deployable leads
 *         * Among deployable leads, select those with the maximum threat level
 *         * Among those, select the lead(s) with the fewest successful investigations
 *         * If multiple leads still tie, pick at random
 *         * If no leads would result in deployable missions, skip investigation entirely
 *    c. Assign the agent to the selected lead's investigation
 *    d. If the lead is repeatable, mark it for agent piling in subsequent iterations
 *
 * This ensures that:
 * - Non-repeatable leads are always prioritized
 * - Repeatable leads are only investigated if they would produce deployable missions
 * - All agents allocated to lead investigation are concentrated on a single repeatable lead
 *   when one is selected, maximizing investigation efficiency
 */
export function assignToLeadInvestigation(api: PlayTurnAPI, agents: AgentWithStats[]): AgentWithStats[] {
  const { gameState } = api
  const availableLeads = getAvailableLeads(gameState)
  if (availableLeads.length === 0) {
    return agents
  }

  const targetAgentCount = computeTargetAgentCountForInvestigation(gameState)
  const currentAgentCount = countAgentsInvestigatingLeads(gameState)
  const agentsToAssign = targetAgentCount - currentAgentCount

  const selectedAgents: AgentWithStats[] = []
  const selectedAgentIds: AgentId[] = []
  let repeatableLeadSelected: Lead | undefined = undefined

  for (let i = 0; i < agentsToAssign; i += 1) {
    // Check if there's an existing active investigation for a repeatable lead to pile onto
    // This ensures we continue piling agents on existing repeatable investigations across turns
    if (repeatableLeadSelected === undefined) {
      const { gameState: currentGameState } = api
      const existingRepeatableInvestigation = Object.values(currentGameState.leadInvestigations).find((inv) => {
        if (inv.state !== 'Active') return false
        const lead = dataTables.leads.find((l) => l.id === inv.leadId)
        return lead?.repeatable === true
      })

      if (existingRepeatableInvestigation) {
        const lead = dataTables.leads.find((l) => l.id === existingRepeatableInvestigation.leadId)
        if (lead) {
          repeatableLeadSelected = lead
        }
      }
    }

    // If we already selected a repeatable lead, batch-pile all remaining agents on it
    if (repeatableLeadSelected !== undefined) {
      const existingInvestigation = findActiveInvestigation(api.gameState, repeatableLeadSelected.id)
      if (existingInvestigation === undefined) {
        // Investigation was completed or abandoned, break
        break
      }

      // Batch-select all remaining agents
      const remainingToAssign = agentsToAssign - i
      const agentsToAdd = selectNextBestReadyAgents(
        agents,
        remainingToAssign,
        selectedAgentIds,
        selectedAgentIds.length,
        gameState.agents.length,
        {
          includeInTraining: true,
        },
      )
      selectedAgents.push(...agentsToAdd)
      selectedAgentIds.push(...agentsToAdd.map((agent) => agent.id))

      if (agentsToAdd.length > 0) {
        // Single batch operations
        unassignAgentsFromTraining(api, agentsToAdd)
        api.addAgentsToInvestigation({
          investigationId: existingInvestigation.id,
          agentIds: agentsToAdd.map((agent) => agent.id),
        })
      }
      // Exit main loop - all agents assigned
      break
    } else {
      const remainingAgents = removeAgentsById(agents, selectedAgentIds)
      // Select a new lead to investigate
      const lead = selectLeadToInvestigate(availableLeads, gameState, remainingAgents)
      if (lead === undefined) {
        break
      }

      // Track if we selected a repeatable lead
      if (lead.repeatable) {
        repeatableLeadSelected = lead
      }

      // For non-repeatable leads, aim to have at least ceil(difficulty / divisor) agents
      // For repeatable leads, just assign 1 agent (piling happens in next iterations)
      const { gameState: currentGameState } = api
      const existingInvestigation = findActiveInvestigation(currentGameState, lead.id)
      const currentAgentsOnLead = existingInvestigation?.agentIds.length ?? 0
      const minAgentsForNonRepeatable = Math.ceil(lead.difficulty / NON_REPEATABLE_LEAD_DIFFICULTY_DIVISOR)
      const agentsNeededForLead = lead.repeatable ? 1 : Math.max(1, minAgentsForNonRepeatable - currentAgentsOnLead)

      const selectedForLead = selectNextBestReadyAgents(
        agents,
        agentsNeededForLead,
        selectedAgentIds,
        selectedAgentIds.length,
        gameState.agents.length,
        {
          includeInTraining: true,
        },
      )
      if (selectedForLead.length === 0) {
        break
      }

      selectedAgents.push(...selectedForLead)
      selectedAgentIds.push(...selectedForLead.map((agent) => agent.id))

      // Unassign agents from training if needed
      unassignAgentsFromTraining(api, selectedForLead)

      if (existingInvestigation) {
        api.addAgentsToInvestigation({
          investigationId: existingInvestigation.id,
          agentIds: selectedForLead.map((agent) => agent.id),
        })
      } else {
        api.startLeadInvestigation({
          leadId: lead.id,
          agentIds: selectedForLead.map((agent) => agent.id),
        })
        // Remove the lead from availableLeads since it now has an active investigation
        const leadIndex = availableLeads.findIndex((l) => l.id === lead.id)
        if (leadIndex !== -1) {
          availableLeads.splice(leadIndex, 1)
        }
      }

      // For non-repeatable leads, adjust loop counter to account for batch assignment
      if (!lead.repeatable && selectedForLead.length > 1) {
        i += selectedForLead.length - 1
      }
    }
  }

  log.info('lead-investigation', `desired ${agentsToAssign} agents, assigned ${selectedAgentIds.length}`)

  return removeAgentsById(agents, selectedAgentIds)
}

function findActiveInvestigation(gameState: GameState, leadId: LeadId): LeadInvestigation | undefined {
  return Object.values(gameState.leadInvestigations).find((inv) => inv.leadId === leadId && inv.state === 'Active')
}

function getAvailableLeads(gameState: GameState): Lead[] {
  // Get all available leads using shared logic
  const availableLeads = getAvailableLeadsForInvestigation(gameState)

  // Filter out the deep state lead (AI-specific exclusion)
  // It exists primarily for debugging purposes. Scheduled to be removed later.
  return availableLeads.filter((lead) => lead.id !== 'lead-deep-state')
}

/**
 * Returns faction priority order based on turn and offset.
 * Stub implementation for TDD - throws error until implemented.
 */
export function getFactionPriorityOrder(_turn: number, _offset: number): FactionId[] {
  throw new Error('getFactionPriorityOrder not yet implemented')
}

export function selectLeadToInvestigate(
  availableLeads: Lead[],
  gameState: GameState,
  agents: AgentWithStats[],
): Lead | undefined {
  if (availableLeads.length === 0) {
    return undefined
  }

  // Prioritize non-repeatable leads over repeatable leads
  const nonRepeatableLeads = availableLeads.filter((lead) => !lead.repeatable)
  if (nonRepeatableLeads.length > 0) {
    return pickAtRandom(nonRepeatableLeads)
  }

  // If no non-repeatable leads, use smart selection for repeatable leads
  const repeatableLeads = availableLeads.filter((lead) => lead.repeatable)

  // Get leads with their mission combat ratings and sort by combat rating descending
  const leadsWithCombatRating = repeatableLeads.map((lead) => ({
    lead,
    combatRating: getMissionCombatRatingForLead(lead.id),
  }))

  const sortedLeads = leadsWithCombatRating.toSorted((a, b) => b.combatRating - a.combatRating)

  // Collect all deployable leads with their combat ratings
  const deployableLeads: { lead: Lead; combatRating: number }[] = []

  for (const { lead, combatRating } of sortedLeads) {
    // Get the mission data that depends on this lead
    const dependentMissionData = dataTables.offensiveMissions.filter((missionData) =>
      missionData.dependsOn.includes(lead.id),
    )

    // Check each mission that would be created from this lead
    for (const missionData of dependentMissionData) {
      // Create a temporary mission to check deployability
      const tempMission = bldMission({
        id: 'mission-simulated-for-deployment-assessment',
        missionDataId: missionData.id,
        turnDiscovered: gameState.turn,
      })

      const missionCombatRating = tempMission.combatRating
      const targetCombatRating = missionCombatRating * TARGET_COMBAT_RATING_MULTIPLIER

      const feasibility = canDeployMissionWithCurrentResources(gameState, tempMission, agents)
      if (feasibility.canDeploy) {
        // Calculate agent combat rating from selected agents
        let agentCombatRating = 0
        for (const agent of feasibility.selectedAgents) {
          agentCombatRating += agent.combatRating
        }

        log.info(
          'lead-investigation',
          `Lead "${lead.id}" is deployable. ` +
            `Mission combat rating: ${missionCombatRating.toFixed(2)}, ` +
            `Agent combat rating: ${agentCombatRating.toFixed(2)}, ` +
            `Min. target combat rating: ${targetCombatRating.toFixed(2)}`,
        )

        // This lead would result in a deployable mission - add it to the list
        deployableLeads.push({ lead, combatRating })
        // Only need to find one deployable mission per lead
        break
      } else if (feasibility.reason === 'insufficientCombatRating') {
        log.info(
          'lead-investigation',
          `Passed on lead "${lead.id}" due to insufficient combat rating. ` +
            `Infeasibility reason: ${feasibility.reason}` +
            `Infeasibility details: ${feasibility.details}`,
        )
      }
    }
  }

  if (deployableLeads.length === 0) {
    // No leads would result in deployable missions
    return undefined
  }

  // Find max combat rating among deployable leads
  const maxCombatRating = Math.max(...deployableLeads.map((d) => d.combatRating))
  const topCombatRatingLeads = deployableLeads.filter((d) => d.combatRating === maxCombatRating).map((d) => d.lead)

  if (topCombatRatingLeads.length === 1) {
    return topCombatRatingLeads[0]
  }

  // Multiple leads with same combat rating - pick one with least investigations
  const leadsWithCounts = topCombatRatingLeads.map((lead) => ({
    lead,
    investigationCount: gameState.leadInvestigationCounts[lead.id] ?? 0,
  }))

  const minCount = Math.min(...leadsWithCounts.map((l) => l.investigationCount))
  const leastInvestigatedLeads = leadsWithCounts.filter((l) => l.investigationCount === minCount).map((l) => l.lead)

  return pickAtRandom(leastInvestigatedLeads)
}

function computeTargetAgentCountForInvestigation(gameState: GameState): number {
  const totalAgentCount = gameState.agents.length
  // At least 1 agent, plus 1 extra for each 10 agents
  return 1 + Math.floor(totalAgentCount / 10)
}

function countAgentsInvestigatingLeads(gameState: GameState): number {
  const activeInvestigations = Object.values(gameState.leadInvestigations).filter((inv) => inv.state === 'Active')
  const agentIds = new Set<string>()
  for (const inv of activeInvestigations) {
    for (const agentId of inv.agentIds) {
      agentIds.add(agentId)
    }
  }
  return agentIds.size
}

/**
 * Gets the maximum combat rating of missions that would be created from investigating a lead.
 * Returns 0 if no missions depend on the lead.
 */
function getMissionCombatRatingForLead(leadId: LeadId): number {
  const dependentMissionData = dataTables.offensiveMissions.filter((missionData) =>
    missionData.dependsOn.includes(leadId),
  )

  if (dependentMissionData.length === 0) {
    return 0
  }

  // Calculate combat rating for each mission and return the maximum
  let maxCombatRating = 0
  for (const missionData of dependentMissionData) {
    // Create a temporary mission to get combat rating (calculated in bldMission)
    const tempMission = bldMission({
      id: 'mission-simulated-for-combat-rating-assessment',
      missionDataId: missionData.id,
      turnDiscovered: 0, // Temporary mission, not part of game state
    })
    const combatRating = tempMission.combatRating
    if (combatRating > maxCombatRating) {
      maxCombatRating = combatRating
    }
  }

  return maxCombatRating
}
