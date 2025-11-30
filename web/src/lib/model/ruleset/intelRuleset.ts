import { agsV, type AgentsView } from '../agents/AgentsView'
import { sumAgentSkillBasedValues } from './skillRuleset'
import type { GameState } from '../model'
import { AGENT_ESPIONAGE_INTEL } from './constants'

export function getEspionageIntel(agents: AgentsView): number {
  const espionageAgents = agents.onEspionageAssignment()
  return sumAgentSkillBasedValues(espionageAgents, AGENT_ESPIONAGE_INTEL)
}

export function getIntelTurnDiff(gameState: GameState): number {
  return agsV(gameState.agents).espionageIntel()
}

export function getIntelNewBalance(gameState: GameState): number {
  return gameState.intel + getIntelTurnDiff(gameState)
}
