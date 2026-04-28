import type { AIPlayerIntellect } from '../../types'
import type { PlayTurnAPI } from '../../../lib/model_utils/playTurnApiTypes'
import { recallExhausted } from './agentAllocation'
import { fillContractingForCashFlow } from './contracting'
import { startAllAvailableInvestigations } from './leadInvestigation'
import { deployToAllMissions } from './missionDeployment'
import { spendMoney } from './purchasing'
import { log } from '../../../lib/primitives/logger'

export const cheatingSpeedrunnerIntellect: AIPlayerIntellect = {
  name: 'Cheating Speedrunner',
  playTurn(api: PlayTurnAPI): void {
    recallExhausted(api)
    spendMoney(api)
    deployToAllMissions(api)
    startAllAvailableInvestigations(api)
    fillContractingForCashFlow(api)
    log.info('ai', `Finished playing turn ${api.gameState.turn}`)
  },
}
