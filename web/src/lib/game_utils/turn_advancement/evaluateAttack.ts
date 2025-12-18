import type { Enemy } from '../../model/missionModel'
import type { Agent, AgentCombatStats } from '../../model/agentModel'
import {
  AGENT_EXHAUSTION_INCREASE_PER_ATTACK,
  AGENT_SUCCESSFUL_ATTACK_SKILL_REWARD,
  AGENT_FAILED_DEFENSE_SKILL_REWARD,
  AGENT_EXHAUSTION_INCREASE_PER_DEFENSE,
  AGENT_FAILED_ATTACK_SKILL_REWARD,
  AGENT_SUCCESSFUL_DEFENSE_SKILL_REWARD,
} from '../../dataTables/constants'
import { f6add, toF, toF6, f6sub, f6max, type Fixed6 } from '../../primitives/fixed6'
import { isAgent } from '../../model_utils/agentUtils'
import { assertDefined } from '../../primitives/assertPrimitives'
import { rollWeaponDamage } from '../../ruleset/weaponRuleset'
import { rollContest } from '../../primitives/rolls'
import { effectiveSkill } from '../../ruleset/skillRuleset'
import { isIncapacitated } from '../../ruleset/missionRuleset'
import type { AttackLog } from '../../model/turnReportModel'

