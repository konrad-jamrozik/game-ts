import type { Agent } from '../../../lib/model/agentModel'
import type { GameState } from '../../../lib/model/gameStateModel'
import { available, notTerminated, onTrainingAssignment } from '../../../lib/model_utils/agentUtils'
import { toF } from '../../../lib/primitives/fixed6'
import { AGENT_RESERVE_PCT, MAX_READY_EXHAUSTION_PCT, type SelectNextBestReadyAgentOptions } from './types'
import { pickAtRandomFromLowestExhaustion } from './utils'

export function selectNextBestReadyAgent(
  gameState: GameState,
  excludeAgentIds: string[],
  alreadySelectedCount: number,
  options?: SelectNextBestReadyAgentOptions,
): Agent | undefined {
  const { includeInTraining = true, keepReserve = true, maxExhaustionPct = MAX_READY_EXHAUSTION_PCT } = options ?? {}
  const availableAgents = available(gameState.agents)
  const trainingAgents = onTrainingAssignment(gameState.agents)

  const totalAgentCount = notTerminated(gameState.agents).length

  // Filter out agents with exhaustion >= maxExhaustionPct and excluded agents
  const filterReadyAgents = (agents: Agent[]): Agent[] =>
    agents.filter((agent: Agent) => {
      const exhaustionPct = toF(agent.exhaustionPct)
      return exhaustionPct <= maxExhaustionPct && !excludeAgentIds.includes(agent.id)
    })

  const readyAvailableAgents = filterReadyAgents(availableAgents)
  const readyInTrainingAgents = filterReadyAgents(trainingAgents)

  // Consider ready available agents first. If includeInTraining is true, also consider ready in training agents.
  const consideredAgents: Agent[] =
    includeInTraining && readyAvailableAgents.length === 0 ? readyInTrainingAgents : readyAvailableAgents

  // Return no agent if none available
  if (consideredAgents.length === 0) {
    return undefined
  }

  // Return no agent if less than 20% of all agents will be ready after selecting alreadySelectedCount agents (only if keepReserve is true)
  if (keepReserve && consideredAgents.length - alreadySelectedCount < totalAgentCount * AGENT_RESERVE_PCT) {
    return undefined
  }

  // Pick agent with lowest exhaustion, randomly if tied
  return pickAtRandomFromLowestExhaustion(readyAvailableAgents)
}
