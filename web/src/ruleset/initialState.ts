import { factions } from '../collections/factions'
import type { GameState } from '../model/model'
import { makeDebugInitialState } from './debugInitialState'

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

export function makeInitialState(options?: { debug?: boolean }): GameState {
  const useDebug = options?.debug === true

  if (useDebug) {
    return makeDebugInitialState()
  }

  const stateBase: GameState = {
    turn: 1,
    actionsCount: 0,
    nextAgentId: 0,
    nextMissionSiteId: 0,
    hireCost: 50,
    panic: 0,
    factions,
    missionSites: [],
    ...initialAssets,
  }

  return stateBase
}

const initialState: GameState = makeInitialState()

export default initialState
