import type { PlayTurnAPI } from '../../../lib/model_utils/playTurnApiTypes'
import type { GameState } from '../../../lib/model/gameStateModel'
import type { Lead } from '../../../lib/model/leadModel'
import type { Mission } from '../../../lib/model/missionModel'
import type { AgentId } from '../../../lib/model/modelIds'
import { notTerminated } from '../../../lib/model_utils/agentUtils'
import { dataTables } from '../../../lib/data_tables/dataTables'
import { selectNextBestReadyAgent } from './agentSelection'
import { pickAtRandom, unassignAgentsFromTraining } from './utils'

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

  for (let i = 0; i < agentsToAssign; i += 1) {
    const lead = selectLeadToInvestigate(availableLeads)
    if (lead === undefined) {
      break
    }

    const agent = selectNextBestReadyAgent(gameState, selectedAgentIds, selectedAgentIds.length, {
      includeInTraining: true,
    })
    if (agent === undefined) {
      break
    }

    selectedAgentIds.push(agent.id)

    // Unassign agent from training if needed
    unassignAgentsFromTraining(api, [agent.id])

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

function selectLeadToInvestigate(availableLeads: Lead[]): Lead | undefined {
  if (availableLeads.length === 0) {
    return undefined
  }

  // Prioritize non-repeatable leads over repeatable leads
  const nonRepeatableLeads = availableLeads.filter((lead) => !lead.repeatable)
  if (nonRepeatableLeads.length > 0) {
    return pickAtRandom(nonRepeatableLeads)
  }

  // If no non-repeatable leads, pick from repeatable leads
  return pickAtRandom(availableLeads)
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
