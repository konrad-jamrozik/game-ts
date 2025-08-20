import {
  AGENT_SUCCESSFUL_ATTACK_SKILL_REWARD,
  AGENT_FAILED_ATTACK_SKILL_REWARD,
  AGENT_SUCCESSFUL_DEFENSE_SKILL_REWARD,
  AGENT_FAILED_DEFENSE_SKILL_REWARD,
  AGENT_EXHAUSTION_INCREASE_PER_ATTACK,
  AGENT_EXHAUSTION_INCREASE_PER_DEFENSE,
} from '../model/ruleset/constants'
import { rollContest } from './Roll'
import { rollWeaponDamage } from '../utils/weaponUtils'
import type { Agent, EnemyUnit } from '../model/model'
import { agV } from '../model/agents/AgentView'

export type AgentCombatStats = {
  id: string
  initialEffectiveSkill: number
  skillGained: number
}

export type CombatReport = {
  rounds: number
  agentsCasualties: number
  enemiesCasualties: number
  retreated: boolean
  agentSkillUpdates: Record<string, number>
}

export function conductMissionSiteBattle(
  agents: Agent[],
  agentStats: AgentCombatStats[],
  enemies: EnemyUnit[],
): CombatReport {
  let rounds = 0
  let retreated = false
  const agentSkillUpdates: Record<string, number> = {}

  // Battle continues until one side is eliminated or agents retreat
  while (!shouldBattleEnd(agents, enemies)) {
    rounds += 1
    console.log(`\n⚔️ Combat Round ${rounds}`)

    executeCombatRound(agents, agentStats, enemies)

    // Check for retreat condition
    if (shouldRetreat(agents, agentStats)) {
      console.log('🏃 Agent mission commander orders retreat!')
      retreated = true
      break
    }
  }

  // Count casualties
  const agentsCasualties = agents.filter((agent) => agent.hitPoints <= 0).length
  const enemiesCasualties = enemies.filter((enemy) => enemy.hitPoints <= 0).length

  // Collect skill updates
  agentStats.forEach((stats) => {
    if (stats.skillGained > 0) {
      agentSkillUpdates[stats.id] = stats.skillGained
    }
  })

  console.log(`\n📊 Battle concluded after ${rounds} rounds`)
  console.log(`   Agent casualties: ${agentsCasualties}`)
  console.log(`   Enemy casualties: ${enemiesCasualties}`)

  return {
    rounds,
    agentsCasualties,
    enemiesCasualties,
    retreated,
    agentSkillUpdates,
  }
}

function shouldBattleEnd(agents: Agent[], enemies: EnemyUnit[]): boolean {
  const allAgentsTerminated = agents.every((agent) => agent.hitPoints <= 0)
  const allEnemiesTerminated = enemies.every((enemy) => enemy.hitPoints <= 0)
  return allAgentsTerminated || allEnemiesTerminated
}

function shouldRetreat(agents: Agent[], agentStats: AgentCombatStats[]): boolean {
  const totalOriginalEffectiveSkill = agentStats.reduce((sum, stats) => sum + stats.initialEffectiveSkill, 0)
  const totalCurrentEffectiveSkill = agents
    .filter((agent) => agent.hitPoints > 0)
    .reduce((sum, agent) => sum + agV(agent).effectiveSkill(), 0)

  return totalCurrentEffectiveSkill < totalOriginalEffectiveSkill * 0.5
}

function executeCombatRound(agents: Agent[], agentStats: AgentCombatStats[], enemies: EnemyUnit[]): void {
  // Agents attack in order of least skilled to most skilled
  const activeAgents = agents.filter((agent) => agent.hitPoints > 0)
  activeAgents.sort((agentA, agentB) => {
    if (agentA.skill === agentB.skill) return agentA.id.localeCompare(agentB.id)
    return agentA.skill - agentB.skill
  })

  // Each agent attacks
  for (const agent of activeAgents) {
    // Skip if terminated during this round
    if (agent.hitPoints > 0) {
      const target = selectTarget(enemies.filter((enemy) => enemy.hitPoints > 0))
      if (target) {
        const attackerStats = agentStats.find((stats) => stats.id === agent.id)
        executeAttack(agent, attackerStats, target)
      }
    }
  }

  // Enemies attack back
  const activeEnemies = enemies.filter((enemy) => enemy.hitPoints > 0)
  activeEnemies.sort((enemyA, enemyB) => {
    if (enemyA.skill === enemyB.skill) return enemyA.id.localeCompare(enemyB.id)
    return enemyA.skill - enemyB.skill
  })

  for (const enemy of activeEnemies) {
    // Skip if terminated during this round
    if (enemy.hitPoints > 0) {
      const target = selectTarget(agents.filter((agent) => agent.hitPoints > 0))
      if (target) {
        const defenderStats = agentStats.find((stats) => stats.id === target.id)
        executeAttack(enemy, undefined, target, defenderStats)
      }
    }
  }
}

