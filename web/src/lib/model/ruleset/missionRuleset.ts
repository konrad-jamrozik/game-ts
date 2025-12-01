import type { AgentCombatStats } from '../../turn_advancement/evaluateAttack'
import { effectiveSkill } from '../../utils/actorUtils'
import { agV } from '../agents/AgentView'
import { f6div, f6ge, f6lt, f6mult, f6sum, type Fixed6, toF, toF6, toF6r } from '../../primitives/fixed6Primitives'
import type { Agent, Enemy, MissionSite } from '../model'
import { AGENTS_SKILL_RETREAT_THRESHOLD, RETREAT_ENEMY_TO_AGENTS_SKILL_THRESHOLD } from './constants'

export function isMissionSiteConcluded(missionSite: MissionSite): boolean {
  return missionSite.state === 'Successful' || missionSite.state === 'Failed' || missionSite.state === 'Expired'
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
  const aliveAgents = agents.filter((agent) => agent.hitPoints > 0)
  const agentsTotalOriginalEffectiveSkill = f6sum(...agentStats.map((stats) => stats.initialEffectiveSkill))
  const agentsTotalCurrentEffectiveSkill = f6sum(...aliveAgents.map((agent) => agV(agent).effectiveSkill()))

  const agentsEffectiveSkillThreshold = toF6r(f6mult(agentsTotalOriginalEffectiveSkill, AGENTS_SKILL_RETREAT_THRESHOLD))

  // Check if agents' effective skill is below threshold
  const agentsBelowThreshold = f6lt(agentsTotalCurrentEffectiveSkill, agentsEffectiveSkillThreshold)

  // Check if enemy effective skill is at least 80% of agents' current effective skill
  const aliveEnemies = enemies.filter((enemy) => enemy.hitPoints > 0)
  const enemyTotalCurrentEffectiveSkill = f6sum(...aliveEnemies.map((enemy) => effectiveSkill(enemy)))
  const enemyToAgentsSkillRatio = toF6r(f6div(enemyTotalCurrentEffectiveSkill, agentsTotalCurrentEffectiveSkill))
  const enemyToAgentsSkillThreshold = toF6(RETREAT_ENEMY_TO_AGENTS_SKILL_THRESHOLD)
  const enemyAboveThreshold = f6ge(enemyToAgentsSkillRatio, enemyToAgentsSkillThreshold)

  console.log(
    `Retreat evaluation: ` +
      `agents current skill = ${toF(agentsTotalCurrentEffectiveSkill)}, ` +
      `agents original skill = ${toF(agentsTotalOriginalEffectiveSkill)}, ` +
      `agents threshold = ${toF(agentsEffectiveSkillThreshold)}, ` +
      `agents below threshold = ${agentsBelowThreshold}, ` +
      `enemy current skill = ${toF(enemyTotalCurrentEffectiveSkill)}, ` +
      `enemy/agents ratio = ${toF(enemyToAgentsSkillRatio)}, ` +
      `enemy/agents threshold = ${RETREAT_ENEMY_TO_AGENTS_SKILL_THRESHOLD}, ` +
      `enemy above threshold = ${enemyAboveThreshold}`,
  )
  // Retreat when agents are below threshold AND enemy skill is at least 80% of agent skill
  const result = {
    shouldRetreat: agentsBelowThreshold && enemyAboveThreshold,
    agentsTotalOriginalEffectiveSkill,
    agentsTotalCurrentEffectiveSkill,
    enemyToAgentsSkillRatio,
  }
  return result
}
