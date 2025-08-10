import { factions } from '../collections/factions'
import type { GameState } from '../model/model'
import { validateAgentInvariants } from '../utils/validation'
import { makeDebugInitialOverrides } from './debugInitialState'

const baseGameState: Pick<
  GameState,
  'turn' | 'actionsCount' | 'nextAgentId' | 'nextMissionSiteId' | 'hireCost' | 'panic' | 'factions' | 'missionSites'
> = {
  turn: 1,
  actionsCount: 0,
  nextAgentId: 0,
  nextMissionSiteId: 0,
  hireCost: 50,
  panic: 0,
  factions,
  missionSites: [],
}

export function makeInitialState(options?: { debug?: boolean }): GameState {
  const useDebug = options?.debug === true

  // 1) Create the normal initial game state (inline assets)
  const normalGameState: GameState = {
    ...baseGameState,
    agents: [],
    money: 500,
    intel: 0,
    funding: 20,
    investigatedLeadIds: [],
    leadInvestigationCounts: {},
  }

  // 2) If debug, compose with debug overrides to replace appropriate values
  let gameState: GameState = normalGameState
  if (useDebug) {
    const debugOverrides = makeDebugInitialOverrides()
    gameState = { ...gameState, ...debugOverrides }
  }

  // 3) Always validate invariants at the end
  for (const agent of gameState.agents) {
    validateAgentInvariants(agent, gameState)
  }

  return gameState
}

const initialState: GameState = makeInitialState()

export default initialState
