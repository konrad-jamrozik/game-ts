import type { Actor } from '../model/model'
import type { Agent } from '../model/agentModel'
import { NO_IMPACT_EXHAUSTION } from './constants'
import { assertNonNeg } from '../primitives/assertPrimitives'
import { div, nonNeg } from '../primitives/mathPrimitives'
import { f6mult, f6sum, toF, toF6r, type Fixed6 } from '../primitives/fixed6'

// Calculates the effective skill of an actor based on hit points lost and exhaustion
// Refer to about_agents.md for details
export function effectiveSkill(actor: Actor): Fixed6 {
  const hitPointsLost = actor.maxHitPoints - actor.hitPoints
  const hitPointsMalus = div(hitPointsLost, actor.maxHitPoints)
  const hitPointsMult = assertNonNeg(1 - hitPointsMalus)

  const exhaustionMalus = nonNeg(actor.exhaustion - NO_IMPACT_EXHAUSTION) / 100
  const exhaustionMult = nonNeg(1 - exhaustionMalus)

  return toF6r(f6mult(actor.skill, hitPointsMult, exhaustionMult))
}

/**
 * Calculates the value contribution from an agent based on their effective skill and a constant multiplier.
 * Formula: (agent.effectiveSkill() / 100) * multiplier
 *
 * This is the source of truth for skill-based value calculations.
 *
 * @param agent - The agent view to calculate the contribution for
 * @param value - The value to multiply the skill coefficient by (e.g., AGENT_CONTRACTING_INCOME or AGENT_ESPIONAGE_INTEL)
 * @returns The calculated value contribution as a Fixed6
 */
export function getAgentSkillBasedValue(agent: Agent, value: number): Fixed6 {
  const skillCoefficient = toF(effectiveSkill(agent)) / 100
  return toF6r(skillCoefficient * value)
}

/**
 * Sums skill-based values from multiple agents.
 * Iterates over agents and accumulates their skill-based contributions.
 *
 * @param agents - Array of agent views to sum values from
 * @param value - The value (e.g., AGENT_CONTRACTING_INCOME or AGENT_ESPIONAGE_INTEL)
 * @returns The total sum as a number
 */
export function sumAgentSkillBasedValues(agents: readonly Agent[], value: number): Fixed6 {
  const values = agents.map((agent) => getAgentSkillBasedValue(agent, value))
  const sum = f6sum(...values)
  return sum
}
