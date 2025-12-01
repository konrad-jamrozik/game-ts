import type { Enemy } from '../../src/lib/model/model'
import { newEnemy } from '../../src/lib/domain_utils/enemyUtils'
import { wpnFix } from './weaponFixture'
import { AGENT_INITIAL_HIT_POINTS } from '../../src/lib/ruleset/constants'

export const enFix = (() => {
  let enemyIdCounter = 0

  const enemyFixture = {
    resetIdCounter(): void {
      enemyIdCounter = 0
    },

    default(): Enemy {
      const enemy = newEnemy('Initiate', enemyIdCounter)
      return enemy
    },

    withWeakWeapon(): Enemy {
      const weakDamage = Math.floor(AGENT_INITIAL_HIT_POINTS / 4) // 30 / 4 = 7.5, floor to 7
      return this.new({
        weapon: wpnFix.new({ constDamage: weakDamage }),
      })
    },

    withSuperWeapon(): Enemy {
      return this.new({
        weapon: wpnFix.new({ constDamage: 100 }),
      })
    },

    new(overrides?: Partial<Enemy>): Enemy {
      enemyIdCounter += 1
      const baseEnemy = this.default()
      return {
        ...baseEnemy,
        id: `enemy-${enemyIdCounter}`, // Override id to be unique
        ...overrides,
      }
    },
  }

  return enemyFixture
})()
