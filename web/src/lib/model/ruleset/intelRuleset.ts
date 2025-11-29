import { f6addToInt } from '../fixed6'
import { agsV, type AgentsView } from '../agents/AgentsView'
import { getAgentSkillBasedValue } from './skillRuleset'
import type { GameState } from '../model'
import { AGENT_ESPIONAGE_INTEL } from './constants'

export function getEspionageIntel(agents: AgentsView): number {
  const espionageAgents = agents.onEspionageAssignment()
  let total = 0
  for (const agent of espionageAgents) {
    const intelFromAgent = getAgentSkillBasedValue(agent, AGENT_ESPIONAGE_INTEL)
    total = f6addToInt(total, intelFromAgent)
  }
  return total
}

export function getIntelTurnDiff(gameState: GameState): number {
  return agsV(gameState.agents).espionageIntel()
}

export function getIntelNewBalance(gameState: GameState): number {
  return gameState.intel + getIntelTurnDiff(gameState)
}
