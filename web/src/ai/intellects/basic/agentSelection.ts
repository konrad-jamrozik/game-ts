import type { Agent } from '../../../lib/model/agentModel'
import type { GameState } from '../../../lib/model/gameStateModel'
import { available, onTrainingAssignment } from '../../../lib/model_utils/agentUtils'
import { toF } from '../../../lib/primitives/fixed6'
import type { SelectNextBestReadyAgentsOptions } from './types'
import { AGENT_RESERVE_PCT, MAX_READY_EXHAUSTION_PCT } from './constants'
import { pickAtRandomFromLowestExhaustion } from './utils'

export function selectNextBestReadyAgents(
  gameState: GameState,
  agentCount: number,
  excludeAgentIds: string[],
  alreadySelectedCount: number,
  options?: SelectNextBestReadyAgentsOptions,
): Agent[] {
  const { includeInTraining = true, keepReserve = true, maxExhaustionPct = MAX_READY_EXHAUSTION_PCT } = options ?? {}
  const availableAgents = available(gameState.agents)
  const totalAgentCount = gameState.agents.length

  const readyAvailableAgents = filterReadyAgents(availableAgents, maxExhaustionPct, excludeAgentIds)
  const readyInTrainingAgents = getReadyInTrainingAgents(
    gameState,
    includeInTraining,
    maxExhaustionPct,
    excludeAgentIds,
  )

  const selectedAgents: Agent[] = []
  const excludeSet = new Set(excludeAgentIds)
  let currentAlreadySelectedCount = alreadySelectedCount

  for (let i = 0; i < agentCount; i += 1) {
    // Filter out already selected agents
    const availableNotExcluded = readyAvailableAgents.filter((a) => !excludeSet.has(a.id))
    const trainingNotExcluded = readyInTrainingAgents.filter((a) => !excludeSet.has(a.id))

    // Consider ready available agents first. If includeInTraining is true, also consider ready in training agents.
    const consideredAgents: Agent[] =
      includeInTraining && availableNotExcluded.length === 0 ? trainingNotExcluded : availableNotExcluded

    // Return if no agents available
    if (consideredAgents.length === 0) {
      break
    }

    // Return if less than 20% of all agents will be ready after selecting currentAlreadySelectedCount agents (only if keepReserve is true)
    if (keepReserve && consideredAgents.length - currentAlreadySelectedCount < totalAgentCount * AGENT_RESERVE_PCT) {
      break
    }

    // Pick agent with lowest exhaustion, randomly if tied
    const selectedAgent = pickAtRandomFromLowestExhaustion(consideredAgents)
    selectedAgents.push(selectedAgent)
    excludeSet.add(selectedAgent.id)
    currentAlreadySelectedCount += 1
  }

  return selectedAgents
}

function getReadyInTrainingAgents(
  gameState: GameState,
  includeInTraining: boolean,
  maxExhaustionPct: number,
  excludeAgentIds: string[],
): Agent[] {
  if (!includeInTraining) {
    return []
  }
  const trainingAgents = onTrainingAssignment(gameState.agents)
  return filterReadyAgents(trainingAgents, maxExhaustionPct, excludeAgentIds)
}

function filterReadyAgents(agents: Agent[], maxExhaustionPct: number, excludeAgentIds: string[]): Agent[] {
  return agents.filter((agent: Agent) => {
    const exhaustionPct = toF(agent.exhaustionPct)
    return exhaustionPct <= maxExhaustionPct && !excludeAgentIds.includes(agent.id)
  })
}
