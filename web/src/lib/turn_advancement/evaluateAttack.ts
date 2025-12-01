import type { Enemy } from '../model/model'
import type { Agent } from '../model/agentModel'
import {
  AGENT_EXHAUSTION_INCREASE_PER_ATTACK,
  AGENT_SUCCESSFUL_ATTACK_SKILL_REWARD,
  AGENT_FAILED_DEFENSE_SKILL_REWARD,
  AGENT_EXHAUSTION_INCREASE_PER_DEFENSE,
  AGENT_FAILED_ATTACK_SKILL_REWARD,
  AGENT_SUCCESSFUL_DEFENSE_SKILL_REWARD,
} from '../ruleset/constants'
import { f6add } from '../utils/fixed6Utils'
import { toF, type Fixed6 } from '../primitives/fixed6Primitives'
import { isAgent } from '../model_utils/agentUtils'
import { assertDefined } from '../primitives/assertPrimitives'
import { fmtAttackLog, type AttackLogKind } from '../utils/fmtAttackLog'
import { rollWeaponDamage } from '../ruleset/weaponRuleset'
import { rollContest } from '../utils/rolls'
import { fmtPctDec0 } from '../primitives/formatPrimitives'
import { effectiveSkill } from '../ruleset/skillRuleset'

export function evaluateAttack(
  attacker: Agent | Enemy,
  attackerStats: AgentCombatStats | undefined,
  defender: Agent | Enemy,
  defenderStats?: AgentCombatStats,
  label?: string,
  attackCount = 0,
): void {
  // Calculate effective skills

  // KJA2 in theory here we can reach 105+ exhaustion, resulting in 0 effective skill, resulting in div by 0 error
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

    const hpRemaining = defender.hitPoints - damage
    defender.hitPoints = Math.max(0, hpRemaining)

    // Update skill gains from battle combat
    if (attackerStats) {
      attackerStats.skillGained = f6add(attackerStats.skillGained, AGENT_SUCCESSFUL_ATTACK_SKILL_REWARD)
    }
    if (defenderStats) {
      defenderStats.skillGained = f6add(defenderStats.skillGained, AGENT_FAILED_DEFENSE_SKILL_REWARD)
    }

    if (hpRemaining <= 0) {
      // If an enemy terminated an agent, track which enemy did it
      if (defenderIsAgent && !attackerIsAgent) {
        defender.terminatedBy = attacker.id
      }
      const kind: AttackLogKind = attackerIsAgent ? 'agent terminates' : 'enemy terminates'
      const hpPct = fmtPctDec0(hpRemaining, defender.maxHitPoints)
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
          hpRemainingInfo: { current: hpRemaining, max: defender.maxHitPoints, percentage: hpPct },
        }),
      )
    } else {
      const kind: AttackLogKind = attackerIsAgent ? 'agent hits' : 'enemy hits'
      const hpPct = fmtPctDec0(defender.hitPoints, defender.maxHitPoints)
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
          hpRemainingInfo: { current: defender.hitPoints, max: defender.maxHitPoints, percentage: hpPct },
        }),
      )
    }

    // Apply defender exhaustion only if not terminated
    if (defender.hitPoints > 0) {
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

export type AgentCombatStats = {
  id: string
  initialEffectiveSkill: Fixed6
  skillGained: Fixed6
}
