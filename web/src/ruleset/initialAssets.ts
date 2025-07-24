import type { GameState } from '../model/model'

const initialAssets: Pick<GameState, 'agents' | 'money' | 'intel' | 'funding'> = {
  agents: [],
  money: 500,
  intel: 0,
  funding: 20,
}

const debugInitialAssets = { ...initialAssets, intel: 500 }

export default debugInitialAssets
