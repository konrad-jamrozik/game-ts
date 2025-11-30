import { ceil, div } from '../../utils/mathUtils'
import { assertAboveZero, assertInteger } from '../../utils/assert'

// KJA add battery of tests protecting against float issues
// Note that e.g. hitPointsLostPct = 0.8 and recoverPct = 0.02,
// so we end up with 0.8 / 0.02 which may cause float imprecision issues,
// and ceil will not help. Because of 0.8 / 0.02 = is 40.00000000000001,
// then ceil will make it 41, but we want 40.
// But we must keep ceil, as if recovery would be 3.1, we do want for it to be 4.
export function getRecoveryTurns(hitPoints: number, damage: number, hitPointsRecoveryPct: number): number {
  assertAboveZero(damage, `damage must be above 0, got: ${damage}`)
  assertInteger(hitPoints, `hitPoints must be a whole integer, got: ${hitPoints}`)
  assertInteger(damage, `damage must be a whole integer, got: ${damage}`)
  assertInteger(hitPointsRecoveryPct, `hitPointsRecoveryPct must be a whole integer, got: ${hitPointsRecoveryPct}`)

  const hitPointsLostPct = Math.min(div(damage, hitPoints) * 100, 100)
  const recoveryTurns = ceil(div(hitPointsLostPct, hitPointsRecoveryPct))

  // KJA add this fix once tests prove it is needed:
  // Round to 6 decimal places to eliminate floating point artifacts before applying ceil
  // const roundedRecoveryTurns = round6(rawRecoveryTurns)
  // return ceil(roundedRecoveryTurns)
  return recoveryTurns
}
