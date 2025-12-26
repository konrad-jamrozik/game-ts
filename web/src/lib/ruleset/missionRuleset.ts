import type { Actor } from '../model/actorModel'
import type { Enemy } from '../model/enemyModel'
import type { Mission } from '../model/missionModel'
import type { MissionState } from '../model/outcomeTypes'
import type { Agent, AgentCombatStats } from '../model/agentModel'
import { effectiveSkill } from './skillRuleset'
import { f6c0, toF6, f6div, f6ge, f6gt, f6le, f6lt, f6mult, f6sumBy, type Fixed6, toF6r } from '../primitives/fixed6'
import {
  AGENTS_SKILL_RETREAT_THRESHOLD,
  COMBAT_INCAPACITATION_THRESHOLD,
  RETREAT_ENEMY_TO_AGENTS_SKILL_THRESHOLD,
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
  const threshold = toF6(f6mult(actor.skill, COMBAT_INCAPACITATION_THRESHOLD))
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
  agentsTotalOriginalEffectiveSkill: Fixed6
  agentsTotalCurrentEffectiveSkill: Fixed6
  enemyToAgentsSkillRatio: Fixed6
}

/**
 * Determines whether agents should retreat from battle based on their current combat effectiveness
 * and enemy strength.
 *
 * Retreat occurs when BOTH of the following conditions are met:
 * 1. Agents' total current effective skill is less than RETREAT_THRESHOLD (50%) of their original effective skill
 * 2. Enemy total effective skill is at least RETREAT_ENEMY_SKILL_THRESHOLD (80%) of agents' current effective skill
 *
 * This ensures agents only retreat when they are both weakened AND facing a strong enemy force,
 * preventing unnecessary retreats when agents are weakened but enemies are also significantly damaged.
 *
 * @param agents - Array of all agents in the battle (alive and terminated)
 * @param agentStats - Array of combat statistics for each agent, including their initial effective skill
 * @param enemies - Array of all enemies in the battle (alive and terminated)
 * @returns RetreatResult containing the retreat decision and calculated values for logging
 */
export function shouldRetreat(agents: Agent[], agentStats: AgentCombatStats[], enemies: Enemy[]): RetreatResult {
  const aliveAgents = agents.filter((agent) => f6gt(agent.hitPoints, f6c0))
  const agentsTotalOriginalEffectiveSkill = f6sumBy(agentStats, (stats) => stats.initialEffectiveSkill)
  const agentsTotalCurrentEffectiveSkill = f6sumBy(aliveAgents, (agent) => effectiveSkill(agent))

  const agentsEffectiveSkillThreshold = toF6r(f6mult(agentsTotalOriginalEffectiveSkill, AGENTS_SKILL_RETREAT_THRESHOLD))

  // Check if agents' effective skill is below threshold of 50% of original effective skill
  const agentsBelowThreshold = f6lt(agentsTotalCurrentEffectiveSkill, agentsEffectiveSkillThreshold)

  // Check if enemy effective skill is at least 80% of agents' current effective skill
  const aliveEnemies = enemies.filter((enemy) => f6gt(enemy.hitPoints, f6c0))
  const enemyTotalCurrentEffectiveSkill = f6sumBy(aliveEnemies, (enemy) => effectiveSkill(enemy))
  const enemyToAgentsSkillRatio = toF6r(f6div(enemyTotalCurrentEffectiveSkill, agentsTotalCurrentEffectiveSkill))
  const enemyToAgentsSkillThreshold = toF6(RETREAT_ENEMY_TO_AGENTS_SKILL_THRESHOLD)
  const enemyAboveThreshold = f6ge(enemyToAgentsSkillRatio, enemyToAgentsSkillThreshold)

  // console.log(
  //   `Retreat evaluation: ` +
  //     `agents current skill = ${toF(agentsTotalCurrentEffectiveSkill)}, ` +
  //     `agents original skill = ${toF(agentsTotalOriginalEffectiveSkill)}, ` +
  //     `agents threshold = ${toF(agentsEffectiveSkillThreshold)}, ` +
  //     `agents below threshold = ${agentsBelowThreshold}, ` +
  //     `enemy current skill = ${toF(enemyTotalCurrentEffectiveSkill)}, ` +
  //     `enemy/agents ratio = ${toF(enemyToAgentsSkillRatio)}, ` +
  //     `enemy/agents threshold = ${RETREAT_ENEMY_TO_AGENTS_SKILL_THRESHOLD}, ` +
  //     `enemy above threshold = ${enemyAboveThreshold}`,
  // )
  // Retreat when agents are below threshold AND enemy skill is at least 80% of agent skill
  const result = {
    shouldRetreat: agentsBelowThreshold && enemyAboveThreshold,
    agentsTotalOriginalEffectiveSkill,
    agentsTotalCurrentEffectiveSkill,
    enemyToAgentsSkillRatio,
  }
  return result
}
