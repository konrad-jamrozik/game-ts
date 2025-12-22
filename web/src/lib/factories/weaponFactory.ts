import { WEAPON_DAMAGE_RANGE_FACTOR } from '../data_tables/constants'
import type { Weapon } from '../model/missionModel'
import { ceil, floor } from '../primitives/mathPrimitives'
import { assertInRange } from '../primitives/assertPrimitives'

/**
 * Prototype weapon with default values.
 * Used as a reference for initial weapon properties.
 */
export const initialWeapon: Weapon = {
  damage: 10,
  minDamage: 5,
  maxDamage: 15,
}

/**
 * Creates a weapon object.
 * Returns the created weapon. If only damage is provided, minDamage and maxDamage
 * are calculated as +/- 50% of base damage.
 * See also `Weapon damage roll` in docs.
 */
export function bldWeapon(params: Partial<Weapon> = {}): Weapon {
  // Start with initialWeapon and override with provided values
  const weapon: Weapon = {
    ...initialWeapon,
    ...params,
  }

  // If damage was provided but minDamage/maxDamage were not, calculate them
  if ('damage' in params && !('minDamage' in params) && !('maxDamage' in params)) {
    const baseDamage = weapon.damage
    weapon.minDamage = floor(baseDamage * (1 - WEAPON_DAMAGE_RANGE_FACTOR))
    weapon.maxDamage = ceil(baseDamage * (1 + WEAPON_DAMAGE_RANGE_FACTOR))
  }

  // Check invariants: minDamage <= damage <= maxDamage
  assertInRange(
    weapon.damage,
    weapon.minDamage,
    weapon.maxDamage,
    'Weapon damage must be between minDamage and maxDamage',
  )

  return weapon
}