export function evaluateAttack(
  attacker: Agent | Enemy,
  attackerStats: AgentCombatStats | undefined,
  defender: Agent | Enemy,
  defenderStats: AgentCombatStats | undefined,
  attackerSkillAtStart: Fixed6,
  defenderSkillAtStart: Fixed6,
  roundNumber: number,
  label?: string,
  _attackCount = 0,
): AttackLog {
  // Calculate effective skills
  const attackerEffectiveSkill = effectiveSkill(attacker)
  const defenderEffectiveSkill = effectiveSkill(defender)
  const attackerEffectiveSkillNum = toF(attackerEffectiveSkill)
  const defenderEffectiveSkillNum = toF(defenderEffectiveSkill)

  if (isAgent(attacker)) {
    assertDefined(attackerStats)
  }

  if (isAgent(defender)) {
    assertDefined(defenderStats)
  }

  // Contest roll
  const rollResult = rollContest(attackerEffectiveSkillNum, defenderEffectiveSkillNum, label)

  // Apply exhaustion to attacker immediately (both agents and enemies get exhausted)
  attacker.exhaustionPct += AGENT_EXHAUSTION_INCREASE_PER_ATTACK

  // const attackerName = attacker.id
  // const defenderName = defender.id
  const attackerIsAgent = isAgent(attacker)
  const defenderIsAgent = isAgent(defender)

  // Extract agent/enemy IDs for AttackLog
  const agentId = attackerIsAgent ? attacker.id : defender.id
  const enemyId = attackerIsAgent ? defender.id : attacker.id

  // Calculate roll percentage and threshold
  const rollPct = toF(rollResult.rollF4) * 100
  const thresholdPct = toF(rollResult.failureProbF4) * 100

  // oxlint-disable-next-line init-declarations
  // eslint-disable-next-line @typescript-eslint/init-declarations
  let attackLog: AttackLog

  if (rollResult.success) {
    // Successful attack - roll damage
    const damage = rollWeaponDamage(attacker.weapon, label)
    // const damageDenominator = attacker.weapon.maxDamage - attacker.weapon.minDamage
    // const damageRangePct =
    //   damageDenominator === 0 ? 50 : ((damage - attacker.weapon.minDamage) / damageDenominator) * 100
    // const damagePct = `${Math.round(50 + damageRangePct)}%`

    const damageF6 = toF6(damage)
    const hpRemaining = f6sub(defender.hitPoints, damageF6)
    defender.hitPoints = f6max(hpRemaining, toF6(0))

    // Update skill gains from battle combat
    if (attackerStats) {
      attackerStats.skillGained = f6add(attackerStats.skillGained, AGENT_SUCCESSFUL_ATTACK_SKILL_REWARD)
    }
    if (defenderStats) {
      defenderStats.skillGained = f6add(defenderStats.skillGained, AGENT_FAILED_DEFENSE_SKILL_REWARD)
    }

    const hpRemainingNum = toF(hpRemaining)
    if (hpRemainingNum <= 0) {
      // If an enemy terminated an agent, track which enemy did it
      if (defenderIsAgent && !attackerIsAgent) {
        defender.terminatedBy = attacker.id
      }
      // const kind: AttackLogKind = attackerIsAgent ? 'agent terminates' : 'enemy terminates'
      // const hpPct = fmtPctDec0(hpRemainingNum, defender.maxHitPoints)
      // console.log(
      //   fmtAttackLog({
      //     kind,
      //     attackerName,
      //     attackerEffectiveSkill: attackerEffectiveSkillNum,
      //     defenderName,
      //     defenderEffectiveSkill: defenderEffectiveSkillNum,
      //     defenderIsAgent,
      //     rollResult,
      //     attackCount,
      //     damageInfo: { damage, damagePct },
      //     hpRemainingInfo: { current: hpRemainingNum, max: defender.maxHitPoints, percentage: hpPct },
      //   }),
      // )

      // Calculate defender skill after damage (exhaustion not applied for terminated)
      const defenderSkillAfterAttack = effectiveSkill(defender)

      attackLog = {
        roundNumber,
        agentId,
        enemyId,
        attackerType: attackerIsAgent ? 'Agent' : 'Enemy',
        attackerSkill: attackerEffectiveSkill,
        attackerSkillAtStart,
        defenderSkill: defenderEffectiveSkill,
        defenderSkillAtStart,
        defenderSkillAfterAttack,
        roll: rollPct,
        threshold: thresholdPct,
        outcome: 'KIA',
        damage,
        baseDamage: attacker.weapon.damage,
        damageMin: attacker.weapon.minDamage,
        damageMax: attacker.weapon.maxDamage,
        defenderHpAfterDamage: hpRemainingNum,
        defenderHpMax: defender.maxHitPoints,
      }
    } else {
      // const kind: AttackLogKind = attackerIsAgent ? 'agent hits' : 'enemy hits'
      // const hpPct = fmtPctDec0(hpRemainingNum, defender.maxHitPoints)
      // console.log(
      //   fmtAttackLog({
      //     kind,
      //     attackerName,
      //     attackerEffectiveSkill: attackerEffectiveSkillNum,
      //     defenderName,
      //     defenderEffectiveSkill: defenderEffectiveSkillNum,
      //     defenderIsAgent,
      //     rollResult,
      //     attackCount,
      //     damageInfo: { damage, damagePct },
      //     hpRemainingInfo: { current: hpRemainingNum, max: defender.maxHitPoints, percentage: hpPct },
      //   }),
      // )

      // Apply defender exhaustion before calculating skill after damage
      defender.exhaustionPct += AGENT_EXHAUSTION_INCREASE_PER_DEFENSE

      // Calculate defender skill after damage and exhaustion
      const defenderSkillAfterAttack = effectiveSkill(defender)

      const defenderIsIncapacitated = isIncapacitated(defender)

      attackLog = {
        roundNumber,
        agentId,
        enemyId,
        attackerType: attackerIsAgent ? 'Agent' : 'Enemy',
        attackerSkill: attackerEffectiveSkill,
        attackerSkillAtStart,
        defenderSkill: defenderEffectiveSkill,
        defenderSkillAtStart,
        defenderSkillAfterAttack,
        roll: rollPct,
        threshold: thresholdPct,
        outcome: defenderIsIncapacitated ? 'Incapacitated' : 'Hit',
        damage,
        baseDamage: attacker.weapon.damage,
        damageMin: attacker.weapon.minDamage,
        damageMax: attacker.weapon.maxDamage,
        defenderHpAfterDamage: hpRemainingNum,
        defenderHpMax: defender.maxHitPoints,
      }
    }
  } else {
    // Failed attack - show roll details
    // const kind: AttackLogKind = attackerIsAgent ? 'agent misses' : 'enemy misses'
    // console.log(
    //   fmtAttackLog({
    //     kind,
    //     attackerName,
    //     attackerEffectiveSkill: attackerEffectiveSkillNum,
    //     defenderName,
    //     defenderEffectiveSkill: defenderEffectiveSkillNum,
    //     defenderIsAgent,
    //     rollResult,
    //     attackCount,
    //   }),
    // )

    // Update skill gains (postponed)
    if (attackerStats) {
      attackerStats.skillGained = f6add(attackerStats.skillGained, AGENT_FAILED_ATTACK_SKILL_REWARD)
    }
    if (defenderStats) {
      defenderStats.skillGained = f6add(defenderStats.skillGained, AGENT_SUCCESSFUL_DEFENSE_SKILL_REWARD)
    }

    // Apply defender exhaustion (both agents and enemies)
    defender.exhaustionPct += AGENT_EXHAUSTION_INCREASE_PER_DEFENSE

    // Calculate defender skill after exhaustion (no damage for misses)
    const defenderSkillAfterAttack = effectiveSkill(defender)

    attackLog = {
      roundNumber,
      agentId,
      enemyId,
      attackerType: attackerIsAgent ? 'Agent' : 'Enemy',
      attackerSkill: attackerEffectiveSkill,
      attackerSkillAtStart,
      defenderSkill: defenderEffectiveSkill,
      defenderSkillAtStart,
      defenderSkillAfterAttack,
      roll: rollPct,
      threshold: thresholdPct,
      outcome: 'Miss',
      damage: undefined,
      baseDamage: attacker.weapon.damage,
      damageMin: attacker.weapon.minDamage,
      damageMax: attacker.weapon.maxDamage,
      defenderHpAfterDamage: toF(defender.hitPoints),
      defenderHpMax: defender.maxHitPoints,
    }
  }

  return attackLog
}
