import { factions } from '../collections/factions'
import type { GameState } from '../model/model'
import { validateAgentInvariants } from '../utils/validateAgentInvariants'
import { makeDebugInitialOverrides } from './debugInitialState'

export function makeInitialState(options?: { debug?: boolean }): GameState {
  const useDebug = options?.debug === true

  const normalGameState: GameState = {
    // Session
    turn: 1,
    actionsCount: 0,
    // Situation
    panic: 0,
    factions,
    // Assets
    money: 500,
    intel: 0,
    funding: 20,
    hireCost: 50,
    agents: [],
    // Leads
    investigatedLeadIds: [],
    leadInvestigationCounts: {},
    // Mission sites
    missionSites: [],
  }

  let gameState: GameState = normalGameState
  if (useDebug) {
    const debugOverrides = makeDebugInitialOverrides()
    gameState = { ...gameState, ...debugOverrides }
  }

  gameState.agents.forEach((agent) => validateAgentInvariants(agent, gameState))

  return gameState
}

const initialState: GameState = makeInitialState()

export default initialState
