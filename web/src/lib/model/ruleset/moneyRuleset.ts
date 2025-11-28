import { f2addToInt } from '../fixed2'
import { agsV, type AgentsView } from '../agents/AgentsView'
import type { GameState } from '../model'
import { AGENT_CONTRACTING_INCOME, AGENT_UPKEEP_COST } from './constants'
import { calculateAgentSkillBasedValue } from './skillRuleset'

export function getAgentUpkeep(agents: AgentsView): number {
  return agents.notTerminated().length * AGENT_UPKEEP_COST
}

export function getContractingIncome(agents: AgentsView): number {
  const contractingAgents = agents.onContractingAssignment()
  let total = 0
  for (const agent of contractingAgents) {
    const incomeFromAgent = calculateAgentSkillBasedValue(agent, AGENT_CONTRACTING_INCOME)
    total = f2addToInt(total, incomeFromAgent)
  }
  return total
}

export function getMoneyDiff(gameState: GameState): number {
  const agents = agsV(gameState.agents)
  return gameState.funding + agents.contractingIncome() - agents.agentUpkeep()
}

export function getMoneyNewBalance(gameState: GameState): number {
  return gameState.money + getMoneyDiff(gameState)
}
