import type { AgentsView } from '../model_utils/AgentsView'
import { sumAgentSkillBasedValues } from './skillRuleset'
import type { GameState } from '../model/gameStateModel'
import { AGENT_ESPIONAGE_INTEL } from './constants'
import { f6floorToInt } from '../primitives/fixed6Primitives'
import { agentsOnEspionageAssignment } from '../model_utils/gameStateUtils'
import { agV } from '../model_utils/AgentView'

export function getEspionageIntel(agents: AgentsView): number {
  const espionageAgents = agents.onEspionageAssignment()
  // This flooring strips any fractional intel from the total
  return f6floorToInt(sumAgentSkillBasedValues(espionageAgents, AGENT_ESPIONAGE_INTEL))
}

export function getEspionageIntelV2(gameState: GameState): number {
  const espionageAgents = agentsOnEspionageAssignment(gameState)
  const espionageAgentViews = espionageAgents.map((agent) => agV(agent))
  // This flooring strips any fractional intel from the total
  return f6floorToInt(sumAgentSkillBasedValues(espionageAgentViews, AGENT_ESPIONAGE_INTEL))
}

export function getIntelTurnDiff(gameState: GameState): number {
  return getEspionageIntelV2(gameState)
}

export function getIntelNewBalance(gameState: GameState): number {
  return gameState.intel + getIntelTurnDiff(gameState)
}