function selectTarget<T extends Agent | EnemyUnit>(potentialTargets: T[]): T | undefined {
  if (potentialTargets.length === 0) return undefined

  // Target the unit with lowest effective skill
  const sorted = [...potentialTargets].sort((targetA, targetB) => {
    const skillA = 'exhaustion' in targetA ? agV(targetA).effectiveSkill() : targetA.skill
    const skillB = 'exhaustion' in targetB ? agV(targetB).effectiveSkill() : targetB.skill
    if (skillA === skillB) return targetA.id.localeCompare(targetB.id)
    return skillA - skillB
  })

  return sorted[0]
}

function executeAttack(
  attacker: Agent | EnemyUnit,
  attackerStats: AgentCombatStats | undefined,
  defender: Agent | EnemyUnit,
  defenderStats?: AgentCombatStats,
): void {
  // Calculate effective skills
  const attackerEffectiveSkill = 'exhaustion' in attacker ? agV(attacker).effectiveSkill() : attacker.skill
  const defenderEffectiveSkill = 'exhaustion' in defender ? agV(defender).effectiveSkill() : defender.skill

  // Contest roll
  const contestResult = rollContest(attackerEffectiveSkill, defenderEffectiveSkill)

  // Apply exhaustion to attacker immediately
  if ('exhaustion' in attacker) {
    attacker.exhaustion += AGENT_EXHAUSTION_INCREASE_PER_ATTACK
  }

  if (contestResult.success) {
    // Successful attack - roll damage
    const damage = rollWeaponDamage(attacker.weapon)
    defender.hitPoints = Math.max(0, defender.hitPoints - damage)

    // Update skill gains (postponed)
    if (attackerStats) {
      attackerStats.skillGained += AGENT_SUCCESSFUL_ATTACK_SKILL_REWARD
    }
    if (defenderStats) {
      defenderStats.skillGained += AGENT_FAILED_DEFENSE_SKILL_REWARD
    }

    // Check if defender is terminated
    const attackerType = 'exhaustion' in attacker ? 'agent' : 'enemy'
    const defenderType = 'exhaustion' in defender ? 'agent' : 'enemy'

    if (defender.hitPoints <= 0) {
      console.log(`💀 ${attackerType} ${attacker.id} terminates ${defenderType} ${defender.id} with ${damage} damage!`)
    } else {
      console.log(
        `🩸 ${attackerType} ${attacker.id} hits ${defenderType} ${defender.id} for ${damage} damage (${defender.hitPoints}/${defender.maxHitPoints} HP remaining)`,
      )
    }

    // Apply defender exhaustion only if not terminated
    if (defender.hitPoints > 0 && 'exhaustion' in defender) {
      defender.exhaustion += AGENT_EXHAUSTION_INCREASE_PER_DEFENSE
    }
  } else {
    // Failed attack
    const attackerType = 'exhaustion' in attacker ? 'agent' : 'enemy'
    const defenderType = 'exhaustion' in defender ? 'agent' : 'enemy'
    console.log(`❌ ${attackerType} ${attacker.id} misses ${defenderType} ${defender.id}`)

    // Update skill gains (postponed)
    if (attackerStats) {
      attackerStats.skillGained += AGENT_FAILED_ATTACK_SKILL_REWARD
    }
    if (defenderStats) {
      defenderStats.skillGained += AGENT_SUCCESSFUL_DEFENSE_SKILL_REWARD
    }

    // Apply defender exhaustion
    if ('exhaustion' in defender) {
      defender.exhaustion += AGENT_EXHAUSTION_INCREASE_PER_DEFENSE
    }
  }
}
