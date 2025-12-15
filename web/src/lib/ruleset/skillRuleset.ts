import type { Actor } from '../model/missionModel'
import type { Agent } from '../model/agentModel'
import { NO_IMPACT_EXHAUSTION, AGENT_SKILL_VALUE_DIVISOR } from './constants'
import { assertNonNeg } from '../primitives/assertPrimitives'
import { nonNeg } from '../primitives/mathPrimitives'
import { f6mult, f6sum, toF, toF6r, toF6, f6sub, f6div, type Fixed6 } from '../primitives/fixed6'

// Calculates the effective skill of an actor based on hit points lost and exhaustion
// Refer to about_agents.md for details
export function effectiveSkill(actor: Actor): Fixed6 {
  const maxHitPointsF6 = toF6(actor.maxHitPoints)
  const hitPointsLost = f6sub(maxHitPointsF6, actor.hitPoints)
  const hitPointsMalus = f6div(hitPointsLost, maxHitPointsF6)
  const hitPointsMult = assertNonNeg(1 - hitPointsMalus)

  const cappedExhaustion = Math.min(100, actor.exhaustionPct)
  const effectiveExhaustion = nonNeg(cappedExhaustion - NO_IMPACT_EXHAUSTION)
  const exhaustionMalus = effectiveExhaustion / 100
  const exhaustionMult = nonNeg(1 - exhaustionMalus)

  const output = toF6r(f6mult(actor.skill, hitPointsMult, exhaustionMult))
  // console.log(
  //   `effectiveSkill: actor=${actor.id}, output=${toF(output)}, output_mult=${f6mult(actor.skill, hitPointsMult, exhaustionMult)}, ` +
  //     `skill=${toF(actor.skill)}, hitPoints=${toF(actor.hitPoints)}/${toF(maxHitPointsF6)}, ` +
  //     `hitPointsMalus=${hitPointsMalus}, hitPointsMult=${hitPointsMult}, ` +
  //     `exhaustion=${cappedExhaustion}%, effectiveExhaustion=${effectiveExhaustion}%, ` +
  //     `exhaustionMalus=${exhaustionMalus}, exhaustionMult=${exhaustionMult}`,
  // )
  return output
}

/**
 * Calculates the value contribution from an agent based on their effective skill and a constant multiplier.
 * Formula: (1 + (effectiveSkill - 100) / AGENT_SKILL_VALUE_DIVISOR) * multiplier
 * Each extra 100 effective skill adds 20% efficiency bonus.
 *
 * This is the source of truth for skill-based value calculations.
 *
 * @param agent - The agent view to calculate the contribution for
 * @param value - The value to multiply the skill coefficient by (e.g., AGENT_CONTRACTING_INCOME)
 * @returns The calculated value contribution as a Fixed6
 */
export function getAgentSkillBasedValue(agent: Agent, value: number): Fixed6 {
  const effectiveSkillValue = toF(effectiveSkill(agent))
  const skillCoefficient = 1 + (effectiveSkillValue - 100) / AGENT_SKILL_VALUE_DIVISOR
  return toF6r(skillCoefficient * value)
}

/**
 * Sums skill-based values from multiple agents.
 * Iterates over agents and accumulates their skill-based contributions.
 *
 * @param agents - Array of agent views to sum values from
 * @param value - The value (e.g., AGENT_CONTRACTING_INCOME)
 * @returns The total sum as a number
 */
export function sumAgentSkillBasedValues(agents: readonly Agent[], value: number): Fixed6 {
  const values = agents.map((agent) => getAgentSkillBasedValue(agent, value))
  const sum = f6sum(...values)
  return sum
}
