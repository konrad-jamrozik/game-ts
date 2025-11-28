import { f2addToInt } from '../fixed2'
import { agsV, type AgentsView } from '../agents/AgentsView'
import { calculateAgentSkillBasedValue } from './skillRuleset'
import type { GameState } from '../model'
import { AGENT_ESPIONAGE_INTEL } from './constants'

export function getEspionageIntel(agents: AgentsView): number {
  const espionageAgents = agents.onEspionageAssignment()
  let total = 0
  for (const agent of espionageAgents) {
    const intelFromAgent = calculateAgentSkillBasedValue(agent, AGENT_ESPIONAGE_INTEL)
    total = f2addToInt(total, intelFromAgent)
  }
  return total
}

export function getIntelDiff(gameState: GameState): number {
  return agsV(gameState.agents).espionageIntel()
}

export function getIntelNewBalance(gameState: GameState): number {
  return gameState.intel + getIntelDiff(gameState)
}
