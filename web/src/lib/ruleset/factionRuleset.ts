import { getActivityLevelByOrd } from '../data_tables/dataTables'
import type { Faction } from '../model/factionModel'

/**
 * Check if faction should advance activity level.
 * Also handles the random threshold check.
 */
export function shouldAdvanceActivityLevel(faction: Faction, targetTurns: number): boolean {
  const config = getActivityLevelByOrd(faction.activityLevel)
  if (config.turnsMin === Infinity) {
    return false
  }
  return faction.turnsAtCurrentLevel >= targetTurns
}

/**
 * Check if faction should perform an operation.
 * Takes into account suppression turns.
 */
export function shouldPerformOperation(faction: Faction): boolean {
  if (faction.activityLevel === 0) {
    return false // Dormant factions don't perform operations
  }
  if (faction.suppressionTurns > 0) {
    return false // Suppressed factions don't perform operations
  }
  return faction.turnsUntilNextOperation <= 0
}

/**
 * Apply suppression to a faction by adding delay turns.
 */
export function applySuppression(faction: Faction, turns: number): void {
  faction.suppressionTurns += turns
}
