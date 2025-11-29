import type { AgentView } from '../agents/AgentView'
import { f6div, f6mult, type Fixed6 } from '../fixed6'

/**
 * Calculates the value contribution from an agent based on their effective skill and a constant multiplier.
 * Formula: (agent.effectiveSkill() / 100) * constant
 *
 * This is the source of truth for skill-based value calculations.
 *
 * @param agent - The agent view to calculate the contribution for
 * @param constant - The constant multiplier (e.g., AGENT_CONTRACTING_INCOME or AGENT_ESPIONAGE_INTEL)
 * @returns The calculated value contribution as a Fixed6
 */
export function getAgentSkillBasedValue(agent: AgentView, constant: number): Fixed6 {
  const skillCoefficient = f6div(agent.effectiveSkill(), 100)
  return f6mult(skillCoefficient, constant)
}
