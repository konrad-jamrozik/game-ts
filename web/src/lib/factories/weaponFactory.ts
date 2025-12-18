import { WEAPON_DAMAGE_RANGE_FACTOR } from '../data_tables/constants'
import type { Weapon } from '../model/missionModel'
import { ceil, floor } from '../primitives/mathPrimitives'

/**
 * Creates a weapon with damage range calculated as +/- 50% of base damage
 * See also `Weapon damage roll` in docs.
 */
export function bldWeapon(baseDamage: number): Weapon {
  const minDamage = floor(baseDamage * (1 - WEAPON_DAMAGE_RANGE_FACTOR))
  const maxDamage = ceil(baseDamage * (1 + WEAPON_DAMAGE_RANGE_FACTOR))

  return {
    damage: baseDamage,
    minDamage,
    maxDamage,
  }
}
