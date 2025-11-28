import type { AgentView } from '../model/agents/AgentView'
import { f2div, f2mult, type Fixed2 } from '../model/fixed2'

/** // KJA2 observe this is always used in context of looping over agents collection
 * Calculates the value contribution from an agent based on their effective skill and a constant multiplier.
 * Formula: (agent.effectiveSkill() / 100) * constant
 *
 * @param agent - The agent view to calculate the contribution for
 * @param constant - The constant multiplier (e.g., AGENT_CONTRACTING_INCOME or AGENT_ESPIONAGE_INTEL)
 * @returns The calculated value contribution as a Fixed2
 */
export function calculateAgentSkillBasedValue(agent: AgentView, constant: number): Fixed2 {
  const skillCoefficient = f2div(agent.effectiveSkill(), 100)
  return f2mult(skillCoefficient, constant)
}
