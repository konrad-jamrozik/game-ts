import { sumAgentSkillBasedValues } from './skillRuleset'
import type { GameState } from '../model/gameStateModel'
import { AGENT_ESPIONAGE_INTEL } from './constants'
import { f6floorToInt } from '../primitives/fixed6Primitives'
import { onEspionageAssignment } from '../model_utils/agentUtils'

export function getEspionageIntel(gameState: GameState): number {
  const espionageAgents = onEspionageAssignment(gameState.agents)
  // This flooring strips any fractional intel from the total
  return f6floorToInt(sumAgentSkillBasedValues(espionageAgents, AGENT_ESPIONAGE_INTEL))
}

export function getIntelTurnDiff(gameState: GameState): number {
  return getEspionageIntel(gameState)
}

export function getIntelNewBalance(gameState: GameState): number {
  return gameState.intel + getIntelTurnDiff(gameState)
}
