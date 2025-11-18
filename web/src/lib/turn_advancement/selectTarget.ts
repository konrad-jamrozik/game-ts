import type { Agent, Enemy } from '../model/model'
import { assertDefined } from '../utils/assert'
import { compareIdsNumeric } from '../utils/stringUtils'
import { div } from '../utils/mathUtils'
import { rand } from '../utils/rand'
import { rollRange } from './rolls'

/**
 * Selects a target from potential targets using a fair distribution algorithm with skill-based preference.
 *
 * The selection process:
 * 1. Self-removal: Each potential target has a chance to remove itself from consideration equal to
 *    the percentage of max hit points they have lost. The more wounded a target is, the more likely it is to remove itself.
 *    In case all targets remove themselves, all of the targets are restored, as if no self-removal had happened.
 * 2. Fair distribution: First considers targets with the least number of attacks made on them
 * 3. Skill preference: From those targets, chooses one whose effective skill is closest to 50% of attacker's effective skill
 *    - If multiple targets have the same distance from 50%, chooses the one with lowest effective skill
 *    - If still multiple targets, chooses the one with lowest ID number
 * 4. Fallback expansion: If no target in the least-attacked group has effective skill between 20% and 80%
 *    (inclusive) of attacker's skill, expands to targets with attack count 1 higher and repeats the algorithm
 * 5. Final fallback: If across all attack counts there is no target between 20% and 80% of attacker's skill,
 *    picks at random a target from targets with minimum number of attacks only
 *
 * Note: Uses effective skill at round start to prevent targets from becoming more attractive
 * as they take damage during the round, which would cause enemies to pile up on damaged targets.
 *
 * @param potentialTargets - Array of potential targets (agents or enemies) to choose from
 * @param attackCounts - Map tracking how many times each target has been attacked (keyed by target ID)
 * @param attacker - The attacker (agent or enemy) selecting the target
 * @param effectiveSkillsAtRoundStart - Map of effective skills at round start (keyed by actor ID).
 *                                      Uses these values instead of calculating current effective skill.
 * @returns The selected target, or undefined if no targets are available
 */
export function selectTarget<T extends Agent | Enemy>(
  potentialTargets: T[],
  attackCounts: Map<string, number>,
  attacker: Agent | Enemy,
  effectiveSkillsAtRoundStart: Map<string, number>,
): T | undefined {
  if (potentialTargets.length === 0) return undefined

  const availableTargets = filterTargetsBySelfRemoval(potentialTargets)

  const attackerEffectiveSkill = effectiveSkillsAtRoundStart.get(attacker.id)
  assertDefined(attackerEffectiveSkill)
  const targetSkillLowerBound = attackerEffectiveSkill * 0.2
  const targetSkillUpperBound = attackerEffectiveSkill * 0.8
  const targetSkillPreferred = attackerEffectiveSkill * 0.5

  // Find minimum attack count among available targets
  const minAttackCount = Math.min(...availableTargets.map((target) => attackCounts.get(target.id) ?? 0))
  const maxAttackCount = Math.max(...availableTargets.map((target) => attackCounts.get(target.id) ?? 0))

  // Try each attack count level starting from minimum
  for (let attackCount = minAttackCount; attackCount <= maxAttackCount; attackCount += 1) {
    const targetsAtAttackCount = availableTargets.filter((target) => (attackCounts.get(target.id) ?? 0) === attackCount)

    const selectedTarget = selectTargetAtAttackCount(
      targetsAtAttackCount,
      targetSkillLowerBound,
      targetSkillUpperBound,
      targetSkillPreferred,
      effectiveSkillsAtRoundStart,
    )

    if (selectedTarget) {
      return selectedTarget
    }
  }

  // Fallback: No target in valid skill range, pick at random from targets
  // with minimum number of attacks only
  const targetsWithMinAttacks = availableTargets.filter(
    (target) => (attackCounts.get(target.id) ?? 0) === minAttackCount,
  )
  const randomIndex = rollRange(0, targetsWithMinAttacks.length - 1).roll
  return targetsWithMinAttacks[randomIndex]
}

