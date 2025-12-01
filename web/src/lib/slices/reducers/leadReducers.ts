import type { GameState } from '../../model/gameStateModel'
import type { LeadInvestigation, LeadInvestigationId } from '../../model/model'
import { assertDefined, assertNotIn } from '../../primitives/assertPrimitives'
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
    assertDefined(investigation, `Investigation not found: ${investigationId}`)

    // Add agents to investigation (throw error on duplicates)
    for (const agentId of agentIds) {
      assertNotIn(
        agentId,
        investigation.agentIds,
        `Agent ${agentId} is already assigned to investigation ${investigationId}`,
      )
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
