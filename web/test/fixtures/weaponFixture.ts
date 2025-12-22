import type { Weapon } from '../../src/lib/model/actorModel'
import { initialWeapon } from '../../src/lib/factories/weaponFactory'

export const wpnFix = {
  default(): Weapon {
    return {
      damage: initialWeapon.damage,
      minDamage: 1,
      maxDamage: initialWeapon.damage * 2,
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
