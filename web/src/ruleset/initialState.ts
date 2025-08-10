import { factions } from '../collections/factions'
import type { GameState } from '../model/model'
import { makeDebugInitialState } from './debugInitialState'

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

const initialAssets: Pick<
  GameState,
  'agents' | 'money' | 'intel' | 'funding' | 'investigatedLeadIds' | 'leadInvestigationCounts'
> = {
  agents: [],
  money: 500,
  intel: 0,
  funding: 20,
  investigatedLeadIds: [],
  leadInvestigationCounts: {},
}

export { baseGameState }

export function makeInitialState(options?: { debug?: boolean }): GameState {
  const useDebug = options?.debug === true

  if (useDebug) {
    return makeDebugInitialState()
  }

  const gameState: GameState = {
    ...baseGameState,
    ...initialAssets,
  }

  return gameState
}

const initialState: GameState = makeInitialState()

export default initialState
