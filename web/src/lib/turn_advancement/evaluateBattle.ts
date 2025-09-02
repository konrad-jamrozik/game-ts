import pluralize from 'pluralize'
import type { AgentsView } from '../model/agents/AgentsView'
import { agV } from '../model/agents/AgentView'
import type { Agent, Enemy } from '../model/model'
import { effectiveSkill } from '../utils/actorUtils'
import { assertNotEmpty } from '../utils/assert'
import { divMult100Round } from '../utils/mathUtils'
import { type AgentCombatStats, evaluateAttack, isAgent } from './evaluateAttack'

export type BattleReport = {
  rounds: number
  agentCasualties: number
  enemyCasualties: number
  retreated: boolean
  agentSkillUpdates: Record<string, number>
}

export function evaluateBattle(agentsView: AgentsView, enemies: Enemy[]): BattleReport {
  const agents = agentsView.toAgentArray()
  assertNotEmpty(agents)
  assertNotEmpty(enemies)

  const agentStats = newAgentsCombatStats(agentsView)

  let roundIdx = 0
  let retreated = false
  const agentSkillUpdates: Record<string, number> = {}

  // Calculate initial totals for percentage tracking
  const initialAgentEffectiveSkill = agentStats.reduce((sum, stats) => sum + stats.initialEffectiveSkill, 0)
  const initialAgentHitPoints = agents.reduce((sum, agent) => sum + agent.maxHitPoints, 0)
  const initialEnemySkill = enemies.reduce((sum, enemy) => sum + effectiveSkill(enemy), 0)
  const initialEnemyHitPoints = enemies.reduce((sum, enemy) => sum + enemy.maxHitPoints, 0)

  do {
    roundIdx += 1

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
    evaluateCombatRound(agents, agentStats, enemies)

    // Check for retreat condition
    if (shouldRetreat(agents, agentStats)) {
      console.log('🏃 Agent mission commander orders retreat!')
      retreated = true
      break
    }
    // Battle continues until one side is eliminated or agents retreat
  } while (!shouldBattleEnd(agents, enemies))

  // Count casualties
  const agentCasualties = agents.filter((agent) => agent.hitPoints <= 0).length
  const enemyCasualties = enemies.filter((enemy) => enemy.hitPoints <= 0).length

  // Collect skill updates
  agentStats.forEach((stats) => {
    agentSkillUpdates[stats.id] = stats.skillGained
  })

  showRoundStatus(
    roundIdx,
    agents,
    enemies,
    initialAgentEffectiveSkill,
    initialAgentHitPoints,
    initialEnemySkill,
    initialEnemyHitPoints,
    true,
  )

  console.log(`Agent casualties: ${agentCasualties} / ${agents.length}`)
  console.log(`Enemy casualties: ${enemyCasualties} / ${enemies.length}`)

  return {
    rounds: roundIdx,
    agentCasualties,
    enemyCasualties,
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
        evaluateAttack(agent, attackerStats, target, undefined, 'agent_attack_roll')
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
        evaluateAttack(enemy, undefined, target, defenderStats, 'enemy_attack_roll')
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

function showRoundStatus(
  rounds: number,
  agents: Agent[],
  enemies: Enemy[],
  initialAgentEffectiveSkill: number,
  initialAgentHitPoints: number,
  initialEnemySkill: number,
  initialEnemyHitPoints: number,
  battleConcluded = false,
): void {
  if (battleConcluded) {
    const roundsStr = pluralize('round', rounds)
    console.log(`\n========== 📊 Battle Concluded after ${rounds} ${roundsStr} ==========`)
  } else {
    console.log(`\n========== ⚔️ Combat Round ${rounds} ==========`)
  }

  // Current agent statistics
  const activeAgents = agents.filter((agent) => agent.hitPoints > 0)
  const currentAgentEffectiveSkill = activeAgents.reduce((sum, agent) => sum + agV(agent).effectiveSkill(), 0)
  const currentAgentHitPoints = activeAgents.reduce((sum, agent) => sum + agent.hitPoints, 0)
  const agentSkillPercentage = divMult100Round(currentAgentEffectiveSkill, initialAgentEffectiveSkill)
  const agentHpPercentage = divMult100Round(currentAgentHitPoints, initialAgentHitPoints)

  // Current enemy statistics
  const activeEnemies = enemies.filter((enemy) => enemy.hitPoints > 0)
  const currentEnemySkill = activeEnemies.reduce((sum, enemy) => sum + effectiveSkill(enemy), 0)
  const currentEnemyHitPoints = activeEnemies.reduce((sum, enemy) => sum + enemy.hitPoints, 0)
  const enemySkillPercentage = divMult100Round(currentEnemySkill, initialEnemySkill)
  const enemyHpPercentage = divMult100Round(currentEnemyHitPoints, initialEnemyHitPoints)

  console.log(
    `👤👤 Agents: ${activeAgents.length} units, ${Math.round(currentAgentEffectiveSkill)} total skill (${agentSkillPercentage}%), ${currentAgentHitPoints} HP (${agentHpPercentage}%)`,
  )
  console.log(
    `👺👺 Enemies: ${activeEnemies.length} units, ${Math.round(currentEnemySkill)} total skill (${enemySkillPercentage}%), ${currentEnemyHitPoints} HP (${enemyHpPercentage}%)`,
  )
}
