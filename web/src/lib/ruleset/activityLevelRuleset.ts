/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
  FACTION_ACTIVITY_LEVEL_PROGRESSION_DATA,
  FACTION_OPERATION_ROLL_PROBABILITY_DATA,
  type FactionOperationRollProbabilityStats,
} from '../collections/factionStatsTables'
import { ACTIVITY_LEVEL_NAMES, type ActivityLevel, type Faction } from '../model/factionModel'
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

function getFrequency(freq: number | ''): number {
  if (freq === '') {
    return Infinity
  }
  return freq
}

function getOperationLevelWeight(weight: number | ''): number {
  if (weight === '') {
    return 0
  }
  return weight
}

function getOperationLevelWeights(
  data: FactionOperationRollProbabilityStats,
): [number, number, number, number, number, number] {
  return [
    getOperationLevelWeight(data.level1ProbPct),
    getOperationLevelWeight(data.level2ProbPct),
    getOperationLevelWeight(data.level3ProbPct),
    getOperationLevelWeight(data.level4ProbPct),
    getOperationLevelWeight(data.level5ProbPct),
    getOperationLevelWeight(data.level6ProbPct),
  ]
}

function bldActivityLevelConfig(level: ActivityLevel): ActivityLevelConfig {
  return {
    minTurns: FACTION_ACTIVITY_LEVEL_PROGRESSION_DATA[level]!.turnsMin,
    maxTurns: FACTION_ACTIVITY_LEVEL_PROGRESSION_DATA[level]!.turnsMax,
    operationFrequencyMin: getFrequency(FACTION_OPERATION_ROLL_PROBABILITY_DATA[level]!.frequencyMin),
    operationFrequencyMax: getFrequency(FACTION_OPERATION_ROLL_PROBABILITY_DATA[level]!.frequencyMax),
    operationLevelWeights: getOperationLevelWeights(FACTION_OPERATION_ROLL_PROBABILITY_DATA[level]!),
  }
}

/**
 * Activity level configurations indexed by activity level (0-7).
 * Based on the documentation in about_faction_activity_level.md
 */
export const ACTIVITY_LEVEL_CONFIGS: Record<ActivityLevel, ActivityLevelConfig> = {
  0: bldActivityLevelConfig(0),
  1: bldActivityLevelConfig(1),
  2: bldActivityLevelConfig(2),
  3: bldActivityLevelConfig(3),
  4: bldActivityLevelConfig(4),
  5: bldActivityLevelConfig(5),
  6: bldActivityLevelConfig(6),
  7: bldActivityLevelConfig(7),
}

// KJA1 these _BY_OPERATION_LEVEL constants should become a data table
/**
 * Panic increase per operation level when a faction operation succeeds (mission not completed).
 */
export const PANIC_INCREASE_BY_OPERATION_LEVEL: Record<number, Fixed6> = {
  1: toF6(0.0002), // Soft operations - 0.02%
  2: toF6(0.001), // Violent but small-scale - 0.1%
  3: toF6(0.003), // Strategic threats - 0.3%
  4: toF6(0.01), // Regional destabilization - 1%
  5: toF6(0.03), // Global conflict - 3%
  6: toF6(0), // Existential - 0% (no panic increase, but game over on failure)
}

/**
 * Money reward per operation level when a defensive mission is completed successfully.
 */
export const MONEY_REWARD_BY_OPERATION_LEVEL: Record<number, number> = {
  1: 10,
  2: 30,
  3: 100,
  4: 300,
  5: 1000,
  6: 0, // Level 6 has no rewards
}

/**
 * Funding reward per operation level when a defensive mission is completed successfully.
 * Funding penalty per operation level when a defensive mission fails (expires or is lost).
 */
export const FUNDING_REWARD_BY_OPERATION_LEVEL: Record<number, number> = {
  1: 0,
  2: 5,
  3: 20,
  4: 40,
  5: 80,
  6: 0, // Level 6 has no rewards
}

/**
 * Funding penalty per operation level when a faction operation succeeds (mission not completed).
 */
export const FUNDING_PENALTY_BY_OPERATION_LEVEL: Record<number, number> = {
  1: 0,
  2: 1,
  3: 4,
  4: 8,
  5: 16,
  6: 0, // Level 6 has no penalties (but game over on failure)
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
 * Only called for defensive missions (operationLevel 1-6).
 * Level 0 check is kept for safety but should not occur in practice.
 */
export function getPanicIncreaseForOperation(operationLevel: number): Fixed6 {
  if (operationLevel === 0) {
    return toF6(0)
  }
  return PANIC_INCREASE_BY_OPERATION_LEVEL[operationLevel] ?? toF6(0.001)
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
  return FUNDING_PENALTY_BY_OPERATION_LEVEL[operationLevel] ?? 0
}

/**
 * Get money reward for a given operation level when defensive mission succeeds.
 * Only called for defensive missions (operationLevel 1-6).
 */
export function getMoneyRewardForOperation(operationLevel: number): number {
  if (operationLevel === 0) {
    return 0
  }
  return MONEY_REWARD_BY_OPERATION_LEVEL[operationLevel] ?? 0
}

/**
 * Get funding reward for a given operation level when defensive mission succeeds.
 * Only called for defensive missions (operationLevel 1-6).
 */
export function getFundingRewardForOperation(operationLevel: number): number {
  if (operationLevel === 0) {
    return 0
  }
  return FUNDING_REWARD_BY_OPERATION_LEVEL[operationLevel] ?? 0
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
