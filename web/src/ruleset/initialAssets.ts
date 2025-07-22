import type { GameState } from '../model/model'

const initialAssets: Pick<GameState, 'agents' | 'money' | 'funding' | 'hireCost'> = {
  agents: [],
  money: 100,
  funding: 20,
  hireCost: 0,
}

export default initialAssets
