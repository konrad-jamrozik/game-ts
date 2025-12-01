import { f6add } from '../utils/fixed6Utils'
import { f6cmp, f6eq, type Fixed6 } from '../primitives/fixed6Primitives'
import type { Actor } from '../model/model'
import type { Agent } from '../model/agentModel'
import { effectiveSkill } from '../ruleset/skillRuleset'
import { compareIdsNumeric } from '../primitives/stringPrimitives'

/**
 * Adds skill points to an agent.
 * Use this function instead of directly modifying agent.skill to centralize skill arithmetic operations.
 */
export function addSkill(agent: Agent, amount: Fixed6): void {
  agent.skill = f6add(agent.skill, amount)
}

/**
 * Adds skill points from training to an agent.
 * Use this function instead of directly modifying agent.skillFromTraining to centralize skill arithmetic operations.
 */
export function addSkillFromTraining(agent: Agent, amount: Fixed6): void {
  agent.skillFromTraining = f6add(agent.skillFromTraining, amount)
}

// Helper function to compare actors by effective skill descending (higher skill first), then by ID if skills are equal
export function compareActorsBySkillDescending(actorA: Actor, actorB: Actor): number {
  const skillA = effectiveSkill(actorA)
  const skillB = effectiveSkill(actorB)
  if (f6eq(skillA, skillB)) {
    return compareIdsNumeric(actorA.id, actorB.id)
  }
  // Return the actor with higher effective skill as first.
  // Explanation:
  // sort() will return actorA as first if output is negative, i.e. when skillB < skillA.
  return f6cmp(skillB, skillA)
}
