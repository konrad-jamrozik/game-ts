import { f6floorToInt } from '../primitives/fixed6Primitives'
import type { GameState } from '../model/gameStateModel'
import { AGENT_CONTRACTING_INCOME, AGENT_UPKEEP_COST } from './constants'
import { sumAgentSkillBasedValuesV2 } from './skillRuleset'
import { notTerminated, onContractingAssignment } from '../model_utils/agentUtils'

export function getContractingIncomeV2(gameState: GameState): number {
  const contractingAgents = onContractingAssignment(gameState.agents)
  // This flooring strips any fractional income from the total
  return f6floorToInt(sumAgentSkillBasedValuesV2(contractingAgents, AGENT_CONTRACTING_INCOME))
}

export function getAgentUpkeepV2(gameState: GameState): number {
  return notTerminated(gameState.agents).length * AGENT_UPKEEP_COST
}

export function getMoneyTurnDiff(gameState: GameState): number {
  return gameState.funding + getContractingIncomeV2(gameState) - getAgentUpkeepV2(gameState)
}

export function getMoneyNewBalance(gameState: GameState): number {
  return gameState.money + getMoneyTurnDiff(gameState)
}
