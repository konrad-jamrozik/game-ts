import type { PlayTurnAPI } from '../../../lib/model_utils/playTurnApiTypes'
import type { Agent } from '../../../lib/model/agentModel'
import type { GameState } from '../../../lib/model/gameStateModel'
import type { AgentId } from '../../../lib/model/modelIds'
import { available, recallable } from '../../../lib/model_utils/agentUtils'
import { toF } from '../../../lib/primitives/fixed6'
import { MAX_EXHAUSTION_ALLOWED_ON_ASSIGNMENT } from './constants'

export function recallExhausted(api: PlayTurnAPI): void {
  const exhaustedAgentIds = recallable(api.gameState.agents)
    .filter((agent) => toF(agent.exhaustionPct) > MAX_EXHAUSTION_ALLOWED_ON_ASSIGNMENT)
    .map((agent) => agent.id)

  if (exhaustedAgentIds.length > 0) {
    api.recallAgents(exhaustedAgentIds)
  }
}

export function selectReadyAgentIds(gameState: GameState, agentCount: number): AgentId[] {
  return selectReadyAgents(gameState, agentCount).map((agent) => agent.id)
}

export function countReadyAgents(gameState: GameState): number {
  return selectReadyAgents(gameState, Number.POSITIVE_INFINITY).length
}

export function selectReadyAgents(gameState: GameState, agentCount: number): Agent[] {
  return available(gameState.agents)
    .filter((agent) => toF(agent.exhaustionPct) < 100)
    .toSorted(compareAgentsByReadiness)
    .slice(0, agentCount)
}

function compareAgentsByReadiness(agentA: Agent, agentB: Agent): number {
  const exhaustionDiff = toF(agentA.exhaustionPct) - toF(agentB.exhaustionPct)
  if (exhaustionDiff !== 0) {
    return exhaustionDiff
  }
  return agentA.id.localeCompare(agentB.id)
}
