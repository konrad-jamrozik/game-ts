import type { GameState } from '../../model/model'
import { asPlayerAction } from './asPlayerAction'

export type UpgradeName =
  | 'Agent cap'
  | 'Transport cap'
  | 'Training cap'
  | 'Training skill gain'
  | 'Exhaustion recovery'
  | 'Health recovery'

export const buyUpgrade = asPlayerAction<UpgradeName>((state: GameState, action) => {
  const upgradeName = action.payload
  const price = 100

  // Deduct money
  state.money -= price

  // Increase the selected upgrade by 1
  switch (upgradeName) {
    case 'Agent cap': {
      state.agentCap += 1
      break
    }
    case 'Transport cap': {
      state.transportCap += 1
      break
    }
    case 'Training cap': {
      state.trainingCap += 1
      break
    }
    case 'Training skill gain': {
      state.trainingSkillGain += 1
      break
    }
    case 'Exhaustion recovery': {
      state.exhaustionRecovery += 1
      break
    }
    case 'Health recovery': {
      state.healthRecovery += 1
      break
    }
    default: {
      // Exhaustive check: all UpgradeName cases are handled above
      const exhaustiveCheck: never = upgradeName
      throw new Error(`Unknown upgrade name: ${String(exhaustiveCheck)}`)
    }
  }
})
