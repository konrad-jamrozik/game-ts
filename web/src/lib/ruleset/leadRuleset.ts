import { div, floor, nonNeg } from '../primitives/mathPrimitives'
import { f6floorToInt, toF } from '../primitives/fixed6'
import type { Agent } from '../model/agentModel'
import { AGENT_LEAD_INVESTIGATION_INTEL } from './constants'
import { effectiveSkill, sumAgentSkillBasedValues } from './skillRuleset'

/**
 * Calculates lead success chance based on accumulated intel and difficulty.
 * Difficulty of X means the player must accumulate X intel to have a 100% chance of success.
 * Hence difficulty of 100 means the player must accumulate 100 intel to have a 100% chance of success,
 * or 1 intel = 1% success chance.
 *
 * Formula:
 * successChance = MIN(100%, accumulatedIntel / difficulty)
 *
 * @param accumulatedIntel - The accumulated intel value
 * @param difficulty - The difficulty in basis points
 * @returns The success chance
 */
export function getLeadSuccessChance(accumulatedIntel: number, difficulty: number): number {
  // Example 1:
  // accumulatedIntel = 1, difficulty = 100
  // successChance = 1/100 = 1%
  //
  // Example 2:
  // accumulatedIntel = 10, difficulty = 200
  // successChance = 10/200 = 5%
  //
  // Example 3
  // accumulatedIntel = 100, difficulty = 300
  // successChance = 100/300 = 1/3 = 33.(3)%
  if (difficulty === 0) {
    if (accumulatedIntel > 0) {
      return 1
    }
    return 0
  }
  return Math.min(1, div(accumulatedIntel, difficulty))
}

/**
 * Calculates the resistance to progress based on accumulated intel and difficulty.
 * Resistance represents how much of the search space has been explored.
 * Formula: Resistance = I_current / Difficulty
 *
 * @param accumulatedIntel - The current accumulated intel value
 * @param difficulty - The lead difficulty
 * @returns The resistance value (0.0 to 1.0)
 */
export function getLeadResistance(accumulatedIntel: number, difficulty: number): number {
  if (difficulty === 0) {
    return accumulatedIntel > 0 ? 1 : 0
  }
  return Math.min(1, div(accumulatedIntel, difficulty))
}

/**
 * Calculates the proportional loss of Intel when agents are removed from an investigation.
 * Formula: I_new = I_old × (∑Skill_new / ∑Skill_old)
 * Loss = I_old - I_new = I_old × (1 - ∑Skill_new / ∑Skill_old)
 *
 * @param accumulatedIntel - The current accumulated intel value
 * @param oldSkillSum - Sum of effective skill of agents before removal
 * @param newSkillSum - Sum of effective skill of agents after removal
 * @returns The intel loss amount
 */
export function getLeadIntelLoss(accumulatedIntel: number, oldSkillSum: number, newSkillSum: number): number {
  if (oldSkillSum === 0) {
    return 0
  }
  const lossPct = nonNeg(1 - div(newSkillSum, oldSkillSum))
  const loss = accumulatedIntel * lossPct
  // Floor to integer since Intel is stored as integers
  return floor(loss)
}

/**
 * Calculates the sum of effective skills for a group of agents.
 *
 * @param agents - The agents to sum skills for
 * @returns The sum of effective skills
 */
export function sumAgentEffectiveSkills(agents: Agent[]): number {
  return agents.reduce((sum, agent) => {
    const skill = toF(effectiveSkill(agent))
    return sum + skill
  }, 0)
}

/**
 * Calculates Intel gain per turn from investigating agents.
 * Implements the Probability Pressure system from about_lead_investigations.md.
 *
 * Formula:
 * BaseAgentInput = (sum AgentSkill/100) × Count^0.8 × 5
 * Resistance = I_current / Difficulty
 * EfficiencyFactor = 1 - Resistance
 * Gain = BaseAgentInput × EfficiencyFactor
 *
 * @param agents - The agents investigating the lead
 * @param currentIntel - The current accumulated intel value
 * @param difficulty - The lead difficulty
 * @returns The intel gain for this turn
 */
export function getLeadAccumulatedIntel(agents: Agent[], currentIntel: number, difficulty: number): number {
  if (agents.length === 0) {
    return 0
  }

  // Calculate intel from skill sum: sum(agentLeadInvestigationSkill/100) * AGENT_LEAD_INVESTIGATION_INTEL
  const intelFromSkillSum = getLeadInvestigationIntelFromSkillSum(agents)

  // Calculate BaseAgentInput = intelFromSkillSum × AgentCount^0.8
  const count = agents.length
  const agentEfficiency = count ** 0.8
  const rawIntelFromAgents = intelFromSkillSum * (agentEfficiency / count)

  // Calculate Resistance = I_current / Difficulty
  const resistance = div(currentIntel, difficulty)

  // Calculate Efficiency Factor = 1 - Resistance
  // Clamp to prevent negative efficiency factor
  const resistedEfficiency = nonNeg(1 - resistance)

  // Final gain = BaseAgentInput × EfficiencyFactor
  const gain = rawIntelFromAgents * resistedEfficiency

  // Log all calculation steps
  console.log('getLeadAccumulatedIntel:', {
    curr: currentIntel.toFixed(6),
    eff: agentEfficiency.toFixed(6),
    raw: rawIntelFromAgents.toFixed(6),
    resEff: resistedEfficiency.toFixed(6),
    gain: gain.toFixed(6),
  })

  return gain
}

/**
 *
 * @returns sum(agentLeadInvestigationSkill/100) * AGENT_LEAD_INVESTIGATION_INTEL
 */
export function getLeadInvestigationIntelFromSkillSum(agents: Agent[]): number {
  // This flooring strips any fractional intel from the total
  return f6floorToInt(sumAgentSkillBasedValues(agents, AGENT_LEAD_INVESTIGATION_INTEL))
}
