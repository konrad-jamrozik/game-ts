import type { Enemy } from '../../model/model'
import type { Agent, AgentCombatStats } from '../../model/agentModel'
import {
  AGENT_EXHAUSTION_INCREASE_PER_ATTACK,
  AGENT_SUCCESSFUL_ATTACK_SKILL_REWARD,
  AGENT_FAILED_DEFENSE_SKILL_REWARD,
  AGENT_EXHAUSTION_INCREASE_PER_DEFENSE,
  AGENT_FAILED_ATTACK_SKILL_REWARD,
  AGENT_SUCCESSFUL_DEFENSE_SKILL_REWARD,
} from '../../ruleset/constants'
import { f6add, toF, toF6, f6sub, f6max, f6gt } from '../../primitives/fixed6'
import { isAgent } from '../../model_utils/agentUtils'
import { assertDefined } from '../../primitives/assertPrimitives'
import { fmtAttackLog, type AttackLogKind } from './fmtAttackLog'
import { rollWeaponDamage } from '../../ruleset/weaponRuleset'
import { rollContest } from '../../primitives/rolls'
import { fmtPctDec0 } from '../../primitives/formatPrimitives'
import { effectiveSkill } from '../../ruleset/skillRuleset'

export function evaluateAttack(
  attacker: Agent | Enemy,
  attackerStats: AgentCombatStats | undefined,
  defender: Agent | Enemy,
  defenderStats?: AgentCombatStats,
  label?: string,
  attackCount = 0,
): void {
  // Calculate effective skills

  // KJA2 in theory here we can reach 105+ exhaustion, resulting in 0 effective skill, resulting in div by 0 error in rollContest
  const attackerEffectiveSkill = toF(effectiveSkill(attacker))
  const defenderEffectiveSkill = toF(effectiveSkill(defender))

  if (isAgent(attacker)) {
    assertDefined(attackerStats)
  }

  if (isAgent(defender)) {
    assertDefined(defenderStats)
  }

  // Contest roll
  const rollResult = rollContest(attackerEffectiveSkill, defenderEffectiveSkill, label)

  // Apply exhaustion to attacker immediately (both agents and enemies get exhausted)
  attacker.exhaustion += AGENT_EXHAUSTION_INCREASE_PER_ATTACK

  const attackerName = attacker.id
  const defenderName = defender.id
  const attackerIsAgent = isAgent(attacker)
  const defenderIsAgent = isAgent(defender)

  if (rollResult.success) {
    // Successful attack - roll damage
    const damage = rollWeaponDamage(attacker.weapon, label)
    const damageDenominator = attacker.weapon.maxDamage - attacker.weapon.minDamage
    const damageRangePct =
      damageDenominator === 0 ? 50 : ((damage - attacker.weapon.minDamage) / damageDenominator) * 100
    const damagePct = `${Math.round(50 + damageRangePct)}%`

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
      const kind: AttackLogKind = attackerIsAgent ? 'agent terminates' : 'enemy terminates'
      const hpPct = fmtPctDec0(hpRemainingNum, defender.maxHitPoints)
      console.log(
        fmtAttackLog({
          kind,
          attackerName,
          attackerEffectiveSkill,
          defenderName,
          defenderEffectiveSkill,
          defenderIsAgent,
          rollResult,
          attackCount,
          damageInfo: { damage, damagePct },
          hpRemainingInfo: { current: hpRemainingNum, max: defender.maxHitPoints, percentage: hpPct },
        }),
      )
    } else {
      const kind: AttackLogKind = attackerIsAgent ? 'agent hits' : 'enemy hits'
      const hpPct = fmtPctDec0(toF(defender.hitPoints), defender.maxHitPoints)
      console.log(
        fmtAttackLog({
          kind,
          attackerName,
          attackerEffectiveSkill,
          defenderName,
          defenderEffectiveSkill,
          defenderIsAgent,
          rollResult,
          attackCount,
          damageInfo: { damage, damagePct },
          hpRemainingInfo: { current: toF(defender.hitPoints), max: defender.maxHitPoints, percentage: hpPct },
        }),
      )
    }

    // Apply defender exhaustion only if not terminated
    if (f6gt(defender.hitPoints, toF6(0))) {
      defender.exhaustion += AGENT_EXHAUSTION_INCREASE_PER_DEFENSE
    }
  } else {
    // Failed attack - show roll details
    const kind: AttackLogKind = attackerIsAgent ? 'agent misses' : 'enemy misses'
    console.log(
      fmtAttackLog({
        kind,
        attackerName,
        attackerEffectiveSkill,
        defenderName,
        defenderEffectiveSkill,
        defenderIsAgent,
        rollResult,
        attackCount,
      }),
    )

    // Update skill gains (postponed)
    if (attackerStats) {
      attackerStats.skillGained = f6add(attackerStats.skillGained, AGENT_FAILED_ATTACK_SKILL_REWARD)
    }
    if (defenderStats) {
      defenderStats.skillGained = f6add(defenderStats.skillGained, AGENT_SUCCESSFUL_DEFENSE_SKILL_REWARD)
    }

    // Apply defender exhaustion (both agents and enemies)
    defender.exhaustion += AGENT_EXHAUSTION_INCREASE_PER_DEFENSE
  }
}
