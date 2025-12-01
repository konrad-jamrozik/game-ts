import { agsV, type AgentsView } from '../model_utils/AgentsView'
import { sumAgentSkillBasedValues } from './skillRuleset'
import type { GameState } from '../model/model'
import { AGENT_ESPIONAGE_INTEL } from './constants'
import { f6floorToInt } from '../primitives/fixed6Primitives'

export function getEspionageIntel(agents: AgentsView): number {
  const espionageAgents = agents.onEspionageAssignment()
  // This flooring strips any fractional intel from the total
  return f6floorToInt(sumAgentSkillBasedValues(espionageAgents, AGENT_ESPIONAGE_INTEL))
}

export function getIntelTurnDiff(gameState: GameState): number {
  return agsV(gameState.agents).espionageIntel()
}

export function getIntelNewBalance(gameState: GameState): number {
  return gameState.intel + getIntelTurnDiff(gameState)
}
