import type { Actor } from '../model/actorModel'
import type { Mission } from '../model/missionModel'
import { f6mult, toF } from '../primitives/fixed6'
import { initialAgent } from '../factories/agentFactory'

/**
 * Calculates the threat assessment for a mission.
 * Threat assessment is the sum of all enemy threat assessments, normalized by dividing
 * by the initial hired agent threat assessment.
 *
 * @param mission - The mission to calculate threat assessment for
 * @returns The normalized threat assessment as a number (to be formatted with 2 decimals in UI)
 */
export function calculateMissionThreatAssessment(mission: Mission): number {
  const totalThreat = mission.enemies.reduce((sum, enemy) => sum + calculateActorThreatAssessment(enemy), 0)

  // Calculate initial agent threat assessment
  const initialAgentThreat = calculateActorThreatAssessment(initialAgent)

  // Normalize by dividing by initial agent threat assessment
  return totalThreat / initialAgentThreat
}

/**
 * Calculates the threat assessment for an actor (agent or enemy).
 * Threat assessment formula:
 * actor skill * (1 + (actor hit points / 100) + (actor weapon base damage * 2 / 100))
 *
 * @param actor - The actor to calculate threat assessment for
 * @returns The threat assessment as a number
 */
function calculateActorThreatAssessment(actor: Actor): number {
  const hpMultiplier = toF(actor.hitPoints) / 100
  const damageMultiplier = (actor.weapon.damage * 2) / 100
  const multiplier = 1 + hpMultiplier + damageMultiplier
  return f6mult(actor.skill, multiplier)
}
