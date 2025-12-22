import type { Enemy } from '../../src/lib/model/enemyModel'
import { bldEnemy } from '../../src/lib/factories/enemyFactory'
import { wpnFix } from './weaponFixture'
import { initialAgent } from '../../src/lib/factories/agentFactory'

export const enFix = (() => {
  let enemyIdCounter = 0

  const enemyFixture = {
    resetIdCounter(): void {
      enemyIdCounter = 0
    },

    default(): Enemy {
      const enemy = bldEnemy('initiate', enemyIdCounter)
      return enemy
    },

    withWeakWeapon(): Enemy {
      const weakDamage = Math.floor(initialAgent.maxHitPoints / 4) // 30 / 4 = 7.5, floor to 7
      return this.bld({
        weapon: wpnFix.bld({ constDamage: weakDamage }),
      })
    },

    withSuperWeapon(): Enemy {
      return this.bld({
        weapon: wpnFix.bld({ constDamage: 100 }),
      })
    },

    bld(overrides?: Partial<Enemy>): Enemy {
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
