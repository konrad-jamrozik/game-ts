import type { GameState } from '../model/model'

const initialAssets: Pick<
  GameState,
  'agents' | 'money' | 'intel' | 'funding' | 'investigatedLeadIds' | 'missionSites'
> = {
  agents: [],
  money: 500,
  intel: 0,
  funding: 20,
  investigatedLeadIds: [],
  missionSites: [],
}

const debugInitialAssets = { ...initialAssets, intel: 500 }

export default debugInitialAssets
