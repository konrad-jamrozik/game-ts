import { bps } from '../bps'
import { factions } from '../../collections/factions'
import type { GameState } from '../model'
import { validateAgentInvariants } from '../agents/validateAgentInvariants'
import { makeDebugInitialOverrides } from './debugInitialState'

export function makeInitialState(options?: { debug?: boolean }): GameState {
  const useDebug = options?.debug === true

  const normalGameState: GameState = {
    // Session
    turn: 1,
    actionsCount: 0,
    // Situation
    panic: bps(0),
    factions,
    // Assets
    money: 500,
    intel: 0,
    funding: 20,
    currentTurnTotalHireCost: 0,
    agents: [],
    // Leads
    leadInvestigationCounts: {},
    leadInvestigations: {},
    // Mission sites
    missionSites: [],
    // Turn start report
    turnStartReport: undefined,
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
