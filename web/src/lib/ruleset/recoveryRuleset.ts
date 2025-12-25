import { ceil, div } from '../primitives/mathPrimitives'
import { assertAboveZero, assertLessThan } from '../primitives/assertPrimitives'
import { toF, f6div, f6sub, f6lt, type Fixed6 } from '../primitives/fixed6'
import type { Agent } from '../model/agentModel'

export function getRecoveryTurns(maxHitPoints: Fixed6, damage: Fixed6, hitPointsRecoveryPct: Fixed6): number {
  const damageNum = toF(damage)
  assertAboveZero(damageNum, `damage must be above 0, got: ${damageNum}`)
  const maxHitPointsNum = toF(maxHitPoints)
  // KJA1 use Fixed6-native assert instead of these conversions
  assertLessThan(
    damageNum,
    maxHitPointsNum,
    `damage must be less than maxHitPoints, got: ${damageNum} < ${maxHitPointsNum}`,
  )

  const hitPointsRecoveryPctNum = toF(hitPointsRecoveryPct)
  const hitPointsLostPct = Math.min(f6div(damage, maxHitPoints) * 100, 100)
  const recoveryTurns = ceil(div(hitPointsLostPct, hitPointsRecoveryPctNum))

  return recoveryTurns
}

/**
 * Calculates the remaining recovery turns for an agent based on their current hit points deficit.
 * Returns 0 if the agent is at full health or not recovering.
 */
export function getRemainingRecoveryTurns(agent: Agent, hitPointsRecoveryPct: Fixed6): number {
  if (f6lt(agent.hitPoints, agent.maxHitPoints)) {
    const remainingDamage = f6sub(agent.maxHitPoints, agent.hitPoints)
    return getRecoveryTurns(agent.maxHitPoints, remainingDamage, hitPointsRecoveryPct)
  }
  return 0
}
