import { div } from '../../utils/mathUtils'

export function getRecoveryTurns(damage: number, hitPoints: number, hitPointsRecoveryPct: number): number {
  const hitPointsLostPercentage = Math.min(div(damage, hitPoints) * 100, 100)
  const recoveryTurns = Math.ceil(div(hitPointsLostPercentage, hitPointsRecoveryPct))
  return recoveryTurns
}
