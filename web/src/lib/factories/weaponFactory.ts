import { WEAPON_DAMAGE_RANGE_FACTOR } from '../data_tables/constants'
import type { Weapon } from '../model/actorModel'
import { ceil, floor } from '../primitives/mathPrimitives'
import { assertDefined, assertInRange } from '../primitives/assertPrimitives'

/**
 * Prototype weapon with default values.
 * Used as a reference for initial weapon properties.
 */
export const initialWeapon: Weapon = {
  damage: 10,
  minDamage: 5,
  maxDamage: 15,
}

export type CreateWeaponParams = {
  damage: Weapon['damage']
} & Partial<Omit<Weapon, 'damage'>>

/**
 * Creates a weapon object.
 * Returns the created weapon. If only damage is provided, minDamage and maxDamage
 * are calculated as +/- 50% of base damage.
 * See also `Weapon damage roll` in docs.
 */
export function bldWeapon(params: CreateWeaponParams): Weapon {
  // Start with initialWeapon and override with provided values
  const weapon: Weapon = {
    ...initialWeapon,
    ...params,
  }

  // If damage was provided but minDamage/maxDamage were not, calculate them
  if (!('minDamage' in params) && !('maxDamage' in params)) {
    const baseDamage = weapon.damage
    weapon.minDamage = floor(baseDamage * (1 - WEAPON_DAMAGE_RANGE_FACTOR))
    weapon.maxDamage = ceil(baseDamage * (1 + WEAPON_DAMAGE_RANGE_FACTOR))
  }
  // If any of minDamage/maxDamage was provided, then both must be provided.
  if ('minDamage' in params || 'maxDamage' in params) {
    assertDefined(params.minDamage, 'Min damage must be provided if max damage is provided')
    assertDefined(params.maxDamage, 'Max damage must be provided if min damage is provided')
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
