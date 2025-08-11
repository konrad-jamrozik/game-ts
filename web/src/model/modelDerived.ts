import type { GameState, MissionSite } from '../model/model'
import { AGENT_CONTRACTING_INCOME, AGENT_ESPIONAGE_INTEL } from '../ruleset/constants'
import { floor } from '../utils/mathUtils'
import { agV } from './views/AgentView'
import { agsV } from './views/AgentsView'

export function getAgentUpkeep(gameState: GameState): number {
  return agsV(gameState.agents).agentUpkeep()
}

export function getContractedIncome(gameState: GameState): number {
  const contractingAgents = gameState.agents.filter(
    (agent) => agent.assignment === 'Contracting' && agent.state === 'OnAssignment',
  )
  let total = 0
  for (const agent of contractingAgents) {
    const effectiveSkill = agV(agent).effectiveSkill()
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
    const effectiveSkill = agV(agent).effectiveSkill()
    total += floor((AGENT_ESPIONAGE_INTEL * effectiveSkill) / 100)
  }
  return total
}

export function getMoneyDiff(gameState: GameState): number {
  const agents = agsV(gameState.agents)
  return gameState.funding + agents.contractingIncome() - agents.agentUpkeep() - gameState.hireCost
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
