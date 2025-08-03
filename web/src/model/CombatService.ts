/**
 * Combat and dice rolling utilities for mission evaluation
 */

/**
 * Rolls a die (1-100 inclusive)
 */
export function rollDie(): number {
  return Math.floor(Math.random() * 100) + 1
}

/**
 * Calculates the roll threshold: 100 - skill + difficulty
 */
export function calculateRollThreshold(skill: number, difficulty: number): number {
  return 100 - skill + difficulty
}

/**
 * Determines if a roll is successful against a threshold
 */
export function isRollSuccessful(roll: number, threshold: number): boolean {
  return roll > threshold
}

/**
 * Calculates damage based on roll and threshold
 * Returns damage amount if roll failed, 0 if successful
 */
export function calculateDamage(roll: number, threshold: number): number {
  return roll < threshold ? threshold - roll : 0
}

/**
 * Performs a skill check against difficulty
 */
// KJA actually use this function
export function performSkillCheck(
  skill: number,
  difficulty: number,
): {
  roll: number
  threshold: number
  successful: boolean
  damage?: number
} {
  const roll = rollDie()
  const threshold = calculateRollThreshold(skill, difficulty)
  const successful = isRollSuccessful(roll, threshold)
  const damage = successful ? 0 : calculateDamage(roll, threshold)

  return {
    roll,
    threshold,
    successful,
    damage,
  }
}

/**
 * Calculates recovery time based on hit points lost
 */
// KJA actually use this function
export function calculateRecoveryTime(hitPointsLost: number, maxHitPoints: number): number {
  if (hitPointsLost <= 0) {
    return 0
  }

  const hitPointsLostPercentage = (hitPointsLost / maxHitPoints) * 100
  return Math.ceil(hitPointsLostPercentage / 2)
}

/**
 * Determines if an agent is terminated based on hit points
 */
// KJA actually use this function
export function isAgentTerminated(currentHitPoints: number): boolean {
  return currentHitPoints <= 0
}
