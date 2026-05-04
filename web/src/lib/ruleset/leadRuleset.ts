import { div, nonNeg } from '../primitives/mathPrimitives'
import { toF } from '../primitives/fixed6'
import type { Agent } from '../model/agentModel'
import { LEAD_SCALING_EXPONENT } from '../data_tables/constants'
import { assertAboveZero, assertInRange, assertInteger } from '../primitives/assertPrimitives'
import { effectiveSkill } from './skillRuleset'

export type LeadTurnSuccessChanceRange = {
  lower: number
  upper: number
}

export function getActualLeadDifficulty(visibleDifficulty: number, randomFactor: number): number {
  assertAboveZero(visibleDifficulty, 'Visible lead difficulty must be above zero')
  assertInteger(visibleDifficulty, 'Visible lead difficulty must be an integer')
  assertInRange(randomFactor, 0, 1, 'Lead actual difficulty random factor must be between 0 and 1')

  return Math.floor(visibleDifficulty * (1 + randomFactor * 0.5))
}

/**
 * Calculates the proportional loss of progress when agents are removed from an investigation.
 * Formula: progress_new = progress_old × (∑Skill_new / ∑Skill_old)
 * Loss = progress_old - progress_new = progress_old × (1 - ∑Skill_new / ∑Skill_old)
 *
 * @param progress - The current progress value
 * @param oldSkillSum - Sum of effective skill of agents before removal
 * @param newSkillSum - Sum of effective skill of agents after removal
 * @returns The progress loss amount
 */
export function getLeadProgressLoss(progress: number, oldSkillSum: number, newSkillSum: number): number {
  if (oldSkillSum === 0) {
    return 0
  }
  const lossPct = nonNeg(1 - div(newSkillSum, oldSkillSum))
  return progress * lossPct
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

export function getLeadTeamPower(agents: Agent[]): number {
  if (agents.length === 0) {
    return 0
  }

  const skillPower = div(sumAgentEffectiveSkills(agents), 100)
  const agentCount = agents.length
  const agentEfficiency = agentCount ** LEAD_SCALING_EXPONENT

  return skillPower * div(agentEfficiency, agentCount)
}

export function getLeadProgressFromAgents(agents: Agent[]): number {
  return getLeadTeamPower(agents)
}

export function getLeadCumulativeSuccessChance(progress: number, actualDifficulty: number): number {
  assertAboveZero(actualDifficulty, 'Actual lead difficulty must be above zero')
  const progressRatio = Math.min(1, nonNeg(div(progress, actualDifficulty)))
  return progressRatio ** 3
}

export function getLeadTurnSuccessChance(
  previousProgress: number,
  currentProgress: number,
  actualDifficulty: number,
): number {
  const previousCumulative = getLeadCumulativeSuccessChance(previousProgress, actualDifficulty)
  const currentCumulative = getLeadCumulativeSuccessChance(currentProgress, actualDifficulty)

  if (previousCumulative >= 1) {
    return 1
  }

  return div(currentCumulative - previousCumulative, 1 - previousCumulative)
}

export function getLeadTurnSuccessChanceRange(
  previousProgress: number,
  currentProgress: number,
  visibleDifficulty: number,
): LeadTurnSuccessChanceRange {
  const actualDifficultyMin = visibleDifficulty
  const actualDifficultyMax = Math.floor(visibleDifficulty * 1.5)

  return {
    lower: getLeadTurnSuccessChance(previousProgress, currentProgress, actualDifficultyMax),
    upper: getLeadTurnSuccessChance(previousProgress, currentProgress, actualDifficultyMin),
  }
}
