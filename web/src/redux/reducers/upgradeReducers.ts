import { f6add } from '../../lib/primitives/fixed6'
import {
  getUpgradePrice,
  getUpgradeIncrement,
  getUpgradeIncrementFixed6,
  type UpgradeName,
} from '../../lib/data_tables/upgrades'
import type { GameState } from '../../lib/model/gameStateModel'
import { asPlayerAction } from '../reducer_utils/asPlayerAction'
import { bldWeapon } from '../../lib/factories/weaponFactory'
import { notTerminated } from '../../lib/model_utils/agentUtils'

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
      state.exhaustionRecovery = f6add(state.exhaustionRecovery, getUpgradeIncrementFixed6(upgradeName))
      break
    }
    case 'Hit points recovery %': {
      state.hitPointsRecoveryPct = f6add(state.hitPointsRecoveryPct, getUpgradeIncrementFixed6(upgradeName))
      break
    }
    case 'Weapon damage': {
      state.weaponDamage += getUpgradeIncrement(upgradeName)
      // Upgrade weapons for all non-terminated agents
      const agentsToUpgrade = notTerminated(state.agents)
      for (const agent of agentsToUpgrade) {
        agent.weapon = bldWeapon({ damage: state.weaponDamage })
      }
      break
    }
  }
})
