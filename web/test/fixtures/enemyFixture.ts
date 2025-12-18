import type { Enemy } from '../../src/lib/model/missionModel'
import { bldEnemy } from '../../src/lib/factories/enemyFactory'
import { wpnFix } from './weaponFixture'
import { AGENT_INITIAL_HIT_POINTS } from '../../src/lib/data_tables/constants'

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
      const weakDamage = Math.floor(AGENT_INITIAL_HIT_POINTS / 4) // 30 / 4 = 7.5, floor to 7
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
