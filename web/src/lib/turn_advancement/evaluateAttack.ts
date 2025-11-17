import { agV } from '../model/agents/AgentView'
import type { Agent, Enemy } from '../model/model'
import {
  AGENT_EXHAUSTION_INCREASE_PER_ATTACK,
  AGENT_SUCCESSFUL_ATTACK_SKILL_REWARD,
  AGENT_FAILED_DEFENSE_SKILL_REWARD,
  AGENT_EXHAUSTION_INCREASE_PER_DEFENSE,
  AGENT_FAILED_ATTACK_SKILL_REWARD,
  AGENT_SUCCESSFUL_DEFENSE_SKILL_REWARD,
} from '../model/ruleset/constants'
import { effectiveSkill } from '../utils/actorUtils'
import { assertDefined } from '../utils/assert'
import { fmtAttackLog, type AttackLogKind } from '../utils/formatUtils'
import { divMult100Round } from '../utils/mathUtils'
import { rollWeaponDamage } from '../utils/weaponUtils'
import { rollContest } from './rolls'

export function evaluateAttack(
  attacker: Agent | Enemy,
  attackerStats: AgentCombatStats | undefined,
  defender: Agent | Enemy,
  defenderStats?: AgentCombatStats,
  label?: string,
): void {
  // Calculate effective skills
  const attackerEffectiveSkill = isAgent(attacker) ? agV(attacker).effectiveSkill() : effectiveSkill(attacker)
  const defenderEffectiveSkill = isAgent(defender) ? agV(defender).effectiveSkill() : effectiveSkill(defender)

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
      attackerStats.skillGained += AGENT_SUCCESSFUL_ATTACK_SKILL_REWARD
    }
    if (defenderStats) {
      defenderStats.skillGained += AGENT_FAILED_DEFENSE_SKILL_REWARD
    }

    if (hpRemaining <= 0) {
      const kind: AttackLogKind = attackerIsAgent ? 'agent terminates' : 'enemy terminates'
      const hpPercentage = `${divMult100Round(hpRemaining, defender.maxHitPoints)}%`
      console.log(
        fmtAttackLog({
          kind,
          attackerName,
          attackerEffectiveSkill,
          defenderName,
          defenderEffectiveSkill,
          defenderIsAgent,
          rollResult,
          damageInfo: { damage, damagePct },
          hpRemainingInfo: { current: hpRemaining, max: defender.maxHitPoints, percentage: hpPercentage },
        }),
      )
    } else {
      const kind: AttackLogKind = attackerIsAgent ? 'agent hits' : 'enemy hits'
      const hpPercentage = `${divMult100Round(defender.hitPoints, defender.maxHitPoints)}%`
      console.log(
        fmtAttackLog({
          kind,
          attackerName,
          attackerEffectiveSkill,
          defenderName,
          defenderEffectiveSkill,
          defenderIsAgent,
          rollResult,
          damageInfo: { damage, damagePct },
          hpRemainingInfo: { current: defender.hitPoints, max: defender.maxHitPoints, percentage: hpPercentage },
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
      }),
    )

    // Update skill gains (postponed)
    if (attackerStats) {
      attackerStats.skillGained += AGENT_FAILED_ATTACK_SKILL_REWARD
    }
    if (defenderStats) {
      defenderStats.skillGained += AGENT_SUCCESSFUL_DEFENSE_SKILL_REWARD
    }

    // Apply defender exhaustion (both agents and enemies)
    defender.exhaustion += AGENT_EXHAUSTION_INCREASE_PER_DEFENSE
  }
}

export function isAgent(unit: Agent | Enemy): unit is Agent {
  return 'turnHired' in unit
}

export type AgentCombatStats = {
  id: string
  initialEffectiveSkill: number
  skillGained: number
}
