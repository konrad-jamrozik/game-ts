import { f6c0 } from '../primitives/fixed6'
import { bldFactions } from './factionFactory'
import type { GameState } from '../model/gameStateModel'
import { validateAgentInvariants } from '../model_utils/validateAgentInvariants'
import {
  AGENT_CAP,
  AGENT_EXHAUSTION_RECOVERY_PER_TURN,
  AGENT_HIT_POINTS_RECOVERY_PCT,
  TRAINING_CAP,
  TRAINING_SKILL_GAIN,
  TRANSPORT_CAP,
} from '../data_tables/constants'
import { bldAgent, initialAgent } from './agentFactory'
import { initialWeapon } from './weaponFactory'
import { bldDebugGameStateOverrides } from './debugGameStateFactory'

/**
 * Prototype game state with all default values.
 * Used as a reference for initial game state properties.
 */
export const initialGameState: GameState = {
  // Session
  turn: 1,
  actionsCount: 0,
  // Situation
  panic: f6c0,
  factions: bldFactions(),
  // Assets
  money: 500,
  funding: 20,
  agentCap: AGENT_CAP,
  transportCap: TRANSPORT_CAP,
  trainingCap: TRAINING_CAP,
  trainingSkillGain: TRAINING_SKILL_GAIN,
  exhaustionRecovery: AGENT_EXHAUSTION_RECOVERY_PER_TURN,
  hitPointsRecoveryPct: AGENT_HIT_POINTS_RECOVERY_PCT,
  weaponDamage: initialWeapon.damage,
  agents: bldInitialAgents(),
  terminatedAgents: [],
  totalAgentsHired: 4,
  turnExpenditures: {
    agentHiring: 0,
    upgrades: 0,
    capIncreases: 0,
  },
  // Leads
  leadInvestigationCounts: {},
  leadInvestigations: {},
  // Missions
  missions: [],
  // Turn start report
  turnStartReport: undefined,
}

type CreateGameStateParams = Partial<GameState>
/**
 * Creates a new game state object.
 * Returns the created game state. Starts with initialGameState and applies optional overrides.
 */
export function bldGameState(gameStateOverrides: CreateGameStateParams = {}): GameState {
  // Start with initialGameState and override with provided values
  const gameState: GameState = {
    ...initialGameState,
    ...gameStateOverrides,
  }

  gameState.agents.forEach((agent) => validateAgentInvariants(agent, gameState))
  return gameState
}

/**
 * Creates the initial game state
 * @param options - Options for creating the initial state
 * @param options.debug - If true, creates a debug state with diverse agents and missions
 */
export function bldInitialState(options?: { debug?: boolean }): GameState {
  const useDebug = options?.debug === true
  const debugOverrides = useDebug ? bldDebugGameStateOverrides(initialGameState) : {}
  return bldGameState(debugOverrides)
}

function bldInitialAgents(): GameState['agents'] {
  const agents: GameState['agents'] = []

  for (let index = 0; index < 4; index += 1) {
    agents.push(
      bldAgent({
        agentCount: index,
        weapon: initialAgent.weapon,
        state: 'Available',
        assignment: 'Standby',
      }),
    )
  }

  return agents
}
