import type { AgentView } from '../agents/AgentView'
import { f6sum, toF, toF6r, type Fixed6 } from '../fixed6'

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
export function getAgentSkillBasedValue(agent: AgentView, value: number): Fixed6 {
  const skillCoefficient = toF(agent.effectiveSkill()) / 100
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
export function sumAgentSkillBasedValues(agents: readonly AgentView[], value: number): Fixed6 {
  const values = agents.map((agent) => getAgentSkillBasedValue(agent, value))
  const sum = f6sum(...values)
  return sum
}
