import type { GameState, LeadInvestigation, LeadInvestigationId } from '../../model/model'
import { asPlayerAction } from './asPlayerAction'

export const createLeadInvestigation = asPlayerAction<{ leadId: string; agentIds: string[] }>(
  (state: GameState, action) => {
    const { leadId, agentIds } = action.payload

    // Generate unique investigation ID
    const nextInvestigationNumericId = Object.keys(state.leadInvestigations).length
    const investigationId: LeadInvestigationId = `investigation-${nextInvestigationNumericId.toString().padStart(3, '0')}`

    // Create new investigation
    const newInvestigation: LeadInvestigation = {
      id: investigationId,
      leadId,
      accumulatedIntel: 0,
      agentIds,
      startTurn: state.turn,
      state: 'Active',
    }

    state.leadInvestigations[investigationId] = newInvestigation

    // Assign agents to investigation (they enter InTransit state)
    for (const agent of state.agents) {
      if (agentIds.includes(agent.id)) {
        agent.assignment = investigationId
        agent.state = 'InTransit'
      }
    }
  },
)

export const addAgentsToInvestigation = asPlayerAction<{ investigationId: LeadInvestigationId; agentIds: string[] }>(
  (state: GameState, action) => {
    const { investigationId, agentIds } = action.payload

    const investigation = state.leadInvestigations[investigationId]
    if (investigation === undefined) {
      throw new Error(`Investigation not found: ${investigationId}`)
    }

    // Add agents to investigation (throw error on duplicates)
    for (const agentId of agentIds) {
      if (investigation.agentIds.includes(agentId)) {
        // KJA use assert
        throw new Error(`Agent ${agentId} is already assigned to investigation ${investigationId}`)
      }
      investigation.agentIds.push(agentId)
    }

    // Assign agents to investigation (they enter InTransit state)
    for (const agent of state.agents) {
      if (agentIds.includes(agent.id)) {
        agent.assignment = investigationId
        agent.state = 'InTransit'
      }
    }
  },
)

// KJA where is this used?
export const recallAgentsFromInvestigation = asPlayerAction<string[]>((state: GameState, action) => {
  const agentIdsToRecall = action.payload

  // Find investigations that have these agents
  const investigationsToUpdate: string[] = []
  for (const [investigationId, investigation] of Object.entries(state.leadInvestigations)) {
    const hasAgentsToRecall = investigation.agentIds.some((agentId) => agentIdsToRecall.includes(agentId))
    if (hasAgentsToRecall) {
      investigationsToUpdate.push(investigationId)
    }
  }

  // Update agents and remove them from investigations
  for (const agent of state.agents) {
    if (agentIdsToRecall.includes(agent.id)) {
      agent.assignment = 'Standby'
      agent.state = 'InTransit'
    }
  }

  // Remove agents from investigations and mark as Abandoned if all agents recalled
  for (const investigationId of investigationsToUpdate) {
    const investigation = state.leadInvestigations[investigationId]
    if (investigation !== undefined) {
      // Remove recalled agents from investigation
      investigation.agentIds = investigation.agentIds.filter((agentId) => !agentIdsToRecall.includes(agentId))

      // If all agents are recalled, mark investigation as Abandoned
      if (investigation.agentIds.length === 0) {
        investigation.state = 'Abandoned'
      }
    }
  }
})
