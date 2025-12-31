import type { AIPlayerIntellect } from '../../types'
import type { PlayTurnAPI } from '../../../lib/model_utils/playTurnApiTypes'
import { manageAgents } from './manageAgents'
import { spendMoney } from './purchasing'
import { log } from '../../../lib/primitives/logger'

export const basicIntellect: AIPlayerIntellect = {
  name: 'Basic',
  playTurn(api: PlayTurnAPI): void {
    manageAgents(api)
    spendMoney(api)
    log.info('ai', `⌛ Finished playing turn ${api.gameState.turn}`)
  },
}
