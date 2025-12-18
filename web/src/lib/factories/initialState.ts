import { toF6 } from '../primitives/fixed6'
import { bldFactions } from './factionFactory'
import type { GameState } from '../model/gameStateModel'
import { validateAgentInvariants } from '../model_utils/validateAgentInvariants'
import { bldDebugInitialOverrides, overwriteWithDebugOverrides } from './debugInitialState'
import {
  AGENT_CAP,
  AGENT_EXHAUSTION_RECOVERY_PER_TURN,
  AGENT_INITIAL_WEAPON_DAMAGE,
  AGENT_HIT_POINTS_RECOVERY_PCT,
  TRAINING_CAP,
  TRAINING_SKILL_GAIN,
  TRANSPORT_CAP,
} from '../data_tables/constants'
import { bldAgentWithoutState } from './agentFactory'
import type { AgentId } from '../model/agentModel'

const initialState: GameState = bldInitialState()

export default initialState

export function bldInitialState(options?: { debug?: boolean }): GameState {
  const useDebug = options?.debug === true

  const normalGameState: GameState = {
    // Session
    turn: 1,
    actionsCount: 0,
    // Situation
    panic: toF6(0),
    factions: bldFactions().map((faction) => ({ ...faction })), // Deep copy, so it is mutable, not readonly.
    // Assets
    money: 500,
    funding: 20,
    agentCap: AGENT_CAP,
    transportCap: TRANSPORT_CAP,
    trainingCap: TRAINING_CAP,
    trainingSkillGain: TRAINING_SKILL_GAIN,
    exhaustionRecovery: AGENT_EXHAUSTION_RECOVERY_PER_TURN,
    hitPointsRecoveryPct: AGENT_HIT_POINTS_RECOVERY_PCT,
    weaponDamage: AGENT_INITIAL_WEAPON_DAMAGE,
    agents: bldInitialAgents(),
    // Leads
    leadInvestigationCounts: {},
    leadInvestigations: {},
    // Missions
    missions: [],
    // Turn start report
    turnStartReport: undefined,
  }

  let gameState: GameState = normalGameState
  if (useDebug) {
    const debugOverrides = bldDebugInitialOverrides()
    gameState = { ...gameState, ...debugOverrides }
    gameState = overwriteWithDebugOverrides(gameState)
  }

  gameState.agents.forEach((agent) => validateAgentInvariants(agent, gameState))

  return gameState
}

function bldInitialAgents(): GameState['agents'] {
  const agents: GameState['agents'] = []

  for (let index = 0; index < 4; index += 1) {
    const agentId: AgentId = `agent-${index.toString().padStart(3, '0')}`
    agents.push(
      bldAgentWithoutState({
        id: agentId,
        turnHired: 1,
        weaponDamage: AGENT_INITIAL_WEAPON_DAMAGE,
        agentState: 'Available',
        assignment: 'Standby',
      }),
    )
  }

  return agents
}
