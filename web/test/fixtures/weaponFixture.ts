import type { Weapon } from '../../src/lib/model/model'
import { AGENT_INITIAL_WEAPON_DAMAGE } from '../../src/lib/ruleset/constants'

export const wpnFix = {
  default(): Weapon {
    return {
      damage: AGENT_INITIAL_WEAPON_DAMAGE,
      minDamage: 1,
      maxDamage: AGENT_INITIAL_WEAPON_DAMAGE * 2,
    }
  },

  bld(overrides?: Partial<Weapon> & { constDamage?: number }): Weapon {
    const { constDamage, ...weaponOverrides } = overrides ?? {}

    if (constDamage !== undefined) {
      return {
        damage: constDamage,
        minDamage: constDamage,
        maxDamage: constDamage,
      }
    }

    return {
      ...this.default(),
      ...weaponOverrides,
    }
  },
}
