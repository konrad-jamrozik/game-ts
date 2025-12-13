import { ACTIVITY_LEVEL_NAMES, type ActivityLevel, type Faction } from '../model/model'
import { assertInRange } from '../primitives/assertPrimitives'
import { toF6, type Fixed6 } from '../primitives/fixed6'

/**
 * Activity level progression configuration.
 * Each level has:
 * - minTurns: minimum turns before progressing to next level
 * - maxTurns: maximum turns before progressing (randomized between min and max)
 * - operationFrequencyMin: minimum turns between faction operations
 * - operationFrequencyMax: maximum turns between faction operations
 * - operationLevelWeights: probability weights for operation levels 1-6
 */
export type ActivityLevelConfig = {
  minTurns: number
  maxTurns: number
  operationFrequencyMin: number
  operationFrequencyMax: number
  operationLevelWeights: [number, number, number, number, number, number]
}

/**
 * Activity level configurations indexed by activity level (0-7).
 * Based on the documentation in about_defensive_missions.md
 */
export const ACTIVITY_LEVEL_CONFIGS: Record<ActivityLevel, ActivityLevelConfig> = {
  0: {
    // Dormant - no operations
    minTurns: 15,
    maxTurns: 30,
    operationFrequencyMin: Infinity,
    operationFrequencyMax: Infinity,
    operationLevelWeights: [0, 0, 0, 0, 0, 0],
  },
  1: {
    // Faint
    minTurns: 60,
    maxTurns: 90,
    operationFrequencyMin: 15,
    operationFrequencyMax: 25,
    operationLevelWeights: [80, 20, 0, 0, 0, 0],
  },
  2: {
    // Emerging
    minTurns: 60,
    maxTurns: 90,
    operationFrequencyMin: 13,
    operationFrequencyMax: 23,
    operationLevelWeights: [60, 30, 10, 0, 0, 0],
  },
  3: {
    // Active
    minTurns: 60,
    maxTurns: 90,
    operationFrequencyMin: 11,
    operationFrequencyMax: 21,
    operationLevelWeights: [40, 40, 15, 5, 0, 0],
  },
  4: {
    // Expanding
    minTurns: 60,
    maxTurns: 90,
    operationFrequencyMin: 10,
    operationFrequencyMax: 20,
    operationLevelWeights: [30, 30, 30, 10, 0, 0],
  },
  5: {
    // Escalating
    minTurns: 60,
    maxTurns: 90,
    operationFrequencyMin: 9,
    operationFrequencyMax: 19,
    operationLevelWeights: [20, 25, 35, 15, 5, 0],
  },
  6: {
    // War
    minTurns: 60,
    maxTurns: 90,
    operationFrequencyMin: 8,
    operationFrequencyMax: 18,
    operationLevelWeights: [15, 20, 30, 20, 10, 5],
  },
  7: {
    // Total War
    minTurns: Infinity, // Cannot progress beyond this
    maxTurns: Infinity,
    operationFrequencyMin: 7,
    operationFrequencyMax: 17,
    operationLevelWeights: [10, 15, 25, 25, 15, 10],
  },
}

/**
 * Panic increase per operation level when a faction operation succeeds (mission not completed).
 */
export const PANIC_INCREASE_BY_OPERATION_LEVEL: Record<number, Fixed6> = {
  1: toF6(0.0005), // Soft operations - 0.05%
  2: toF6(0.002), // Violent but small-scale - 0.2%
  3: toF6(0.01), // Strategic threats - 1%
  4: toF6(0.03), // Regional destabilization - 3%
  5: toF6(0.1), // Global conflict - 10%
  6: toF6(0.3), // Existential - 30%
}

/**
 * Funding decrease per operation level when a faction operation succeeds (mission not completed).
 */
export const FUNDING_DECREASE_BY_OPERATION_LEVEL: Record<number, number> = {
  1: 1,
  2: 2,
  3: 4,
  4: 6,
  5: 10,
  6: 15,
}

/**
 * Get the display name for an activity level.
 */
export function getActivityLevelName(level: ActivityLevel): string {
  return ACTIVITY_LEVEL_NAMES[level]
}

/**
 * Get the configuration for an activity level.
 */
export function getActivityLevelConfig(level: ActivityLevel): ActivityLevelConfig {
  return ACTIVITY_LEVEL_CONFIGS[level]
}

/**
 * Check if a faction should advance to the next activity level.
 * Returns the threshold turns for comparison (minimum turns needed).
 */
export function getActivityLevelThreshold(level: ActivityLevel): number {
  return ACTIVITY_LEVEL_CONFIGS[level].minTurns
}

/**
 * Get the next activity level, clamped at 7 (Total War).
 */
export function nextActivityLevel(level: ActivityLevel): ActivityLevel {
  assertInRange(level, 0, 6)
  const next = level + 1
  assertIsActivityLevel(next)
  return next
}

export function assertIsActivityLevel(value: number): asserts value is ActivityLevel {
  if (value < 0 || value > 7 || !Number.isInteger(value)) {
    throw new Error(`Invalid activity level: ${value}. Must be an integer 0-7.`)
  }
}

/**
 * Calculate the actual turns needed to progress from current level.
 * Randomized between min and max turns.
 */
export function calculateProgressionTurns(level: ActivityLevel): number {
  const config = ACTIVITY_LEVEL_CONFIGS[level]
  if (config.minTurns === Infinity) {
    return Infinity
  }
  return Math.floor(Math.random() * (config.maxTurns - config.minTurns + 1)) + config.minTurns
}

/**
 * Calculate the turns until next faction operation.
 * Randomized between min and max frequency.
 */
export function calculateOperationTurns(level: ActivityLevel): number {
  const config = ACTIVITY_LEVEL_CONFIGS[level]
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
export function rollOperationLevel(activityLevel: ActivityLevel): number {
  const config = ACTIVITY_LEVEL_CONFIGS[activityLevel]
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
 * Level 0 (offensive missions) returns 0 (no panic increase).
 */
export function getPanicIncreaseForOperation(operationLevel: number): Fixed6 {
  if (operationLevel === 0) {
    return toF6(0)
  }
  return PANIC_INCREASE_BY_OPERATION_LEVEL[operationLevel] ?? toF6(0.001)
}

/**
 * Get funding decrease for a given operation level.
 * Level 0 (offensive missions) returns 0 (no funding decrease).
 */
export function getFundingDecreaseForOperation(operationLevel: number): number {
  if (operationLevel === 0) {
    return 0
  }
  return FUNDING_DECREASE_BY_OPERATION_LEVEL[operationLevel] ?? 1
}

/**
 * Check if faction should advance activity level.
 * Also handles the random threshold check.
 */
export function shouldAdvanceActivityLevel(faction: Faction, targetTurns: number): boolean {
  const config = ACTIVITY_LEVEL_CONFIGS[faction.activityLevel]
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
