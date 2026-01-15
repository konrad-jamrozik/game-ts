import type { GameState } from '../../../lib/model/gameStateModel'
import type { Agent } from '../../../lib/model/agentModel'
import type { AgentId } from '../../../lib/model/modelIds'
import type { SelectNextBestReadyAgentsOptions } from './types'
import { toF } from '../../../lib/primitives/fixed6'
import { AGENT_RESERVE_PCT, MAX_READY_EXHAUSTION_PCT } from './constants'
import { calculateAgentCombatRating, estimateAgentContractingIncome, pickAtRandom } from './utils'

// KJA1 should be in types
export type AgentWithStats = Agent & {
  contractingIncome: number
  combatRating: number
  exhaustionPctValue: number
  isInTraining: boolean
}

export function getAssignableAgentsWithStats(gameState: GameState): AgentWithStats[] {
  const assignableAgents: AgentWithStats[] = []
  for (const agent of gameState.agents) {
    const isInTraining = agent.state === 'InTraining' && agent.assignment === 'Training'
    if (agent.state !== 'Available' && !isInTraining) {
      continue
    }
    assignableAgents.push({
      ...agent,
      contractingIncome: estimateAgentContractingIncome(agent),
      combatRating: calculateAgentCombatRating(agent),
      exhaustionPctValue: toF(agent.exhaustionPct),
      isInTraining,
    })
  }
  return assignableAgents
}

export function selectNextBestReadyAgents(
  agents: AgentWithStats[],
  agentCount: number,
  excludeAgentIds: AgentId[],
  alreadySelectedCount: number,
  totalAgentCount: number,
  options?: SelectNextBestReadyAgentsOptions,
): AgentWithStats[] {
  const { includeInTraining = true, keepReserve = true, maxExhaustionPct = MAX_READY_EXHAUSTION_PCT } = options ?? {}
  const readyAvailableAgents: AgentWithStats[] = filterReadyAgents(agents, maxExhaustionPct, excludeAgentIds, false)
  const readyInTrainingAgents: AgentWithStats[] = getReadyInTrainingAgents(
    agents,
    includeInTraining,
    maxExhaustionPct,
    excludeAgentIds,
  )

  const selectedAgents: AgentWithStats[] = []
  const excludeSet = new Set<AgentId>(excludeAgentIds)
  let currentAlreadySelectedCount = alreadySelectedCount

  for (let i = 0; i < agentCount; i += 1) {
    // Filter out already selected agents
    const availableNotExcluded = readyAvailableAgents.filter((agent: AgentWithStats) => !excludeSet.has(agent.id))
    const trainingNotExcluded = readyInTrainingAgents.filter((agent: AgentWithStats) => !excludeSet.has(agent.id))

    // Consider ready available agents first. If includeInTraining is true, also consider ready in training agents.
    const consideredAgents: AgentWithStats[] =
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
    const selectedAgent = pickAtRandomFromLowestExhaustion2(consideredAgents)
    selectedAgents.push(selectedAgent)
    excludeSet.add(selectedAgent.id)
    currentAlreadySelectedCount += 1
  }

  return selectedAgents
}

// KJA1 should be in utils
export function removeAgentsById(agents: AgentWithStats[], agentIds: readonly AgentId[]): AgentWithStats[] {
  const idSet = new Set(agentIds)
  return agents.filter((agent) => !idSet.has(agent.id))
}

function getReadyInTrainingAgents(
  agents: AgentWithStats[],
  includeInTraining: boolean,
  maxExhaustionPct: number,
  excludeAgentIds: AgentId[],
): AgentWithStats[] {
  if (!includeInTraining) {
    return []
  }
  const trainingAgents = agents.filter((agent: AgentWithStats) => agent.isInTraining)
  return filterReadyAgents(trainingAgents, maxExhaustionPct, excludeAgentIds, true)
}

function filterReadyAgents(
  agents: AgentWithStats[],
  maxExhaustionPct: number,
  excludeAgentIds: AgentId[],
  isInTraining: boolean,
): AgentWithStats[] {
  return agents.filter(
    (agent: AgentWithStats) =>
      agent.isInTraining === isInTraining &&
      agent.exhaustionPctValue <= maxExhaustionPct &&
      !excludeAgentIds.includes(agent.id),
  )
}

// KJA1 this should be in utils and replace the predecessor, but it causes circular import somehow.
function pickAtRandomFromLowestExhaustion2(agents: AgentWithStats[]): AgentWithStats {
  if (agents.length === 0) {
    throw new Error('Cannot pick from empty array')
  }

  const firstAgent = agents[0]
  if (firstAgent === undefined) {
    throw new Error('Cannot pick from empty array')
  }

  let minExhaustion = firstAgent.exhaustionPctValue
  for (const agent of agents) {
    if (agent.exhaustionPctValue < minExhaustion) {
      minExhaustion = agent.exhaustionPctValue
    }
  }

  const agentsWithMinExhaustion = agents.filter((agent) => agent.exhaustionPctValue === minExhaustion)
  return pickAtRandom(agentsWithMinExhaustion)
}