function selectTargetAtAttackCount<T extends Agent | Enemy>(
  targetsAtAttackCount: T[],
  targetSkillLowerBound: number,
  targetSkillUpperBound: number,
  targetSkillPreferred: number,
  effectiveSkillsAtRoundStart: Map<string, number>,
): T | undefined {
  // Get targets that are in valid skill range
  const validTargets = targetsAtAttackCount.filter((target) =>
    isInValidSkillRange(target, targetSkillLowerBound, targetSkillUpperBound, effectiveSkillsAtRoundStart),
  )

  if (validTargets.length > 0) {
    // Find target closest to 50% of attacker's skill
    const sorted = validTargets.toSorted((targetA, targetB) => {
      const distanceA = distanceFromPreferred(targetA, targetSkillPreferred, effectiveSkillsAtRoundStart)
      const distanceB = distanceFromPreferred(targetB, targetSkillPreferred, effectiveSkillsAtRoundStart)

      // KJA because of the floor rounding in effectiveSkill called from getActorEffectiveSkill
      // this may be imprecise, like: 50% = 10, target 1 = 7.9 (dist = 2.1), target 2 = 12.9 (dist = 2.9)
      // so it rounds target 1 to 7 and target 2 to 12, thus picking target 2 instead of target 1
      // Need to think about the rounding precisions here of effectiveSkill, Bps, etc.
      //
      // If distances are equal, prefer lower skill
      if (distanceA === distanceB) {
        return compareTargetsBySkill(targetA, targetB, effectiveSkillsAtRoundStart)
      }

      return distanceA - distanceB
    })

    return sorted[0]
  }

  return undefined
}

// Helper function to compare targets by effective skill, then by ID if skills are equal
function compareTargetsBySkill(
  targetA: Agent | Enemy,
  targetB: Agent | Enemy,
  effectiveSkillsAtRoundStart: Map<string, number>,
): number {
  const skillA = effectiveSkillsAtRoundStart.get(targetA.id)
  const skillB = effectiveSkillsAtRoundStart.get(targetB.id)
  assertDefined(skillA)
  assertDefined(skillB)
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
  effectiveSkillsAtRoundStart: Map<string, number>,
): boolean {
  const skill = effectiveSkillsAtRoundStart.get(target.id)
  assertDefined(skill)
  return skill >= targetSkillLowerBound && skill <= targetSkillUpperBound
}

// Helper function to filter targets by self-removal based on HP lost percentage
function filterTargetsBySelfRemoval<T extends Agent | Enemy>(potentialTargets: T[]): T[] {
  // Filter out targets that randomly remove themselves based on HP lost percentage
  let availableTargets = potentialTargets.filter((target) => {
    const hitPointsLost = target.maxHitPoints - target.hitPoints
    if (hitPointsLost <= 0) {
      return true // No HP lost, target stays available
    }
    const hpLostPercentage = div(hitPointsLost, target.maxHitPoints)
    const roll = rand.get()
    // console.log(
    //   `🎲 Self-removal roll for ${target.id}: ${addPctSignMult100Dec2(roll)} vs ${addPctSignMult100Dec2(hpLostPercentage)} HP lost threshold`,
    // )

    // If roll is less than HP lost percentage, target removes itself
    const willRemove = roll <= hpLostPercentage
    return !willRemove
  })

  // If all targets removed themselves, restore all potential targets
  if (availableTargets.length === 0) {
    availableTargets = potentialTargets
    // console.log('⚠️ All targets removed themselves, restoring all potential targets')
  }

  return availableTargets
}

// Helper function to calculate distance from preferred skill (50% of attacker's skill)
function distanceFromPreferred(
  target: Agent | Enemy,
  targetSkillPreferred: number,
  effectiveSkillsAtRoundStart: Map<string, number>,
): number {
  const skill = effectiveSkillsAtRoundStart.get(target.id)
  assertDefined(skill)
  return Math.abs(skill - targetSkillPreferred)
}
