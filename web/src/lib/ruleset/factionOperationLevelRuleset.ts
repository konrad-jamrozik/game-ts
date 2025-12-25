import { getFactionOperationByLevel, getActivityLevelByOrd } from '../data_tables/dataTableUtils'
import type { FactionActivityLevelOrd } from '../model/factionModel'
import { toF6, type Fixed6 } from '../primitives/fixed6'

/**
 * Calculate the turns until next faction operation.
 * Randomized between min and max frequency.
 */
export function calculateOperationTurns(level: FactionActivityLevelOrd): number {
  const config = getActivityLevelByOrd(level)
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
  const config = getActivityLevelByOrd(activityLevel)
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
  const stats = getFactionOperationByLevel(operationLevel)
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
  const stats = getFactionOperationByLevel(operationLevel)
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
  const stats = getFactionOperationByLevel(operationLevel)
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
  const stats = getFactionOperationByLevel(operationLevel)
  return stats.fundingReward
}
