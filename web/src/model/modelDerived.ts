import type { GameState, MissionSite } from '../model/model'
import { AGENT_CONTRACTING_INCOME, AGENT_ESPIONAGE_INTEL, AGENT_UPKEEP_COST } from '../ruleset/constants'
import { floor } from '../utils/mathUtils'
import { getEffectiveSkill } from './views/AgentsView'

export function getAgentUpkeep(gameState: GameState): number {
  const nonTerminatedAgents = gameState.agents.filter((agent) => agent.state !== 'Terminated')
  return nonTerminatedAgents.length * AGENT_UPKEEP_COST
}

export function getContractedIncome(gameState: GameState): number {
  const contractingAgents = gameState.agents.filter(
    (agent) => agent.assignment === 'Contracting' && agent.state === 'OnAssignment',
  )
  let total = 0
  for (const agent of contractingAgents) {
    const effectiveSkill = getEffectiveSkill(agent)
    total += floor((AGENT_CONTRACTING_INCOME * effectiveSkill) / 100)
  }
  return total
}

export function getEspionageIntel(gameState: GameState): number {
  const espionageAgents = gameState.agents.filter(
    (agent) => agent.assignment === 'Espionage' && agent.state === 'OnAssignment',
  )
  let total = 0
  for (const agent of espionageAgents) {
    const effectiveSkill = getEffectiveSkill(agent)
    total += floor((AGENT_ESPIONAGE_INTEL * effectiveSkill) / 100)
  }
  return total
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

export function isMissionSiteConcluded(missionSite: MissionSite): boolean {
  return missionSite.state === 'Successful' || missionSite.state === 'Failed' || missionSite.state === 'Expired'
}
