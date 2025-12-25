import { getActivityLevelByOrd, getFactionDataByDataId } from '../model_utils/getterUtils'
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

/**
 * Checks if a faction is discovered by verifying all discovery prerequisites are met.
 */
export function isFactionDiscovered(faction: Faction, leadInvestigationCounts: Record<string, number>): boolean {
  const factionData = getFactionDataByDataId(faction.factionDataId)
  const discoveryPrerequisite = factionData.discoveryPrerequisite
  return discoveryPrerequisite.every((leadId) => (leadInvestigationCounts[leadId] ?? 0) > 0)
}
