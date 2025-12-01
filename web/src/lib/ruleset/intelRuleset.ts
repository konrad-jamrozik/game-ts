import { sumAgentSkillBasedValuesV2 } from './skillRuleset'
import type { GameState } from '../model/gameStateModel'
import { AGENT_ESPIONAGE_INTEL } from './constants'
import { f6floorToInt } from '../primitives/fixed6Primitives'
import { onEspionageAssignment } from '../model_utils/agentUtils'

export function getEspionageIntelV2(gameState: GameState): number {
  const espionageAgents = onEspionageAssignment(gameState.agents)
  // This flooring strips any fractional intel from the total
  return f6floorToInt(sumAgentSkillBasedValuesV2(espionageAgents, AGENT_ESPIONAGE_INTEL))
}

export function getIntelTurnDiff(gameState: GameState): number {
  return getEspionageIntelV2(gameState)
}

export function getIntelNewBalance(gameState: GameState): number {
  return gameState.intel + getIntelTurnDiff(gameState)
}
