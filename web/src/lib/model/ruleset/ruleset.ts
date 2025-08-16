import { AGENT_CONTRACTING_INCOME, AGENT_ESPIONAGE_INTEL, AGENT_UPKEEP_COST } from './constants'
import { floor } from '../../utils/mathUtils'
import type { GameState, MissionSite } from '../model'
import { agsV, type AgentsView } from '../agents/AgentsView'

export function getAgentUpkeep(agents: AgentsView): number {
  return agents.notTerminated().length * AGENT_UPKEEP_COST
}

export function getContractingIncome(agents: AgentsView): number {
  const contractingAgents = agents.onContractingAssignment()
  let total = 0
  for (const agent of contractingAgents) {
    const effectiveSkill = agent.effectiveSkill()
    total += floor((AGENT_CONTRACTING_INCOME * effectiveSkill) / 100)
  }
  return total
}

export function getEspionageIntel(agents: AgentsView): number {
  const espionageAgents = agents.onEspionageAssignment()
  let total = 0
  for (const agent of espionageAgents) {
    const effectiveSkill = agent.effectiveSkill()
    total += floor((AGENT_ESPIONAGE_INTEL * effectiveSkill) / 100)
  }
  return total
}
export function getMoneyDiff(gameState: GameState): number {
  const agents = agsV(gameState.agents)
  return gameState.funding + agents.contractingIncome() - agents.agentUpkeep() - gameState.currentTurnTotalHireCost
}

export function getIntelDiff(gameState: GameState): number {
  return agsV(gameState.agents).espionageIntel()
}

export function getMoneyNewBalance(gameState: GameState): number {
  return gameState.money + getMoneyDiff(gameState)
}

export function getIntelNewBalance(gameState: GameState): number {
  return gameState.intel + getIntelDiff(gameState)
}

export function isMissionSiteConcluded(missionSite: MissionSite): boolean {
  return missionSite.state === 'Successful' || missionSite.state === 'Failed' || missionSite.state === 'Expired'
}

export function getRecoveryTurns(damage: number, hitPoints: number): number {
  const hitPointsLostPercentage = Math.min((damage / hitPoints) * 100, 100)
  const recoveryTurns = Math.ceil(hitPointsLostPercentage / 2)
  return recoveryTurns
}
