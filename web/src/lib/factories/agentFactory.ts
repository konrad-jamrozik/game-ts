/* eslint-disable unicorn/prefer-switch */
import type { Agent, AgentId } from '../model/agentModel'
import { toF6 } from '../primitives/fixed6'
import { initialWeapon } from './weaponFactory'
import { formatAgentId } from '../model_utils/formatModelUtils'
import { assertEqual } from '../primitives/assertPrimitives'

/**
 * Prototype agent with all default values.
 * Used as a reference for initial agent properties.
 */
export const initialAgent: Agent = {
  id: 'agent-ini' as AgentId,
  turnHired: 1,
  state: 'Available',
  assignment: 'Standby',
  skill: toF6(100),
  exhaustionPct: 0,
  hitPoints: toF6(30),
  maxHitPoints: 30,
  missionsTotal: 0,
  skillFromTraining: toF6(0),
  weapon: initialWeapon,
}

type CreateAgentParams = {
  agentCount: number
} & Partial<Agent>

/**
 * Creates a new agent object.
 * Returns the created agent. The caller is responsible for adding it to state.
 */
export function bldAgent(params: CreateAgentParams): Agent {
  const { agentCount, ...agentOverrides } = params

  // Start with initialAgent and override with provided values
  const agent: Agent = {
    ...initialAgent,
    ...agentOverrides,
  }

  // Generate ID if not provided
  if (agent.id === initialAgent.id) {
    agent.id = formatAgentId(agentCount)
  }

  // Determine agent state if not explicitly provided
  if (!('state' in agentOverrides)) {
    if (agent.assignment === 'Training') {
      agent.state = 'InTraining'
    } else if (agent.assignment === 'Contracting') {
      agent.state = 'InTransit'
    } else if (agent.assignment === 'Standby') {
      agent.state = 'Available'
    } else {
      assertEqual(agent.state, initialAgent.state, `Agent state must be ${initialAgent.state} (got ${agent.state})`)
    }
  }

  return agent
}
