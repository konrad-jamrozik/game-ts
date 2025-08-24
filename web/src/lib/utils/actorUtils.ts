import { floor } from './mathUtils'
import type { Actor } from '../model/model'

// Calculates the effective skill of an actor based on hit points lost and exhaustion
// Refer to about_agents.md for details
export function effectiveSkill(actor: Actor): number {
  const hitPointsLost = actor.maxHitPoints - actor.hitPoints
  const hitPointsReduction = Math.max(1 - (actor.maxHitPoints > 0 ? hitPointsLost / actor.maxHitPoints : 0), 0)
  // First 5 points of exhaustion have no impact
  const exhaustionReduction = Math.max(1 - Math.max(actor.exhaustion - 5, 0) / 100, 0)

  const result = actor.skill * hitPointsReduction * exhaustionReduction
  return floor(result)
}
