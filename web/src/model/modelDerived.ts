import type { GameState } from '../model/model'
import { AGENT_CONTRACTING_INCOME, AGENT_UPKEEP_COST } from '../ruleset/constants'

export function getAgentUpkeep(gameState: GameState): number {
  return gameState.agents.length * AGENT_UPKEEP_COST
}

export function getContractedIncome(gameState: GameState): number {
  return (
    gameState.agents.filter((agent) => agent.assignment === 'Contracting' && agent.state === 'Away').length *
    AGENT_CONTRACTING_INCOME
  )
}

export function getMoneyDiff(gameState: GameState): number {
  return gameState.funding + getContractedIncome(gameState) - getAgentUpkeep(gameState) - gameState.hireCost
}

export function getMoneyProjected(gameState: GameState): number {
  return gameState.money + getMoneyDiff(gameState)
}
