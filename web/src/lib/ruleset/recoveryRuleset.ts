import { ceil, div } from '../primitives/mathPrimitives'
import { assertAboveZero, assertLessThan } from '../primitives/assertPrimitives'
import { toF, toF6, f6div, f6sub, f6lt, type Fixed6 } from '../primitives/fixed6'
import type { Agent } from '../model/agentModel'

export function getRecoveryTurns(maxHitPoints: number, damage: Fixed6, hitPointsRecoveryPct: Fixed6): number {
  const damageNum = toF(damage)
  assertAboveZero(damageNum, `damage must be above 0, got: ${damageNum}`)
  assertLessThan(damageNum, maxHitPoints, `damage must be less than maxHitPoints, got: ${damageNum} < ${maxHitPoints}`)

  const hitPointsRecoveryPctNum = toF(hitPointsRecoveryPct)
  const maxHitPointsF6 = toF6(maxHitPoints)
  const hitPointsLostPct = Math.min(f6div(damage, maxHitPointsF6) * 100, 100)
  const recoveryTurns = ceil(div(hitPointsLostPct, hitPointsRecoveryPctNum))

  return recoveryTurns
}

/**
 * Calculates the remaining recovery turns for an agent based on their current hit points deficit.
 * Returns 0 if the agent is at full health or not recovering.
 */
export function getRemainingRecoveryTurns(agent: Agent, hitPointsRecoveryPct: Fixed6): number {
  const maxHitPointsF6 = toF6(agent.maxHitPoints)
  if (f6lt(agent.hitPoints, maxHitPointsF6)) {
    const remainingDamage = f6sub(maxHitPointsF6, agent.hitPoints)
    return getRecoveryTurns(agent.maxHitPoints, remainingDamage, hitPointsRecoveryPct)
  }
  return 0
}
