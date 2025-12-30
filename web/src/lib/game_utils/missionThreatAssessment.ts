import type { Actor } from '../model/actorModel'
import type { Mission } from '../model/missionModel'
import { f6mult, toF, f6c0 } from '../primitives/fixed6'
import { initialAgent } from '../factories/agentFactory'
import { effectiveSkill } from '../ruleset/skillRuleset'
import { isAgent } from '../model_utils/agentUtils'

/**
 * Calculates the threat assessment for a mission.
 * Threat assessment is the sum of all enemy threat assessments, normalized by dividing
 * by the initial hired agent threat assessment.
 *
 * @param mission - The mission to calculate threat assessment for
 * @returns The normalized threat assessment as a number (to be formatted with 2 decimals in UI)
 */
export function calculateMissionThreatAssessment(mission: Mission): number {
  const totalThreat = mission.enemies.reduce((sum, enemy) => sum + calculateCombatRating(enemy), 0)

  // Calculate initial agent threat assessment
  const initialAgentCombatRating = calculateCombatRating(initialAgent)

  // Normalize by dividing by initial agent threat assessment
  return totalThreat / initialAgentCombatRating
}

/**
 * Calculates the Combat Rating (CR) for an actor (agent or enemy).
 * Formula: effective skill * (1 + (hit points / 100) + (weapon damage * 2 / 100))
 *
 * For terminated agents, treats them as having full hit points and 0% exhaustion.
 *
 * @param actor - The actor to calculate combat rating for
 * @returns The combat rating as a number
 */
export function calculateCombatRating(actor: Actor): number {
  // Special case: terminated agents are treated as having full hit points and 0% exhaustion
  const isTerminatedAgent = isAgent(actor) && (actor.state === 'KIA' || actor.state === 'Sacked')

  // For terminated agents, use maxHitPoints for calculations
  const effectiveHitPoints = isTerminatedAgent ? actor.maxHitPoints : actor.hitPoints

  // Create a modified actor for effective skill calculation if terminated
  const actorForSkill = isTerminatedAgent ? { ...actor, hitPoints: actor.maxHitPoints, exhaustionPct: f6c0 } : actor

  const skill = effectiveSkill(actorForSkill)

  // Calculate multiplier: 1 + (hit points / 100) + (weapon damage * 2 / 100)
  const hpMultiplier = toF(effectiveHitPoints) / 100
  const damageMultiplier = (actor.weapon.damage * 2) / 100
  const multiplier = 1 + hpMultiplier + damageMultiplier

  return f6mult(skill, multiplier)
}
