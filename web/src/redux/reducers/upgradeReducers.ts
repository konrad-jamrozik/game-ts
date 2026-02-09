import { f6add, f6eq, toF6 } from '../../lib/primitives/fixed6'
import {
  getUpgradePrice,
  getUpgradeIncrement,
  getUpgradeIncrementFixed6,
  type UpgradeName,
} from '../../lib/data_tables/upgrades'
import type { GameState } from '../../lib/model/gameStateModel'
import { asPlayerAction } from '../reducer_utils/asPlayerAction'
import { bldWeapon } from '../../lib/factories/weaponFactory'

export const buyUpgrade = asPlayerAction<UpgradeName>((state: GameState, action) => {
  const upgradeName = action.payload

  // Deduct money
  const price = getUpgradePrice(upgradeName)
  state.money -= price

  // Track expenditure
  // KJA3_3 introduce type like "CapUpgrade" and "AgentUpgrade" and make "Upgrade" be union of them.
  if (upgradeName === 'Agent cap' || upgradeName === 'Transport cap' || upgradeName === 'Training cap') {
    state.turnExpenditures.capIncreases += price
  } else {
    state.turnExpenditures.upgrades += price
  }

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
    case 'Exhaustion recovery %': {
      state.exhaustionRecovery = f6add(state.exhaustionRecovery, getUpgradeIncrementFixed6(upgradeName))
      break
    }
    case 'Hit points recovery %': {
      state.hitPointsRecoveryPct = f6add(state.hitPointsRecoveryPct, getUpgradeIncrementFixed6(upgradeName))
      break
    }
    case 'Hit points': {
      const increment = getUpgradeIncrement(upgradeName)
      state.agentMaxHitPoints += increment
      const incrementFixed6 = toF6(increment)
      // Upgrade max hit points for all agents
      for (const agent of state.agents) {
        const wasAtFullHealth = f6eq(agent.hitPoints, agent.maxHitPoints)
        agent.maxHitPoints = f6add(agent.maxHitPoints, incrementFixed6)
        // If agent was at full health, also increase current hit points
        if (wasAtFullHealth) {
          agent.hitPoints = agent.maxHitPoints
        }
      }
      break
    }
    case 'Weapon damage': {
      state.weaponDamage += getUpgradeIncrement(upgradeName)
      // Upgrade weapons for all agents
      for (const agent of state.agents) {
        agent.weapon = bldWeapon({ damage: state.weaponDamage })
      }
      break
    }
  }
})
