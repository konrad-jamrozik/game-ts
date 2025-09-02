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
import { fmtPctDec2 } from '../utils/formatUtils'
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
  const contestResult = rollContest(attackerEffectiveSkill, defenderEffectiveSkill, label)

  // Apply exhaustion to attacker immediately (both agents and enemies get exhausted)
  attacker.exhaustion += AGENT_EXHAUSTION_INCREASE_PER_ATTACK

  const attackerIcon = isAgent(attacker) ? '👤' : '👺'
  const defenderIcon = isAgent(defender) ? '👤' : '👺'
  const attackerName = attacker.id
  const defenderName = defender.id

  if (contestResult.success) {
    // Successful attack - roll damage
    const damage = rollWeaponDamage(attacker.weapon, label)
    const damageDenominator = attacker.weapon.maxDamage - attacker.weapon.minDamage
    const damageRangePct =
      damageDenominator === 0 ? 50 : ((damage - attacker.weapon.minDamage) / damageDenominator) * 100
    const damagePct = `${Math.round(50 + damageRangePct)}%`

    defender.hitPoints = Math.max(0, defender.hitPoints - damage)

    // Update skill gains from battle combat
    if (attackerStats) {
      attackerStats.skillGained += AGENT_SUCCESSFUL_ATTACK_SKILL_REWARD
    }
    if (defenderStats) {
      defenderStats.skillGained += AGENT_FAILED_DEFENSE_SKILL_REWARD
    }

    // Detailed success log
    const rollInfo = `[${fmtPctDec2(contestResult.roll)} vs ${fmtPctDec2(contestResult.failureProbabilityPct)} threshold]`

    if (defender.hitPoints <= 0) {
      console.log(
        `☠️ ${attackerIcon} ${attackerName} (${attackerEffectiveSkill}) terminates ${defenderIcon} ${defenderName} (${defenderEffectiveSkill}) with ${damage} (${damagePct}) damage ${rollInfo}`,
      )
    } else {
      const hpPercentage = divMult100Round(defender.hitPoints, defender.maxHitPoints)
      console.log(
        `🩸 ${attackerIcon} ${attackerName} (${attackerEffectiveSkill}) hits ${defenderIcon} ${defenderName} (${defenderEffectiveSkill}) for ${damage} (${damagePct}) damage ${rollInfo} (${defender.hitPoints}/${defender.maxHitPoints} (${hpPercentage}%) HP remaining)`,
      )
    }

    // Apply defender exhaustion only if not terminated
    if (defender.hitPoints > 0) {
      defender.exhaustion += AGENT_EXHAUSTION_INCREASE_PER_DEFENSE
    }
  } else {
    // Failed attack - show roll details
    const rollInfo = `[${fmtPctDec2(contestResult.roll)} vs ${fmtPctDec2(contestResult.failureProbabilityPct)} threshold]`
    console.log(
      `➖ ${attackerIcon} ${attackerName} (${attackerEffectiveSkill}) misses ${defenderIcon} ${defenderName} (${defenderEffectiveSkill}) ${rollInfo}`,
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
