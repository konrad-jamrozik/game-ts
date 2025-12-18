import { WEAPON_DAMAGE_RANGE_FACTOR } from '../dataTables/constants'
import type { Weapon } from '../model/missionModel'
import { rollRange } from '../primitives/rolls'
import { ceil, floor } from '../primitives/mathPrimitives'

// KJA1 belongs to factories
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

/**
 * Rolls damage for a weapon, returning a value between minDamage and maxDamage (inclusive)
 * @param weapon - The weapon to roll damage for
 * @param label - Optional label for controllable random in tests
 */
export function rollWeaponDamage(weapon: Weapon, label?: string): number {
  return rollRange(weapon.minDamage, weapon.maxDamage, label).roll
}
