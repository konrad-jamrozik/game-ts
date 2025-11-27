import { f2Add, f2Compare, f2Equals, f2Mult, type Fixed2 } from '../model/fixed2'
import type { Actor, Agent, Enemy } from '../model/model'
import { NO_IMPACT_EXHAUSTION } from '../model/ruleset/constants'
import { assertNonNeg } from './assert'
import { div, nonNeg } from './mathUtils'
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
  agent.skill = f2Add(agent.skill, amount)
}

/**
 * Adds skill points from training to an agent.
 * Use this function instead of directly modifying agent.skillFromTraining to centralize skill arithmetic operations.
 */
export function addSkillFromTraining(agent: Agent, amount: Fixed2): void {
  agent.skillFromTraining = f2Add(agent.skillFromTraining, amount)
}

// Helper function to compare actors by effective skill descending (higher skill first), then by ID if skills are equal
export function compareActorsBySkillDescending(actorA: Agent | Enemy, actorB: Agent | Enemy): number {
  const skillA = getActorEffectiveSkill(actorA)
  const skillB = getActorEffectiveSkill(actorB)
  if (f2Equals(skillA, skillB)) {
    return compareIdsNumeric(actorA.id, actorB.id)
  }
  // Return the actor with higher effective skill as first.
  // Explanation:
  // sort() will return actorA as first if output is negative, i.e. when skillB < skillA.
  return f2Compare(skillB, skillA)
}

// Helper function to get effective skill of an actor (agent or enemy)
export function getActorEffectiveSkill(actor: Agent | Enemy): Fixed2 {
  return effectiveSkill(actor)
}

// Calculates the effective skill of an actor based on hit points lost and exhaustion
// Refer to about_agents.md for details
export function effectiveSkill(actor: Actor): Fixed2 {
  const hitPointsLost = actor.maxHitPoints - actor.hitPoints
  const hitPointsMalus = div(hitPointsLost, actor.maxHitPoints)
  const hitPointsMult = assertNonNeg(1 - hitPointsMalus)

  const exhaustionMalus = nonNeg(actor.exhaustion - NO_IMPACT_EXHAUSTION) / 100
  const exhaustionMult = nonNeg(1 - exhaustionMalus)

  return f2Mult(actor.skill, hitPointsMult, exhaustionMult)
}
