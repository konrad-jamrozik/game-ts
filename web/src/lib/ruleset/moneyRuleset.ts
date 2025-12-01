import { agsV, type AgentsView } from '../model_utils/AgentsView'
import { f6floorToInt } from '../primitives/fixed6Primitives'
import type { GameState } from '../model/gameStateModel'
import { AGENT_CONTRACTING_INCOME, AGENT_UPKEEP_COST } from './constants'
import { sumAgentSkillBasedValues } from './skillRuleset'
import { agentsNotTerminated } from '../model_utils/gameStateUtils'

export function getContractingIncome(agents: AgentsView): number {
  const contractingAgents = agents.onContractingAssignment()
  // This flooring strips any fractional income from the total
  return f6floorToInt(sumAgentSkillBasedValues(contractingAgents, AGENT_CONTRACTING_INCOME))
}

export function getAgentUpkeepV2(gameState: GameState): number {
  return agentsNotTerminated(gameState).length * AGENT_UPKEEP_COST
}

export function getMoneyTurnDiff(gameState: GameState): number {
  // KJA rewrite this to be:
  // return gameState.funding + rlst.contractingIncome(gs) + rlst.agentUpkeep(gs)agents.contractingIncome() - agents.agentUpkeep()
  const agents = agsV(gameState.agents)
  return gameState.funding + agents.contractingIncome() - getAgentUpkeepV2(gameState)
}

export function getMoneyNewBalance(gameState: GameState): number {
  return gameState.money + getMoneyTurnDiff(gameState)
}
