import type { PlayTurnAPI } from '../../../lib/model_utils/playTurnApiTypes'
import type { GameState } from '../../../lib/model/gameStateModel'
import type { Lead } from '../../../lib/model/leadModel'
import type { Mission } from '../../../lib/model/missionModel'
import type { AgentId, LeadId } from '../../../lib/model/modelIds'
import { notTerminated } from '../../../lib/model_utils/agentUtils'
import { dataTables } from '../../../lib/data_tables/dataTables'
import { selectNextBestReadyAgent } from './agentSelection'
import { pickAtRandom, unassignAgentsFromTraining } from './utils'
import { calculateMissionThreatAssessment } from '../../../lib/game_utils/missionThreatAssessment'
import { bldMission } from '../../../lib/factories/missionFactory'
import { canDeployMissionWithCurrentResources } from './missionDeployment'

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
 *         * Sort by mission threat level (descending - hardest missions first)
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
export function assignToLeadInvestigation(api: PlayTurnAPI): void {
  const { gameState } = api
  const availableLeads = getAvailableLeads(gameState)
  if (availableLeads.length === 0) {
    return
  }

  const targetAgentCount = computeTargetAgentCountForInvestigation(gameState)
  const currentAgentCount = countAgentsInvestigatingLeads(gameState)
  const agentsToAssign = targetAgentCount - currentAgentCount

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

    // If we already selected a repeatable lead, pile agents on it
    if (repeatableLeadSelected !== undefined) {
      const { gameState: currentGameState } = api
      const { leadInvestigations: currentLeadInvestigations } = currentGameState
      const selectedLeadId = repeatableLeadSelected.id
      const existingInvestigation = Object.values(currentLeadInvestigations).find(
        (inv) => inv.leadId === selectedLeadId && inv.state === 'Active',
      )

      if (existingInvestigation !== undefined) {
        const agent = selectNextBestReadyAgent(gameState, selectedAgentIds, selectedAgentIds.length, {
          includeInTraining: true,
        })
        if (agent === undefined) {
          break
        }

        selectedAgentIds.push(agent.id)
        unassignAgentsFromTraining(api, [agent])
        api.addAgentsToInvestigation({
          investigationId: existingInvestigation.id,
          agentIds: [agent.id],
        })
      } else {
        // Investigation was completed or abandoned, break
        break
      }
    } else {
      // Select a new lead to investigate
      const lead = selectLeadToInvestigate(availableLeads, gameState)
      if (lead === undefined) {
        break
      }

      // Track if we selected a repeatable lead
      if (lead.repeatable) {
        repeatableLeadSelected = lead
      }

      const agent = selectNextBestReadyAgent(gameState, selectedAgentIds, selectedAgentIds.length, {
        includeInTraining: true,
      })
      if (agent === undefined) {
        break
      }

      selectedAgentIds.push(agent.id)

      // Unassign agent from training if needed
      unassignAgentsFromTraining(api, [agent])

      // Check if there's an existing investigation for this lead
      // Re-read gameState to get the latest state after previous API calls
      const { gameState: currentGameState } = api
      const { leadInvestigations: currentLeadInvestigations } = currentGameState
      const existingInvestigation = Object.values(currentLeadInvestigations).find(
        (inv) => inv.leadId === lead.id && inv.state === 'Active',
      )

      if (existingInvestigation) {
        api.addAgentsToInvestigation({
          investigationId: existingInvestigation.id,
          agentIds: [agent.id],
        })
      } else {
        api.startLeadInvestigation({
          leadId: lead.id,
          agentIds: [agent.id],
        })
        // Remove the lead from availableLeads since it now has an active investigation
        const leadIndex = availableLeads.findIndex((l) => l.id === lead.id)
        if (leadIndex !== -1) {
          availableLeads.splice(leadIndex, 1)
        }
      }
    }
  }

  console.log(`assignToLeadInvestigation: desired ${agentsToAssign} agents, assigned ${selectedAgentIds.length}`)
}

