import type { Weapon } from '../model/actorModel'
import { rollRange } from '../primitives/rolls'

/**
 * Rolls damage for a weapon, returning a value between minDamage and maxDamage (inclusive)
 * @param weapon - The weapon to roll damage for
 * @param label - Optional label for controllable random in tests
 */
export function rollWeaponDamage(weapon: Weapon, label?: string): number {
  return rollRange(weapon.minDamage, weapon.maxDamage, label).roll
}
