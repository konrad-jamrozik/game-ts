import { faker } from '@faker-js/faker'
import type { Weapon } from '../../src/lib/model/model'
import { AGENT_INITIAL_WEAPON_DAMAGE } from '../../src/lib/model/ruleset/constants'

export const WeaponFixture = {
  default(): Weapon {
    return {
      damage: AGENT_INITIAL_WEAPON_DAMAGE,
      minDamage: 1,
      maxDamage: AGENT_INITIAL_WEAPON_DAMAGE * 2,
    }
  },

  new(overrides?: Partial<Weapon>): Weapon {
    return {
      ...this.default(),
      ...overrides,
    }
  },

  random(): Weapon {
    const damage = faker.number.int({ min: 5, max: 50 })
    return {
      damage,
      minDamage: Math.max(1, damage - 10),
      maxDamage: damage + 10,
    }
  },

  powerful(): Weapon {
    return this.new({
      damage: 40,
      minDamage: 30,
      maxDamage: 50,
    })
  },

  weak(): Weapon {
    return this.new({
      damage: 5,
      minDamage: 1,
      maxDamage: 10,
    })
  },
}
