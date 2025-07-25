import type { GameState } from '../model/model'

const initialAssets: Pick<GameState, 'agents' | 'money' | 'intel' | 'funding' | 'investigatedLeads'> = {
  agents: [],
  money: 500,
  intel: 0,
  funding: 20,
  investigatedLeads: [],
}

const debugInitialAssets = { ...initialAssets, intel: 500 }

export default debugInitialAssets
