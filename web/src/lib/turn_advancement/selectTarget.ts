import type { Agent, Enemy } from '../model/model'
import { getActorEffectiveSkill } from '../utils/actorUtils'
import { compareIdsNumeric } from '../utils/stringUtils'

/**
 * Selects a target from potential targets using a fair distribution algorithm with skill-based preference.
 *
 * The selection process:
 * 1. Fair distribution: First considers targets with the least number of attacks made on them
 * 2. Skill preference: From those targets, chooses one whose effective skill is closest to 50% of attacker's effective skill
 *    - If multiple targets have the same distance from 50%, chooses the one with lowest effective skill
 *    - If still multiple targets, chooses the one with lowest ID number
 * 3. Fallback expansion: If no target in the least-attacked group has effective skill between 10% and 90%
 *    (inclusive) of attacker's skill, expands to targets with attack count 1 higher and repeats the algorithm
 * 4. Final fallback: If across all attack counts there is no target between 10% and 90% of attacker's skill,
 *    selects the available target with the lowest effective skill
 *
 * @param potentialTargets - Array of potential targets (agents or enemies) to choose from
 * @param attackCounts - Map tracking how many times each target has been attacked (keyed by target ID)
 * @param attacker - The attacker (agent or enemy) selecting the target
 * @returns The selected target, or undefined if no targets are available
 */
export function selectTarget<T extends Agent | Enemy>(
  potentialTargets: T[],
  attackCounts: Map<string, number>,
  attacker: Agent | Enemy,
): T | undefined {
  if (potentialTargets.length === 0) return undefined

  const attackerEffectiveSkill = getActorEffectiveSkill(attacker)
  const targetSkillLowerBound = attackerEffectiveSkill * 0.1
  const targetSkillUpperBound = attackerEffectiveSkill * 0.9
  const targetSkillPreferred = attackerEffectiveSkill * 0.5

  // Find minimum attack count among all potential targets
  const minAttackCount = Math.min(...potentialTargets.map((target) => attackCounts.get(target.id) ?? 0))
  const maxAttackCount = Math.max(...potentialTargets.map((target) => attackCounts.get(target.id) ?? 0))

  // Try each attack count level starting from minimum
  for (let attackCount = minAttackCount; attackCount <= maxAttackCount; attackCount += 1) {
    const targetsAtAttackCount = potentialTargets.filter((target) => (attackCounts.get(target.id) ?? 0) === attackCount)

    const selectedTarget = selectTargetAtAttackCount(
      targetsAtAttackCount,
      targetSkillLowerBound,
      targetSkillUpperBound,
      targetSkillPreferred,
    )

    if (selectedTarget) {
      return selectedTarget
    }
  }

  // Fallback: No target in valid skill range, select lowest effective skill target
  const sorted = [...potentialTargets].sort(compareTargetsBySkill)

  return sorted[0]
}

function selectTargetAtAttackCount<T extends Agent | Enemy>(
  targetsAtAttackCount: T[],
  targetSkillLowerBound: number,
  targetSkillUpperBound: number,
  targetSkillPreferred: number,
): T | undefined {
  // Get targets that are in valid skill range
  const validTargets = targetsAtAttackCount.filter((target) =>
    isInValidSkillRange(target, targetSkillLowerBound, targetSkillUpperBound),
  )

  if (validTargets.length > 0) {
    // Find target closest to 50% of attacker's skill
    const sorted = [...validTargets].sort((targetA, targetB) => {
      const distanceA = distanceFromPreferred(targetA, targetSkillPreferred)
      const distanceB = distanceFromPreferred(targetB, targetSkillPreferred)

      // KJA because of the floor rounding in effectiveSkill called from getActorEffectiveSkill
      // this may be imprecise, like: 50% = 10, target 1 = 7.9 (dist = 2.1), target 2 = 12.9 (dist = 2.9)
      // so it rounds target 1 to 7 and target 2 to 12, thus picking target 2 instead of target 1
      // Need to think about the rounding precisions here of effectiveSkill, Bps, etc.
      //
      // If distances are equal, prefer lower skill
      if (distanceA === distanceB) {
        return compareTargetsBySkill(targetA, targetB)
      }

      return distanceA - distanceB
    })

    return sorted[0]
  }

  return undefined
}

// Helper function to compare targets by effective skill, then by ID if skills are equal
function compareTargetsBySkill(targetA: Agent | Enemy, targetB: Agent | Enemy): number {
  const skillA = getActorEffectiveSkill(targetA)
  const skillB = getActorEffectiveSkill(targetB)
  if (skillA === skillB) {
    return compareIdsNumeric(targetA.id, targetB.id)
  }
  // Return the target with lower skill as first.
  // Explanation:
  // sort() will return targetA as first if output is negative, i.e. when skillA - skillB < 0 i.e. skillA < skillB.
  return skillA - skillB
}

// Helper function to check if target is in valid skill range
function isInValidSkillRange(
  target: Agent | Enemy,
  targetSkillLowerBound: number,
  targetSkillUpperBound: number,
): boolean {
  const skill = getActorEffectiveSkill(target)
  return skill >= targetSkillLowerBound && skill <= targetSkillUpperBound
}

// Helper function to calculate distance from preferred skill (50% of attacker's skill)
function distanceFromPreferred(target: Agent | Enemy, targetSkillPreferred: number): number {
  const skill = getActorEffectiveSkill(target)
  return Math.abs(skill - targetSkillPreferred)
}
