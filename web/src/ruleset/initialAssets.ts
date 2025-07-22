import type { GameState } from '../model/model'

const initialAssets: Pick<GameState, 'agents' | 'money' | 'funding'> = {
  agents: [],
  money: 100,
  funding: 20,
}

export default initialAssets
