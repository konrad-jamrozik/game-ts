import { factions } from '../collections/factions'
import type { GameState } from '../model/model'

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

export const debugInitialAssets = {
  ...initialAssets,
  intel: 500,
  investigatedLeadIds: ['lead-red-dawn-profile'],
  leadInvestigationCounts: { 'lead-red-dawn-profile': 1 },
}

export function makeInitialState(options?: { debug?: boolean }): GameState {
  const useDebug = options?.debug === true
  const assets = useDebug ? debugInitialAssets : initialAssets
  return {
    turn: 1,
    actionsCount: 0,
    nextAgentId: 0,
    nextMissionSiteId: 0,
    hireCost: 50,
    panic: 0,
    factions,
    missionSites: [],
    ...assets,
  }
}

const initialState: GameState = makeInitialState()

export default initialState
