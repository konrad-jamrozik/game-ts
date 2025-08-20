import { WEAPON_DAMAGE_RANGE_FACTOR } from '../model/ruleset/constants'
import type { Weapon } from '../model/model'

/**
 * Creates a weapon with damage range calculated as +/- 50% of base damage
 */
export function createWeapon(baseDamage: number): Weapon {
  const minDamage = Math.floor(baseDamage * (1 - WEAPON_DAMAGE_RANGE_FACTOR))
  const maxDamage = Math.ceil(baseDamage * (1 + WEAPON_DAMAGE_RANGE_FACTOR))

  return {
    damage: baseDamage,
    minDamage,
    maxDamage,
  }
}

/**
 * Rolls damage for a weapon, returning a value between minDamage and maxDamage (inclusive)
 * // KJA rollWeaponDamage should use rangeRoll() function
 */
export function rollWeaponDamage(weapon: Weapon): number {
  const range = weapon.maxDamage - weapon.minDamage + 1
  const roll = Math.floor(Math.random() * range) + weapon.minDamage
  return roll
}
