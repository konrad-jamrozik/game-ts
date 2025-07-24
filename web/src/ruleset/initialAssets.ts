import type { GameState } from '../model/model'

const initialAssets: Pick<GameState, 'agents' | 'money' | 'intel' | 'funding' | 'hireCost'> = {
  agents: [],
  money: 500,
  intel: 0,
  funding: 20,
  hireCost: 0,
}

export default initialAssets
