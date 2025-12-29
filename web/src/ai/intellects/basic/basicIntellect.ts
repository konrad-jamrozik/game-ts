import type { AIPlayerIntellect } from '../../types'
import type { PlayTurnAPI } from '../../../lib/model_utils/playTurnApiTypes'
import { manageAgents } from './manageAgents'
import { spendMoney } from './purchasing'

export const basicIntellect: AIPlayerIntellect = {
  name: 'Basic',
  playTurn(api: PlayTurnAPI): void {
    manageAgents(api)
    spendMoney(api)
    console.log(`⌛ ===== basicIntellect: finished playing turn ${api.gameState.turn}`)
  },
}
