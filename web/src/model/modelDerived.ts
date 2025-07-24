import type { GameState } from '../model/model'
import { AGENT_CONTRACTING_INCOME, AGENT_ESPIONAGE_INTEL, AGENT_UPKEEP_COST } from '../ruleset/constants'

export function getAgentUpkeep(gameState: GameState): number {
  return gameState.agents.length * AGENT_UPKEEP_COST
}

export function getContractedIncome(gameState: GameState): number {
  return (
    gameState.agents.filter((agent) => agent.assignment === 'Contracting' && agent.state === 'OnAssignment').length *
    AGENT_CONTRACTING_INCOME
  )
}

export function getEspionageIntel(gameState: GameState): number {
  return (
    gameState.agents.filter((agent) => agent.assignment === 'Espionage' && agent.state === 'OnAssignment').length *
    AGENT_ESPIONAGE_INTEL
  )
}

export function getMoneyDiff(gameState: GameState): number {
  return gameState.funding + getContractedIncome(gameState) - getAgentUpkeep(gameState) - gameState.hireCost
}

export function getIntelDiff(gameState: GameState): number {
  return getEspionageIntel(gameState)
}

export function getMoneyNewBalance(gameState: GameState): number {
  return gameState.money + getMoneyDiff(gameState)
}

export function getIntelNewBalance(gameState: GameState): number {
  return gameState.intel + getIntelDiff(gameState)
}
