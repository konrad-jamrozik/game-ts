/* eslint-disable max-lines */
import {
  AGENT_SUCCESSFUL_ATTACK_SKILL_REWARD,
  AGENT_FAILED_ATTACK_SKILL_REWARD,
  AGENT_SUCCESSFUL_DEFENSE_SKILL_REWARD,
  AGENT_FAILED_DEFENSE_SKILL_REWARD,
  AGENT_EXHAUSTION_INCREASE_PER_ATTACK,
  AGENT_EXHAUSTION_INCREASE_PER_DEFENSE,
} from '../model/ruleset/constants'
import { rollContest } from './rolls'
import { rollWeaponDamage } from '../utils/weaponUtils'
import type { Agent, Enemy } from '../model/model'
import { agV } from '../model/agents/AgentView'
import { effectiveSkill } from '../utils/actorUtils'
import { fmtPctDec2 } from '../utils/formatUtils'
import type { AgentsView } from '../model/agents/AgentsView'
import { assertDefined } from '../utils/assert'

function isAgent(unit: Agent | Enemy): unit is Agent {
  return 'turnHired' in unit
}

export type AgentCombatStats = {
  id: string
  initialEffectiveSkill: number
  skillGained: number
}

export type BattleReport = {
  rounds: number
  agentsCasualties: number
  enemiesCasualties: number
  retreated: boolean
  agentSkillUpdates: Record<string, number>
}

export function evaluateBattle(agentsView: AgentsView, enemies: Enemy[]): BattleReport {
  const agents = agentsView.toAgentArray()
  const agentStats = newAgentsCombatStats(agentsView)

  let roundIdx = 1
  let retreated = false
  const agentSkillUpdates: Record<string, number> = {}

  // Calculate initial totals for percentage tracking
  const initialAgentEffectiveSkill = agentStats.reduce((sum, stats) => sum + stats.initialEffectiveSkill, 0)
  const initialAgentHitPoints = agents.reduce((sum, agent) => sum + agent.maxHitPoints, 0)
  const initialEnemySkill = enemies.reduce((sum, enemy) => sum + effectiveSkill(enemy), 0)
  const initialEnemyHitPoints = enemies.reduce((sum, enemy) => sum + enemy.maxHitPoints, 0)

  // Show round status with detailed statistics
  showRoundStatus(
    roundIdx,
    agents,
    enemies,
    initialAgentEffectiveSkill,
    initialAgentHitPoints,
    initialEnemySkill,
    initialEnemyHitPoints,
  )
  // Battle continues until one side is eliminated or agents retreat
  while (!shouldBattleEnd(agents, enemies)) {
    roundIdx += 1

    evaluateCombatRound(agents, agentStats, enemies)

    // Show round status with detailed statistics
    showRoundStatus(
      roundIdx,
      agents,
      enemies,
      initialAgentEffectiveSkill,
      initialAgentHitPoints,
      initialEnemySkill,
      initialEnemyHitPoints,
    )

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

  console.log(`\n📊 Battle concluded after ${roundIdx} rounds`)
  console.log(`   Agent casualties: ${agentsCasualties}`)
  console.log(`   Enemy casualties: ${enemiesCasualties}`)

  return {
    rounds: roundIdx,
    agentsCasualties,
    enemiesCasualties,
    retreated,
    agentSkillUpdates,
  }
}

function newAgentsCombatStats(agentViews: AgentsView): AgentCombatStats[] {
  return agentViews.map((agentView) => ({
    id: agentView.agent().id,
    initialEffectiveSkill: agentView.effectiveSkill(),
    skillGained: 0,
  }))
}

function shouldBattleEnd(agents: Agent[], enemies: Enemy[]): boolean {
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

function evaluateCombatRound(agents: Agent[], agentStats: AgentCombatStats[], enemies: Enemy[]): void {
  // Track attack counts per target for fair distribution
  const enemyAttackCounts = new Map<string, number>()
  const agentAttackCounts = new Map<string, number>()

  console.log('\n----- 👤🗡️ Agent Attack Phase -----')

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
      const activeEnemies = enemies.filter((enemy) => enemy.hitPoints > 0)
      const target = selectTargetWithFairDistribution(activeEnemies, enemyAttackCounts)
      if (target) {
        const attackerStats = agentStats.find((stats) => stats.id === agent.id)
        evaluateAttack(agent, attackerStats, target)
        // Increment attack count for this enemy
        enemyAttackCounts.set(target.id, (enemyAttackCounts.get(target.id) ?? 0) + 1)
      }
    }
  }

  console.log('\n----- 👺🗡️ Enemy Attack Phase -----')

  // Enemies attack back
  const activeEnemies = enemies.filter((enemy) => enemy.hitPoints > 0)
  activeEnemies.sort((enemyA, enemyB) => {
    if (enemyA.skill === enemyB.skill) return enemyA.id.localeCompare(enemyB.id)
    return enemyA.skill - enemyB.skill
  })

  for (const enemy of activeEnemies) {
    // Skip if terminated during this round
    if (enemy.hitPoints > 0) {
      const currentActiveAgents = agents.filter((agent) => agent.hitPoints > 0)
      const target = selectTargetWithFairDistribution(currentActiveAgents, agentAttackCounts)
      if (target) {
        const defenderStats = agentStats.find((stats) => stats.id === target.id)
        evaluateAttack(enemy, undefined, target, defenderStats)
        // Increment attack count for this agent
        agentAttackCounts.set(target.id, (agentAttackCounts.get(target.id) ?? 0) + 1)
      }
    }
  }
}

