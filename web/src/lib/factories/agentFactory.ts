/* eslint-disable unicorn/prefer-switch */
import type { Agent, AgentId } from '../model/agentModel'
import { AGENT_INITIAL_WEAPON_DAMAGE } from '../data_tables/constants'
import { toF6 } from '../primitives/fixed6'
import { bldWeapon } from './weaponFactory'
import { formatAgentId } from '../../redux/reducer_utils/agentIdUtils'

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
    }
    // Otherwise keep initialAgent.state ('Available')
  }

  return agent
}

/**
 * Prototype agent with all default values.
 * Used as a reference for initial agent properties.
 */
export const initialAgent: Agent = {
  id: 'agent-proto' as AgentId,
  turnHired: 1,
  state: 'Available',
  assignment: 'Standby',
  skill: toF6(100),
  exhaustionPct: 0,
  hitPoints: toF6(30),
  maxHitPoints: 30,
  missionsTotal: 0,
  skillFromTraining: toF6(0),
  weapon: bldWeapon(AGENT_INITIAL_WEAPON_DAMAGE),
}

type CreateAgentParams = {
  agentCount: number
} & Partial<Omit<Agent, 'id'>> & {
    id?: AgentId // Optional: if not provided, will be auto-generated
  }
