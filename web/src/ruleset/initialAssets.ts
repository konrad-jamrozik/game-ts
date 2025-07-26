import type { GameState } from '../model/model'

const initialAssets: Pick<GameState, 'agents' | 'money' | 'intel' | 'funding' | 'investigatedLeadIds'> = {
  agents: [],
  money: 500,
  intel: 0,
  funding: 20,
  investigatedLeadIds: [],
}

const debugInitialAssets = { ...initialAssets, intel: 500 }

export default debugInitialAssets