function selectTargetWithFairDistribution<T extends Agent | Enemy>(
  potentialTargets: T[],
  attackCounts: Map<string, number>,
): T | undefined {
  if (potentialTargets.length === 0) return undefined

  // Find minimum attack count among all potential targets
  const minAttackCount = Math.min(...potentialTargets.map((target) => attackCounts.get(target.id) ?? 0))

  // Filter to targets with minimum attack count
  const leastAttackedTargets = potentialTargets.filter(
    (target) => (attackCounts.get(target.id) ?? 0) === minAttackCount,
  )

  // Among least attacked targets, select the one with lowest effective skill
  const sorted = [...leastAttackedTargets].sort((targetA, targetB) => {
    const skillA = isAgent(targetA) ? agV(targetA).effectiveSkill() : effectiveSkill(targetA)
    const skillB = isAgent(targetB) ? agV(targetB).effectiveSkill() : effectiveSkill(targetB)
    if (skillA === skillB) return targetA.id.localeCompare(targetB.id)
    return skillA - skillB
  })

  return sorted[0]
}

function evaluateAttack(
  attacker: Agent | Enemy,
  attackerStats: AgentCombatStats | undefined,
  defender: Agent | Enemy,
  defenderStats?: AgentCombatStats,
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
  const contestResult = rollContest(attackerEffectiveSkill, defenderEffectiveSkill)

  // Apply exhaustion to attacker immediately (both agents and enemies get exhausted)
  attacker.exhaustion += AGENT_EXHAUSTION_INCREASE_PER_ATTACK

  const attackerIcon = isAgent(attacker) ? '👤' : '👺'
  const defenderIcon = isAgent(defender) ? '👤' : '👺'
  const attackerName = attacker.id
  const defenderName = defender.id

  if (contestResult.success) {
    // Successful attack - roll damage
    const damage = rollWeaponDamage(attacker.weapon)
    const damageRangePct =
      ((damage - attacker.weapon.minDamage) / (attacker.weapon.maxDamage - attacker.weapon.minDamage)) * 100
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
      const hpPercentage = Math.round((defender.hitPoints / defender.maxHitPoints) * 100)
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

function showRoundStatus(
  rounds: number,
  agents: Agent[],
  enemies: Enemy[],
  initialAgentEffectiveSkill: number,
  initialAgentHitPoints: number,
  initialEnemySkill: number,
  initialEnemyHitPoints: number,
): void {
  console.log(`\n========== ⚔️ Combat Round ${rounds} ==========`)

  // Current agent statistics
  const activeAgents = agents.filter((agent) => agent.hitPoints > 0)
  const currentAgentEffectiveSkill = activeAgents.reduce((sum, agent) => sum + agV(agent).effectiveSkill(), 0)
  const currentAgentHitPoints = activeAgents.reduce((sum, agent) => sum + agent.hitPoints, 0)
  const agentSkillPercentage = Math.round((currentAgentEffectiveSkill / initialAgentEffectiveSkill) * 100)
  const agentHpPercentage = Math.round((currentAgentHitPoints / initialAgentHitPoints) * 100)

  // Current enemy statistics
  const activeEnemies = enemies.filter((enemy) => enemy.hitPoints > 0)
  const currentEnemySkill = activeEnemies.reduce((sum, enemy) => sum + effectiveSkill(enemy), 0)
  const currentEnemyHitPoints = activeEnemies.reduce((sum, enemy) => sum + enemy.hitPoints, 0)
  const enemySkillPercentage = Math.round((currentEnemySkill / initialEnemySkill) * 100)
  const enemyHpPercentage = Math.round((currentEnemyHitPoints / initialEnemyHitPoints) * 100)

  console.log(
    `👤👤 Agents: ${activeAgents.length} units, ${Math.round(currentAgentEffectiveSkill)} total skill (${agentSkillPercentage}%), ${currentAgentHitPoints} HP (${agentHpPercentage}%)`,
  )
  console.log(
    `👺👺 Enemies: ${activeEnemies.length} units, ${Math.round(currentEnemySkill)} total skill (${enemySkillPercentage}%), ${currentEnemyHitPoints} HP (${enemyHpPercentage}%)`,
  )
}
