import type { Actor } from '../model/actorModel'
import type { Agent } from '../model/agentModel'
import type { Mission } from '../model/missionModel'
import { f6mult, toF } from '../primitives/fixed6'
import { initialAgent } from '../factories/agentFactory'
import { effectiveSkill } from '../ruleset/skillRuleset'

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
 * Calculates the threat multiplier for an actor based on hit points and weapon damage.
 * Formula: 1 + (hit points / 100) + (weapon damage * 2 / 100)
 *
 * @param actor - The actor to calculate threat multiplier for
 * @returns The threat multiplier as a number
 */
function getThreatMultiplier(actor: Actor): number {
  const hpMultiplier = toF(actor.hitPoints) / 100
  const damageMultiplier = (actor.weapon.damage * 2) / 100
  return 1 + hpMultiplier + damageMultiplier
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
  const multiplier = getThreatMultiplier(actor)
  return f6mult(actor.skill, multiplier)
}

/**
 * Calculates the Combat Rating (CR) for an agent.
 * CR uses the same formula as threat assessment but with effective skill instead of base skill.
 * Formula: effectiveSkill(agent) * (1 + (hit points / 100) + (weapon damage * 2 / 100))
 * Normalized by dividing by initial agent threat assessment.
 *
 * @param agent - The agent to calculate combat rating for
 * @returns The normalized combat rating as a number (to be formatted with 1 decimal in UI)
 */
export function calculateAgentCombatRating(agent: Agent): number {
  const agentEffectiveSkill = effectiveSkill(agent)
  const multiplier = getThreatMultiplier(agent)
  const agentThreat = f6mult(agentEffectiveSkill, multiplier)

  // Calculate initial agent threat assessment for normalization
  const initialAgentThreat = calculateActorThreatAssessment(initialAgent)

  // Normalize by dividing by initial agent threat assessment
  return agentThreat / initialAgentThreat
}
