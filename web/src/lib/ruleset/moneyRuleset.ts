import { f6floorToInt } from '../primitives/fixed6'
import type { GameState } from '../model/gameStateModel'
import { AGENT_CONTRACTING_INCOME, AGENT_UPKEEP_COST } from '../data_tables/constants'
import { sumAgentSkillBasedValues } from './skillRuleset'
import { notTerminated, onContractingAssignment } from '../model_utils/agentUtils'

export function getContractingIncome(gameState: GameState): number {
  const contractingAgents = onContractingAssignment(gameState.agents)
  // This flooring strips any fractional income from the total
  return f6floorToInt(sumAgentSkillBasedValues(contractingAgents, AGENT_CONTRACTING_INCOME))
}

export function getAgentUpkeep(gameState: GameState): number {
  return notTerminated(gameState.agents).length * AGENT_UPKEEP_COST
}

export function getMoneyTurnDiff(gameState: GameState): number {
  return gameState.funding + getContractingIncome(gameState) - getAgentUpkeep(gameState)
}

export function getMoneyNewBalance(gameState: GameState): number {
  return gameState.money + getMoneyTurnDiff(gameState)
}
