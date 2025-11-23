import { div } from './mathUtils'
import type { Actor, Agent, Enemy } from '../model/model'
import {
  addFixed2,
  compareFixed2,
  equalsFixed2,
  floorFixed2,
  fromFixed2Decimal,
  toFixed2,
  type Fixed2,
} from '../model/fixed2'
import { compareIdsNumeric } from './stringUtils'

// Type guard function to determine if an Actor is an Agent
export function isAgent(actor: Actor): actor is Agent {
  return 'turnHired' in actor
}

/**
 * Adds skill points to an agent.
 * Use this function instead of directly modifying agent.skill to centralize skill arithmetic operations.
 */
export function addSkill(agent: Agent, amount: Fixed2): void {
  agent.skill = addFixed2(agent.skill, amount)
}

/**
 * Adds skill points from training to an agent.
 * Use this function instead of directly modifying agent.skillFromTraining to centralize skill arithmetic operations.
 */
export function addSkillFromTraining(agent: Agent, amount: Fixed2): void {
  agent.skillFromTraining = addFixed2(agent.skillFromTraining, amount)
}

// Calculates the effective skill of an actor based on hit points lost and exhaustion
// Refer to about_agents.md for details
export function effectiveSkill(actor: Actor): Fixed2 {
  const hitPointsLost = actor.maxHitPoints - actor.hitPoints
  const hitPointsLostRatio = div(hitPointsLost, actor.maxHitPoints)
  const hitPointsReduction = Math.max(1 - hitPointsLostRatio, 0)

  // First 5 points of exhaustion have no impact
  const noImpactExhaustion = 5
  const exhaustionReduction = Math.max(1 - Math.max(actor.exhaustion - noImpactExhaustion, 0) / 100, 0)

  // KJA 1 the remainder of calculations on Fixed2 here is a good example how this could be abstracted.
  // something like
  // const result: Fixed2 = fixed2mult(actor.skill, hitPointsReduction, exhaustionReduction)
  // return floorFixed2(result)

  // Convert skill from Fixed2 to decimal for calculations
  const skillDecimal = fromFixed2Decimal(actor.skill)
  const result = skillDecimal * hitPointsReduction * exhaustionReduction

  // Convert result to Fixed2 and round down to 2 decimal places
  return floorFixed2(toFixed2(result))
}

// Helper function to get effective skill of an actor (agent or enemy)
export function getActorEffectiveSkill(actor: Agent | Enemy): Fixed2 {
  return effectiveSkill(actor)
}

// Helper function to compare actors by effective skill descending (higher skill first), then by ID if skills are equal
export function compareActorsBySkillDescending(actorA: Agent | Enemy, actorB: Agent | Enemy): number {
  const skillA = getActorEffectiveSkill(actorA)
  const skillB = getActorEffectiveSkill(actorB)
  if (equalsFixed2(skillA, skillB)) {
    return compareIdsNumeric(actorA.id, actorB.id)
  }
  // Return the actor with higher effective skill as first.
  // Explanation:
  // sort() will return actorA as first if output is negative, i.e. when skillB < skillA.
  return compareFixed2(skillB, skillA)
}
