import type { Actor } from '../model/actorModel'
import type { Mission } from '../model/missionModel'
import type { AgentId } from '../model/modelIds'
import { f6mult, toF, f6c0, f6c100, toF6 } from '../primitives/fixed6'
import { effectiveSkill } from './skillRuleset'
import { isAgent } from '../model_utils/agentUtils'

const MAX_WEAPON_DAMAGE_FOR_CR = 50

/**
 * Calculates the Combat Rating (CR) for an actor (agent or enemy).
 * Formula: effective skill * (1 + (hit points / 100) + (min(50, weapon damage) / 100))
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

  // Calculate multiplier: 1 + (hit points / 100) + (min(50,weapon damage) / 100)
  const hpMultiplier = toF(effectiveHitPoints) / 100
  const damageMultiplier = Math.min(MAX_WEAPON_DAMAGE_FOR_CR, actor.weapon.damage) / 100
  const multiplier = 1 + hpMultiplier + damageMultiplier

  return f6mult(skill, multiplier)
}

/**
 * Calculates the initial agent combat rating.
 * This is the combat rating of a newly hired agent with default values:
 * - skill: 100
 * - exhaustion: 0%
 * - hit points: 30
 * - max hit points: 30
 * - weapon damage: 10
 */
function calculateInitialAgentCombatRating(): number {
  // Initial agent values (matching initialAgent from agentFactory)
  const initialSkill = f6c100 // 100
  const initialExhaustionPct = f6c0 // 0%
  const initialHitPoints = toF6(30)
  const initialMaxHitPoints = toF6(30)
  const initialWeaponDamage = 10

  // Create a minimal actor-like object for calculation
  const initialAgentLike: Actor = {
    id: 'agent-ini' as AgentId,
    skill: initialSkill,
    exhaustionPct: initialExhaustionPct,
    hitPoints: initialHitPoints,
    maxHitPoints: initialMaxHitPoints,
    weapon: { damage: initialWeaponDamage, minDamage: 5, maxDamage: 15 },
  }

  return calculateCombatRating(initialAgentLike)
}

/**
 * Calculates the combat rating for a mission.
 * Combat rating is the sum of all enemy combat ratings, normalized by dividing
 * by the initial hired agent combat rating.
 *
 * @param mission - The mission to calculate combat rating for
 * @returns The normalized combat rating as a number (to be formatted with 2 decimals in UI)
 */
export function calculateMissionCombatRating(mission: Mission): number {
  const totalCombatRating = mission.enemies.reduce((sum, enemy) => sum + calculateCombatRating(enemy), 0)

  // Calculate initial agent combat rating
  const initialAgentCombatRating = calculateInitialAgentCombatRating()

  // Normalize by dividing by initial agent combat rating
  return totalCombatRating / initialAgentCombatRating
}
