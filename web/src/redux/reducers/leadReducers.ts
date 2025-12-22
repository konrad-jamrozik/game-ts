import type { GameState } from '../../lib/model/gameStateModel'
import type { AgentId } from '../../lib/model/agentModel'
import type { LeadId, LeadInvestigationId } from '../../lib/model/leadModel'
import { assertDefined, assertNotIn } from '../../lib/primitives/assertPrimitives'
import { getLeadById } from '../../lib/data_tables/dataTables'
import { bldLeadInvestigation } from '../../lib/factories/leadInvestigationFactory'
import { asPlayerAction } from '../reducer_utils/asPlayerAction'

export const startLeadInvestigation = asPlayerAction<{ leadId: LeadId; agentIds: AgentId[] }>(
  (state: GameState, action) => {
    const { leadId, agentIds } = action.payload

    // Ensure the lead exists (for clear error message + invariants)
    getLeadById(leadId)

    // Prevent starting a second active investigation for the same lead (repeatable or not).
    // Repeatable leads can be investigated multiple times, but only one at a time.
    const hasActiveInvestigationForLead = Object.values(state.leadInvestigations).some(
      (investigation) => investigation.leadId === leadId && investigation.state === 'Active',
    )
    if (hasActiveInvestigationForLead) {
      throw new Error(`Lead ${leadId} already has an active investigation`)
    }

    // Create new investigation
    const investigationCount = Object.keys(state.leadInvestigations).length
    const newInvestigation = bldLeadInvestigation({
      investigationCount,
      startTurn: state.turn,
      leadId,
      agentIds,
    })
    const investigationId = newInvestigation.id

    // Add investigation to state
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

export const addAgentsToInvestigation = asPlayerAction<{ investigationId: LeadInvestigationId; agentIds: AgentId[] }>(
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
