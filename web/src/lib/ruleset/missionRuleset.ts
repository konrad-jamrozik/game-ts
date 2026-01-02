import type { Actor } from '../model/actorModel'
import type { Enemy } from '../model/enemyModel'
import type { Mission } from '../model/missionModel'
import type { MissionState } from '../model/outcomeTypes'
import type { Agent, AgentCombatStats } from '../model/agentModel'
import { effectiveSkill } from './skillRuleset'
import { calculateCombatRating } from './combatRatingRuleset'
import { sum } from 'radash'
import { toF6r, f6mult, f6le } from '../primitives/fixed6'
import {
  AGENTS_COMBAT_RATING_RETREAT_THRESHOLD,
  COMBAT_INCAPACITATION_THRESHOLD,
  RETREAT_ENEMY_TO_AGENTS_COMBAT_RATING_THRESHOLD,
} from '../data_tables/constants'

/**
 * Determines if an actor can participate in battle.
 * A unit cannot participate if their effective skill falls below 10% of their base skill.
 * Also implicitly checks that HP > 0 since HP loss reduces effective skill.
 *
 * @param actor - The actor to check
 * @returns true if the actor can participate in battle, false otherwise
 */
export function canParticipateInBattle(actor: Actor): boolean {
  return !isIncapacitated(actor)
}

/**
 * Determines if an actor is incapacitated.
 * A unit is incapacitated if their effective skill falls to 10% or less of their base skill.
 * This is the source of truth for incapacitation checks.
 *
 * @param actor - The actor to check
 * @returns true if the actor is incapacitated, false otherwise
 */
export function isIncapacitated(actor: Actor): boolean {
  const threshold = toF6r(f6mult(actor.skill, COMBAT_INCAPACITATION_THRESHOLD))
  return f6le(effectiveSkill(actor), threshold)
}

/**
 * Checks if a mission state represents a concluded mission.
 * Concluded states: Won, Wiped, Retreated, Expired
 */
export function isConcludedMissionState(state: MissionState): boolean {
  return state === 'Won' || state === 'Wiped' || state === 'Retreated' || state === 'Expired'
}

export function isMissionConcluded(mission: Mission): boolean {
  return isConcludedMissionState(mission.state)
}

/**
 * Result of retreat evaluation containing the decision and calculated values.
 */
export type RetreatResult = {
  shouldRetreat: boolean
  agentsTotalOriginalCombatRating: number
  agentsTotalCurrentCombatRating: number
  enemyToAgentsCombatRatingRatio: number
}

/**
 * Determines whether agents should retreat from battle based on their current combat rating
 * and enemy strength.
 *
 * Retreat occurs when BOTH of the following conditions are met:
 * 1. Agents' total current combat rating is less than RETREAT_THRESHOLD (50%) of their original combat rating
 * 2. Enemy total combat rating is at least RETREAT_ENEMY_COMBAT_RATING_THRESHOLD (80%) of agents' current combat rating
 *
 * This ensures agents only retreat when they are both weakened AND facing a strong enemy force,
 * preventing unnecessary retreats when agents are weakened but enemies are also significantly damaged.
 *
 * @param activeAgents - Array of agents that can currently participate in battle
 * @param agentStats - Array of combat statistics for each agent, including their initial combat rating
 * @param activeEnemies - Array of enemies that can currently participate in battle
 * @returns RetreatResult containing the retreat decision and calculated values for logging
 */
export function shouldRetreat(
  activeAgents: Agent[],
  agentStats: AgentCombatStats[],
  activeEnemies: Enemy[],
): RetreatResult {
  const agentsTotalOriginalCombatRating = sum(agentStats, (stats) => stats.initialCombatRating)
  const agentsTotalCurrentCombatRating = sum(activeAgents, (agent) => calculateCombatRating(agent))

  const agentsCombatRatingThreshold = agentsTotalOriginalCombatRating * AGENTS_COMBAT_RATING_RETREAT_THRESHOLD

  // Check if agents' combat rating is below threshold of 50% of original combat rating
  const agentsBelowThreshold = agentsTotalCurrentCombatRating < agentsCombatRatingThreshold

  // Check if enemy combat rating is at least 80% of agents' current combat rating
  const enemyTotalCurrentCombatRating = sum(activeEnemies, (enemy) => calculateCombatRating(enemy))
  const enemyToAgentsCombatRatingRatio =
    agentsTotalCurrentCombatRating > 0 ? enemyTotalCurrentCombatRating / agentsTotalCurrentCombatRating : 0
  const enemyAboveThreshold = enemyToAgentsCombatRatingRatio >= RETREAT_ENEMY_TO_AGENTS_COMBAT_RATING_THRESHOLD

  // Retreat when agents are below threshold AND enemy combat rating is at least 80% of agent combat rating
  const result = {
    shouldRetreat: agentsBelowThreshold && enemyAboveThreshold,
    agentsTotalOriginalCombatRating,
    agentsTotalCurrentCombatRating,
    enemyToAgentsCombatRatingRatio,
  }
  return result
}
