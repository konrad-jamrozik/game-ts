import { factions } from '../collections/factions'
import type { GameState } from '../model/model'
import { validateAgentInvariants } from '../utils/validation'
import { makeDebugInitialOverrides } from './debugInitialState'

export function makeInitialState(options?: { debug?: boolean }): GameState {
  const useDebug = options?.debug === true

  const normalGameState: GameState = {
    turn: 1,
    actionsCount: 0,
    nextAgentId: 0,
    nextMissionSiteId: 0,
    hireCost: 50,
    panic: 0,
    factions,
    missionSites: [],
    agents: [],
    money: 500,
    intel: 0,
    funding: 20,
    investigatedLeadIds: [],
    leadInvestigationCounts: {},
  }

  let gameState: GameState = normalGameState
  if (useDebug) {
    const debugOverrides = makeDebugInitialOverrides()
    gameState = { ...gameState, ...debugOverrides }
  }

  for (const agent of gameState.agents) {
    validateAgentInvariants(agent, gameState)
  }

  return gameState
}

const initialState: GameState = makeInitialState()

export default initialState
