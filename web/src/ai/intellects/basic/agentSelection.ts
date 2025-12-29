import type { Agent } from '../../../lib/model/agentModel'
import type { GameState } from '../../../lib/model/gameStateModel'
import { notTerminated } from '../../../lib/model_utils/agentUtils'
import { toF } from '../../../lib/primitives/fixed6'
import type { SelectNextAgentForPriorityContractingOptions, SelectNextBestReadyAgentOptions } from './types'
import { pickAtRandomFromLowestExhaustion, getInBaseAgentsAdvanced } from './utils'

export function selectNextBestReadyAgent(
  gameState: GameState,
  excludeAgentIds: string[],
  alreadySelectedCount: number,
  options?: SelectNextBestReadyAgentOptions,
): Agent | undefined {
  const { includeInTraining = true, keepReserve = true } = options ?? {}
  const inBaseAgents = getInBaseAgentsAdvanced(gameState, includeInTraining)

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
  const inBaseAgents = getInBaseAgentsAdvanced(gameState, includeInTraining)

  // Filter out excluded agents only (no exhaustion filter)
  const availableAgents = inBaseAgents.filter((agent: Agent) => !excludeAgentIds.includes(agent.id))

  // Return no agent if none available
  if (availableAgents.length === 0) {
    return undefined
  }

  // Pick agent with lowest exhaustion, randomly if tied
  return pickAtRandomFromLowestExhaustion(availableAgents)
}