function getAvailableLeads(gameState: GameState): Lead[] {
  const allLeads = dataTables.leads
  const availableLeads: Lead[] = []

  for (const lead of allLeads) {
    // Never investigate the deep state lead
    // It exists primarily for debugging purposes. Scheduled to be removed later.
    if (lead.id === 'lead-deep-state') {
      continue
    }

    // Check if lead dependencies are met
    const dependenciesMet = lead.dependsOn.every((depId) => {
      // Check if it's a mission dependency (completed missions)
      if (depId.startsWith('missiondata-')) {
        // Check if there's a mission with this missionDataId that has been won
        const missionWon = gameState.missions.some(
          (mission: Mission) => mission.missionDataId === depId && mission.state === 'Won',
        )
        return missionWon
      }
      // Check if it's a lead dependency (investigation count > 0)
      const investigationCount = gameState.leadInvestigationCounts[depId] ?? 0
      return investigationCount > 0
    })

    if (dependenciesMet) {
      // Check if lead is repeatable or hasn't been investigated yet
      const investigationCount = gameState.leadInvestigationCounts[lead.id] ?? 0
      if (lead.repeatable || investigationCount === 0) {
        // Check if there's an active investigation
        const hasActiveInvestigation = Object.values(gameState.leadInvestigations).some(
          (inv) => inv.leadId === lead.id && inv.state === 'Active',
        )
        // Include if no active investigation (can start new one)
        if (!hasActiveInvestigation) {
          availableLeads.push(lead)
        }
      }
    }
  }

  return availableLeads
}

function selectLeadToInvestigate(availableLeads: Lead[], gameState: GameState): Lead | undefined {
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

  // Get leads with their mission threats and sort by threat descending
  const leadsWithThreat = repeatableLeads.map((lead) => ({
    lead,
    threat: getMissionThreatForLead(lead.id),
  }))

  const sortedLeads = leadsWithThreat.toSorted((a, b) => b.threat - a.threat)

  // Collect all deployable leads with their threat levels
  const deployableLeads: { lead: Lead; threat: number }[] = []

  for (const { lead, threat } of sortedLeads) {
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
      })

      const feasibility = canDeployMissionWithCurrentResources(gameState, tempMission)
      if (feasibility.canDeploy) {
        // This lead would result in a deployable mission - add it to the list
        deployableLeads.push({ lead, threat })
        // Only need to find one deployable mission per lead
        break
      }
    }
  }

  if (deployableLeads.length === 0) {
    // No leads would result in deployable missions
    return undefined
  }

  // Find max threat among deployable leads
  const maxThreat = Math.max(...deployableLeads.map((d) => d.threat))
  const topThreatLeads = deployableLeads.filter((d) => d.threat === maxThreat).map((d) => d.lead)

  if (topThreatLeads.length === 1) {
    return topThreatLeads[0]
  }

  // Multiple leads with same threat - pick one with least investigations
  const leadsWithCounts = topThreatLeads.map((lead) => ({
    lead,
    investigationCount: gameState.leadInvestigationCounts[lead.id] ?? 0,
  }))

  const minCount = Math.min(...leadsWithCounts.map((l) => l.investigationCount))
  const leastInvestigatedLeads = leadsWithCounts.filter((l) => l.investigationCount === minCount).map((l) => l.lead)

  return pickAtRandom(leastInvestigatedLeads)
}

function computeTargetAgentCountForInvestigation(gameState: GameState): number {
  const totalAgentCount = notTerminated(gameState.agents).length
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
 * Gets the maximum threat level of missions that would be created from investigating a lead.
 * Returns 0 if no missions depend on the lead.
 */
function getMissionThreatForLead(leadId: LeadId): number {
  const dependentMissionData = dataTables.offensiveMissions.filter((missionData) =>
    missionData.dependsOn.includes(leadId),
  )

  if (dependentMissionData.length === 0) {
    return 0
  }

  // Calculate threat for each mission and return the maximum
  let maxThreat = 0
  for (const missionData of dependentMissionData) {
    // Create a temporary mission to calculate threat
    const tempMission = bldMission({
      id: 'mission-simulated-for-threat-assessment',
      missionDataId: missionData.id,
    })
    const threat = calculateMissionThreatAssessment(tempMission)
    if (threat > maxThreat) {
      maxThreat = threat
    }
  }

  return maxThreat
}
