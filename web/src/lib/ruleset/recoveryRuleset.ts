import { ceil, div } from '../primitives/mathPrimitives'
import { assertAboveZero, assertLessThan } from '../primitives/assertPrimitives'
import { toF, toF6, f6div, type Fixed6 } from '../primitives/fixed6'

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
