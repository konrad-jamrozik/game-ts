import { agsV, type AgentsView } from '../model_utils/AgentsView'
import { f6floorToInt } from '../primitives/fixed6Primitives'
import type { GameState } from '../model/model'
import { AGENT_CONTRACTING_INCOME, AGENT_UPKEEP_COST } from './constants'
import { sumAgentSkillBasedValues } from './skillRuleset'

export function getAgentUpkeep(agents: AgentsView): number {
  return agents.notTerminated().length * AGENT_UPKEEP_COST
}

export function getContractingIncome(agents: AgentsView): number {
  const contractingAgents = agents.onContractingAssignment()
  // This flooring strips any fractional income from the total
  return f6floorToInt(sumAgentSkillBasedValues(contractingAgents, AGENT_CONTRACTING_INCOME))
}

export function getMoneyTurnDiff(gameState: GameState): number {
  const agents = agsV(gameState.agents)
  return gameState.funding + agents.contractingIncome() - agents.agentUpkeep()
}

export function getMoneyNewBalance(gameState: GameState): number {
  return gameState.money + getMoneyTurnDiff(gameState)
}
