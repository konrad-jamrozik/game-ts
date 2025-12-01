import { ceil, div } from '../primitives/mathPrimitives'
import { assertAboveZero, assertInteger, assertLessThan } from '../primitives/assertPrimitives'

export function getRecoveryTurns(hitPoints: number, damage: number, hitPointsRecoveryPct: number): number {
  assertAboveZero(damage, `damage must be above 0, got: ${damage}`)
  assertLessThan(damage, hitPoints, `damage must be less than hitPoints, got: ${damage} < ${hitPoints}`)
  assertInteger(hitPoints, `hitPoints must be a whole integer, got: ${hitPoints}`)
  assertInteger(damage, `damage must be a whole integer, got: ${damage}`)
  assertInteger(hitPointsRecoveryPct, `hitPointsRecoveryPct must be a whole integer, got: ${hitPointsRecoveryPct}`)

  const hitPointsLostPct = Math.min(div(damage, hitPoints) * 100, 100)
  const recoveryTurns = ceil(div(hitPointsLostPct, hitPointsRecoveryPct))

  // KJA3 add this once it is needed, which will be once we support Fixed6 recovery pct
  // Round to 6 decimal places to eliminate floating point artifacts before applying ceil
  // const roundedRecoveryTurns = round6(rawRecoveryTurns)
  // return ceil(roundedRecoveryTurns)
  return recoveryTurns
}
