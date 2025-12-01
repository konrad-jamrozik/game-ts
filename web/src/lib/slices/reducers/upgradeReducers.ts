import { f6add } from '../../utils/fixed6Utils'
import {
  getUpgradePrice,
  getUpgradeIncrement,
  getUpgradeIncrementFixed6,
  type UpgradeName,
} from '../../collections/upgrades'
import type { GameState } from '../../model/model'
import { asPlayerAction } from './asPlayerAction'

export const buyUpgrade = asPlayerAction<UpgradeName>((state: GameState, action) => {
  const upgradeName = action.payload

  // Deduct money
  state.money -= getUpgradePrice(upgradeName)

  // Increase the selected upgrade by the increment amount
  switch (upgradeName) {
    case 'Agent cap': {
      state.agentCap += getUpgradeIncrement(upgradeName)
      break
    }
    case 'Transport cap': {
      state.transportCap += getUpgradeIncrement(upgradeName)
      break
    }
    case 'Training cap': {
      state.trainingCap += getUpgradeIncrement(upgradeName)
      break
    }
    case 'Training skill gain': {
      state.trainingSkillGain = f6add(state.trainingSkillGain, getUpgradeIncrementFixed6(upgradeName))
      break
    }
    case 'Exhaustion recovery': {
      state.exhaustionRecovery += getUpgradeIncrement(upgradeName)
      break
    }
    case 'Hit points recovery %': {
      state.hitPointsRecoveryPct += getUpgradeIncrement(upgradeName)
      break
    }
  }
})
