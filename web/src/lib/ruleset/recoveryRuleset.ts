import { ceil, div } from '../primitives/mathPrimitives'
import { assertAboveZero, assertInteger, assertLessThan } from '../primitives/assertPrimitives'
import { toF, type Fixed6 } from '../primitives/fixed6'

export function getRecoveryTurns(hitPoints: number, damage: number, hitPointsRecoveryPct: Fixed6): number {
  assertAboveZero(damage, `damage must be above 0, got: ${damage}`)
  assertLessThan(damage, hitPoints, `damage must be less than hitPoints, got: ${damage} < ${hitPoints}`)
  assertInteger(hitPoints, `hitPoints must be a whole integer, got: ${hitPoints}`)
  assertInteger(damage, `damage must be a whole integer, got: ${damage}`)

  const hitPointsRecoveryPctNum = toF(hitPointsRecoveryPct)
  const hitPointsLostPct = Math.min(div(damage, hitPoints) * 100, 100)
  const recoveryTurns = ceil(div(hitPointsLostPct, hitPointsRecoveryPctNum))

  // KJA add this and test for this, now that we support Fixed6 recovery pct
  // Round to 6 decimal places to eliminate floating point artifacts before applying ceil
  // const roundedRecoveryTurns = round6(rawRecoveryTurns)
  // return ceil(roundedRecoveryTurns)
  return recoveryTurns
}
