import { div, floor } from './mathUtils'
import type { Actor, Agent, Enemy } from '../model/model'
import { agV } from '../model/agents/AgentView'
import { compareIdsNumeric } from './stringUtils'

// Type guard function to determine if an Actor is an Agent
export function isAgent(actor: Actor): actor is Agent {
  return 'turnHired' in actor
}

// Calculates the effective skill of an actor based on hit points lost and exhaustion
// Refer to about_agents.md for details
export function effectiveSkill(actor: Actor): number {
  const hitPointsLost = actor.maxHitPoints - actor.hitPoints
  const hitPointsLostRatio = div(hitPointsLost, actor.maxHitPoints)
  const hitPointsReduction = Math.max(1 - hitPointsLostRatio, 0)
  // First 5 points of exhaustion have no impact

  const exhaustionReduction = Math.max(1 - Math.max(actor.exhaustion - 5, 0) / 100, 0)

  const result = actor.skill * hitPointsReduction * exhaustionReduction

  return floor(result)
}

// Helper function to get effective skill of an actor (agent or enemy)
export function getActorEffectiveSkill(actor: Agent | Enemy): number {
  // KJA this is silly, dedup
  // Check if it's an agent by checking for turnHired property (agents have it, enemies don't)
  if ('turnHired' in actor) {
    return agV(actor).effectiveSkill()
  }
  return effectiveSkill(actor)
}

// Helper function to compare actors by effective skill descending (higher skill first), then by ID if skills are equal
export function compareActorsBySkillDescending(actorA: Agent | Enemy, actorB: Agent | Enemy): number {
  const skillA = getActorEffectiveSkill(actorA)
  const skillB = getActorEffectiveSkill(actorB)
  if (skillA === skillB) {
    return compareIdsNumeric(actorA.id, actorB.id)
  }
  // Return the actor with higher effective skill as first.
  // Explanation:
  // sort() will return actorA as first if output is negative, i.e. when actorB.skill - actorA.skill < 0 i.e. actorB.skill < actorA.skill.
  return skillB - skillA
}
