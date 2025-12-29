import type { Agent } from '../../../lib/model/agentModel'
import type { GameState } from '../../../lib/model/gameStateModel'
import { notTerminated } from '../../../lib/model_utils/agentUtils'
import { toF } from '../../../lib/primitives/fixed6'
import type { SelectNextAgentForPriorityContractingOptions, SelectNextBestReadyAgentOptions } from './types'
import { pickAtRandomFromLowestExhaustion } from './utils'

export function selectNextBestReadyAgent(
  gameState: GameState,
  excludeAgentIds: string[],
  alreadySelectedCount: number,
  options?: SelectNextBestReadyAgentOptions,
): Agent | undefined {
  const { includeInTraining = true, keepReserve = true } = options ?? {}
  // Get agents in base (Available or in Training)
  // KJA3 introduce inBaseAgents to agentUtils.ts and overall make the AI player reuse
  // these utils in many places.
  const inBaseAgents = gameState.agents.filter((agent: Agent) => {
    // Only select agents that are Available (required for validation)
    if (agent.state !== 'Available') {
      return false
    }
    if (agent.assignment === 'Standby') {
      return true
    }
    if (agent.assignment === 'Training') {
      return includeInTraining
    }
    return false
  })

  const totalAgentCount = notTerminated(gameState.agents).length

  // Filter out agents with exhaustion >= 5% and excluded agents
  const readyAgents = inBaseAgents.filter((agent: Agent) => {
    const exhaustionPct = toF(agent.exhaustionPct)
    return exhaustionPct < 5 && !excludeAgentIds.includes(agent.id)
  })

  // Return no agent if none available
  if (readyAgents.length === 0) {
    return undefined
  }

  // Return no agent if less than 20% of all agents will be ready after selecting alreadySelectedCount agents (only if keepReserve is true)
  if (keepReserve && readyAgents.length - alreadySelectedCount < totalAgentCount * 0.2) {
    return undefined
  }

  // Pick agent with lowest exhaustion, randomly if tied
  return pickAtRandomFromLowestExhaustion(readyAgents)
}

export function selectNextAgentForPriorityContracting(
  gameState: GameState,
  excludeAgentIds: string[],
  options?: SelectNextAgentForPriorityContractingOptions,
): Agent | undefined {
  const { includeInTraining = true } = options ?? {}
  // Get agents in base (Standby or in Training)
  const inBaseAgents = gameState.agents.filter((agent: Agent) => {
    // Only select agents that are Available (required for validation)
    if (agent.state !== 'Available') {
      return false
    }
    if (agent.assignment === 'Standby') {
      return true
    }
    // KJA3 this is currently effectively no-op, because agent must
    // become smarter, and first unassign training agents.
    // OR change game logic to allow directly assigning agents in training.
    if (agent.assignment === 'Training') {
      return includeInTraining
    }
    return false
  })

  // Filter out excluded agents only (no exhaustion filter)
  const availableAgents = inBaseAgents.filter((agent: Agent) => !excludeAgentIds.includes(agent.id))

  // Return no agent if none available
  if (availableAgents.length === 0) {
    return undefined
  }

  // Pick agent with lowest exhaustion, randomly if tied
  return pickAtRandomFromLowestExhaustion(availableAgents)
}
