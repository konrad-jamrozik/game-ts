import type { Agent } from '../../../lib/model/agentModel'
import type { GameState } from '../../../lib/model/gameStateModel'
import type { PlayTurnAPI } from '../../../lib/model_utils/playTurnApiTypes'
import type { AgentId } from '../../../lib/model/modelIds'
import { f6mult, toF } from '../../../lib/primitives/fixed6'
import { initialAgent } from '../../../lib/factories/agentFactory'
import { getAgentSkillBasedValue } from '../../../lib/ruleset/skillRuleset'
import { AGENT_CONTRACTING_INCOME } from '../../../lib/data_tables/constants'
import { available, withIds, onTrainingAssignment } from '../../../lib/model_utils/agentUtils'

export function getInBaseAgents(gameState: GameState): Agent[] {
  return available(gameState.agents)
}

export function unassignAgentsFromTraining(api: PlayTurnAPI, agentIds: AgentId[]): void {
  const { gameState } = api
  const selectedAgents = withIds(gameState.agents, agentIds)
  const trainingAgents = onTrainingAssignment(selectedAgents)
  if (trainingAgents.length > 0) {
    api.recallAgents(trainingAgents.map((a) => a.id))
  }
}

export function pickAtRandom<T>(items: T[]): T {
  if (items.length === 0) {
    throw new Error('Cannot pick from empty array')
  }
  const index = Math.floor(Math.random() * items.length)
  const item = items[index]
  if (item === undefined) {
    throw new Error('Array index out of bounds')
  }
  return item
}

export function pickAtRandomFromLowestExhaustion(agents: Agent[]): Agent {
  if (agents.length === 0) {
    throw new Error('Cannot pick from empty array')
  }

  const firstAgent = agents[0]
  if (firstAgent === undefined) {
    throw new Error('Cannot pick from empty array')
  }

  // Find minimum exhaustion
  let minExhaustion = toF(firstAgent.exhaustionPct)
  for (const agent of agents) {
    const exhaustion = toF(agent.exhaustionPct)
    if (exhaustion < minExhaustion) {
      minExhaustion = exhaustion
    }
  }

  // Filter agents with minimum exhaustion
  const agentsWithMinExhaustion = agents.filter((agent: Agent) => {
    const exhaustion = toF(agent.exhaustionPct)
    return exhaustion === minExhaustion
  })

  return pickAtRandom(agentsWithMinExhaustion)
}

export function calculateAgentThreatAssessment(agent: Agent): number {
  const hpMultiplier = toF(agent.hitPoints) / 100
  const damageMultiplier = (agent.weapon.damage * 2) / 100
  const multiplier = 1 + hpMultiplier + damageMultiplier
  const agentThreat = f6mult(agent.skill, multiplier)

  // Normalize by dividing by initial agent threat assessment (same as mission threat assessment)
  const initialAgentThreat = calculateInitialAgentThreatAssessment()
  return agentThreat / initialAgentThreat
}

function calculateInitialAgentThreatAssessment(): number {
  const hpMultiplier = toF(initialAgent.hitPoints) / 100
  const damageMultiplier = (initialAgent.weapon.damage * 2) / 100
  const multiplier = 1 + hpMultiplier + damageMultiplier
  return f6mult(initialAgent.skill, multiplier)
}

export function estimateAgentContractingIncome(agent: Agent): number {
  return toF(getAgentSkillBasedValue(agent, AGENT_CONTRACTING_INCOME))
}
