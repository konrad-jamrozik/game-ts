import { FACTION_OPERATION_LEVEL_DATA, type FactionOperationStats } from '../collections/factionStatsTables'
import { ACTIVITY_LEVEL_NAMES, type FactionActivityLevelOrd, type Faction } from '../model/factionModel'
import { assertDefined, assertInRange } from '../primitives/assertPrimitives'
import { toF6, type Fixed6 } from '../primitives/fixed6'
import { getFactionActivityLevelDefByOrd, type FactionActivityLevelDef } from '../collections/factionActivityLevelDefs'

// KJA1 activityLevelRuleset has tons of silly utils, move them to model utils

/**
 * Get the display name for an activity level.
 */
export function getActivityLevelName(level: FactionActivityLevelOrd): string {
  return ACTIVITY_LEVEL_NAMES[level] as string
}

/**
 * Get the configuration for an activity level.
 */
export function getActivityLevelConfig(level: FactionActivityLevelOrd): FactionActivityLevelDef {
  return getFactionActivityLevelDefByOrd(level)
}

/**
 * Check if a faction should advance to the next activity level.
 * Returns the threshold turns for comparison (minimum turns needed).
 */
export function getActivityLevelThreshold(level: FactionActivityLevelOrd): number {
  return getFactionActivityLevelDefByOrd(level).minTurns
}

/**
 * Get the next activity level, clamped at 7 (Total War).
 */
export function nextActivityLevel(level: FactionActivityLevelOrd): FactionActivityLevelOrd {
  assertInRange(level, 0, 6)
  const next = level + 1
  assertIsActivityLevel(next)
  return next
}

export function assertIsActivityLevel(value: number): asserts value is FactionActivityLevelOrd {
  if (value < 0 || value > 7 || !Number.isInteger(value)) {
    throw new Error(`Invalid activity level: ${value}. Must be an integer 0-7.`)
  }
}

/**
 * Calculate the actual turns needed to progress from current level.
 * Randomized between min and max turns.
 */
export function calculateProgressionTurns(level: FactionActivityLevelOrd): number {
  const config = getFactionActivityLevelDefByOrd(level)
  if (config.minTurns === Infinity) {
    return Infinity
  }
  return Math.floor(Math.random() * (config.maxTurns - config.minTurns + 1)) + config.minTurns
}

/**
 * Calculate the turns until next faction operation.
 * Randomized between min and max frequency.
 */
export function calculateOperationTurns(level: FactionActivityLevelOrd): number {
  const config = getFactionActivityLevelDefByOrd(level)
  if (config.operationFrequencyMin === Infinity) {
    return Infinity
  }
  return (
    Math.floor(Math.random() * (config.operationFrequencyMax - config.operationFrequencyMin + 1)) +
    config.operationFrequencyMin
  )
}

/**
 * Roll for an operation level based on current activity level weights.
 * Returns operation level 1-6.
 */
export function rollOperationLevel(activityLevel: FactionActivityLevelOrd): number {
  const config = getFactionActivityLevelDefByOrd(activityLevel)
  const weights = config.operationLevelWeights
  const totalWeight = weights.reduce((sum, w) => sum + w, 0)

  if (totalWeight === 0) {
    return 1 // Default to level 1 if no weights
  }

  const roll = Math.random() * totalWeight
  let cumulative = 0

  for (const [index, weight] of weights.entries()) {
    cumulative += weight
    if (roll < cumulative) {
      return index + 1 // Operation levels are 1-indexed
    }
  }

  return 6 // Fallback to max level
}

/**
 * Get panic increase for a given operation level.
 * Only called for defensive missions (operationLevel 1-6).
 * Level 0 check is kept for safety but should not occur in practice.
 */
export function getPanicIncreaseForOperation(operationLevel: number): Fixed6 {
  if (operationLevel === 0) {
    return toF6(0)
  }
  const stats = getFactionOperationStats(operationLevel)
  return toF6(stats.panicIncreasePct / 100)
}

/**
 * Get funding penalty for a given operation level when mission fails.
 * Only called for defensive missions (operationLevel 1-6).
 * Level 0 check is kept for safety but should not occur in practice.
 */
export function getFundingDecreaseForOperation(operationLevel: number): number {
  if (operationLevel === 0) {
    return 0
  }
  const stats = getFactionOperationStats(operationLevel)
  return stats.fundingPenalty
}

/**
 * Get money reward for a given operation level when defensive mission succeeds.
 * Only called for defensive missions (operationLevel 1-6).
 */
export function getMoneyRewardForOperation(operationLevel: number): number {
  if (operationLevel === 0) {
    return 0
  }
  const stats = getFactionOperationStats(operationLevel)
  return stats.moneyReward
}

/**
 * Get funding reward for a given operation level when defensive mission succeeds.
 * Only called for defensive missions (operationLevel 1-6).
 */
export function getFundingRewardForOperation(operationLevel: number): number {
  if (operationLevel === 0) {
    return 0
  }
  const stats = getFactionOperationStats(operationLevel)
  return stats.fundingReward
}

function getFactionOperationStats(operationLevel: number): FactionOperationStats {
  const result = FACTION_OPERATION_LEVEL_DATA.find((stats) => stats.level === operationLevel)
  assertDefined(result)
  return result
}

/**
 * Check if faction should advance activity level.
 * Also handles the random threshold check.
 */
export function shouldAdvanceActivityLevel(faction: Faction, targetTurns: number): boolean {
  const config = getFactionActivityLevelDefByOrd(faction.activityLevel)
  if (config.minTurns === Infinity) {
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
