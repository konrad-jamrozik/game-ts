import pluralize from 'pluralize'
import type { AgentsView } from '../model/agents/AgentsView'
import { agV } from '../model/agents/AgentView'
import type { Agent, Enemy } from '../model/model'
import { RETREAT_ENEMY_SKILL_THRESHOLD, RETREAT_THRESHOLD } from '../model/ruleset/constants'
import { shouldRetreat, type RetreatResult } from '../model/ruleset/ruleset'
import { compareActorsBySkillDescending, effectiveSkill } from '../utils/actorUtils'
import { assertNotEmpty } from '../utils/assert'
import { addPctSignMult100Dec2 } from '../utils/formatUtils'
import { div, divMult100Round } from '../utils/mathUtils'
import { evaluateAttack, type AgentCombatStats } from './evaluateAttack'
import { selectTarget } from './selectTarget'

export type BattleReport = {
  rounds: number
  agentCasualties: number
  enemyCasualties: number
  retreated: boolean
  agentSkillUpdates: Record<string, number>
  initialAgentEffectiveSkill: number
  initialAgentHitPoints: number
  initialEnemySkill: number
  initialEnemyHitPoints: number
  totalDamageInflicted: number
  totalDamageTaken: number
  initialAgentExhaustion: number
  initialAgentExhaustionByAgentId: Record<string, number>
  agentExhaustionAfterBattle: number
  agentsWounded: number
  agentsUnscathed: number
}

export function evaluateBattle(agentsView: AgentsView, enemies: Enemy[]): BattleReport {
  const agents = agentsView.toAgentArray()
  assertNotEmpty(agents)
  assertNotEmpty(enemies)

  const agentStats = newAgentsCombatStats(agentsView)

  const agentSkillUpdates: Record<string, number> = {}

  // Calculate initial totals for percentage tracking
  const initialAgentEffectiveSkill = agentStats.reduce((sum, stats) => sum + stats.initialEffectiveSkill, 0)
  const initialAgentHitPoints = agents.reduce((sum, agent) => sum + agent.maxHitPoints, 0)
  const initialEnemySkill = enemies.reduce((sum, enemy) => sum + effectiveSkill(enemy), 0)
  const initialEnemyHitPoints = enemies.reduce((sum, enemy) => sum + enemy.maxHitPoints, 0)

  // Track initial agent exhaustion for calculating total exhaustion gain
  const initialAgentExhaustion = agents.reduce((sum, agent) => sum + agent.exhaustion, 0)
  const initialAgentExhaustionByAgentId: Record<string, number> = {}
  for (const agent of agents) {
    initialAgentExhaustionByAgentId[agent.id] = agent.exhaustion
  }

  // Track initial hit points for calculating damage
  const initialAgentHitPointsMap = new Map(agents.map((agent) => [agent.id, agent.hitPoints]))
  const initialEnemyHitPointsMap = new Map(enemies.map((enemy) => [enemy.id, enemy.hitPoints]))

  let roundIdx = 0
  let retreated = false
  // eslint-disable-next-line @typescript-eslint/init-declarations
  let battleEnded: boolean
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

    const sideEliminated = isSideEliminated(agents, enemies)
    if (!sideEliminated) {
      const retreatResult = shouldRetreat(agents, agentStats, enemies)
      retreated = retreatResult.shouldRetreat
      if (retreated) {
        logRetreat(retreatResult)
      }
    }
    battleEnded = sideEliminated || retreated

    // Battle continues until one side is eliminated or agents retreat
  } while (!battleEnded)

  // Count casualties - terminated and wounded
  const agentsTerminated = agents.filter((agent) => agent.hitPoints <= 0).length
  const agentsWounded = agents.filter((agent) => {
    const initialHp = initialAgentHitPointsMap.get(agent.id) ?? agent.maxHitPoints
    return agent.hitPoints > 0 && agent.hitPoints < initialHp
  }).length
  const agentCasualties = agentsWounded + agentsTerminated

  const enemiesTerminated = enemies.filter((enemy) => enemy.hitPoints <= 0).length
  const enemiesWounded = enemies.filter((enemy) => {
    const initialHp = initialEnemyHitPointsMap.get(enemy.id) ?? enemy.maxHitPoints
    return enemy.hitPoints > 0 && enemy.hitPoints < initialHp
  }).length
  const enemyCasualties = enemiesWounded + enemiesTerminated

  // Collect skill updates
  agentStats.forEach((stats) => {
    agentSkillUpdates[stats.id] = stats.skillGained
  })

  // Calculate total damage inflicted (by agents to enemies)
  let totalDamageInflicted = 0
  for (const enemy of enemies) {
    const initialHp = initialEnemyHitPointsMap.get(enemy.id) ?? enemy.maxHitPoints
    totalDamageInflicted += initialHp - enemy.hitPoints
  }

  // Calculate total damage taken (by agents from enemies)
  let totalDamageTaken = 0
  for (const agent of agents) {
    const initialHp = initialAgentHitPointsMap.get(agent.id) ?? agent.maxHitPoints
    totalDamageTaken += initialHp - agent.hitPoints
  }

  // agentExhaustionAfterBattle will be calculated in evaluateDeployedMissionSite after casualty penalty is applied

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

  console.log(
    `Agent casualties: ${agentCasualties} / ${agents.length} (${agentsWounded} wounded, ${agentsTerminated} terminated)`,
  )
  console.log(
    `Enemy casualties: ${enemyCasualties} / ${enemies.length} (${enemiesWounded} wounded, ${enemiesTerminated} terminated)`,
  )

  return {
    rounds: roundIdx,
    agentCasualties,
    enemyCasualties,
    retreated,
    agentSkillUpdates,
    initialAgentEffectiveSkill,
    initialAgentHitPoints,
    initialEnemySkill,
    initialEnemyHitPoints,
    totalDamageInflicted,
    totalDamageTaken,
    initialAgentExhaustion,
    initialAgentExhaustionByAgentId,
    agentExhaustionAfterBattle: 0, // Will be calculated in evaluateDeployedMissionSite after casualty penalty is applied
    agentsWounded: 0, // Will be set in updateAgentsAfterBattle
    agentsUnscathed: 0, // Will be set in updateAgentsAfterBattle
  }
}

function newAgentsCombatStats(agentViews: AgentsView): AgentCombatStats[] {
  return agentViews.map((agentView) => ({
    id: agentView.agent().id,
    initialEffectiveSkill: agentView.effectiveSkill(),
    skillGained: 0,
  }))
}

function isSideEliminated(agents: Agent[], enemies: Enemy[]): boolean {
  const allAgentsTerminated = agents.every((agent) => agent.hitPoints <= 0)
  const allEnemiesTerminated = enemies.every((enemy) => enemy.hitPoints <= 0)
  return allAgentsTerminated || allEnemiesTerminated
}

function logRetreat(retreatResult: RetreatResult): void {
  const agentEffectiveSkillPct = addPctSignMult100Dec2(
    div(retreatResult.totalCurrentEffectiveSkill, retreatResult.totalOriginalEffectiveSkill),
  )
  const retreatThresholdPct = addPctSignMult100Dec2(RETREAT_THRESHOLD)
  const enemySkillRatioPct = addPctSignMult100Dec2(retreatResult.enemySkillRatio)
  const enemySkillThresholdPct = addPctSignMult100Dec2(RETREAT_ENEMY_SKILL_THRESHOLD)
  console.log(
    `🏃 Agent mission commander orders retreat! ` +
      `Agent effective skill = ${agentEffectiveSkillPct} < ${retreatThresholdPct} threshold. ` +
      `Enemy skill ratio = ${enemySkillRatioPct} >= ${enemySkillThresholdPct} threshold.`,
  )
}

function evaluateCombatRound(agents: Agent[], agentStats: AgentCombatStats[], enemies: Enemy[]): void {
  // Track attack counts per target for fair distribution
  const enemyAttackCounts = new Map<string, number>()
  const agentAttackCounts = new Map<string, number>()

  // Calculate effective skills at round start to prevent targets from becoming more attractive
  // as they take damage during the round
  const effectiveSkillsAtRoundStart = new Map<string, number>()
  for (const agent of agents) {
    if (agent.hitPoints > 0) {
      effectiveSkillsAtRoundStart.set(agent.id, agV(agent).effectiveSkill())
    }
  }
  for (const enemy of enemies) {
    if (enemy.hitPoints > 0) {
      effectiveSkillsAtRoundStart.set(enemy.id, effectiveSkill(enemy))
    }
  }

  console.log('\n----- 👤🗡️ Agent Attack Phase -----')

  // Agents attack in order of least skilled to most skilled
  const activeAgents = agents.filter((agent) => agent.hitPoints > 0)
  activeAgents.sort(compareActorsBySkillDescending)

  // Each agent attacks
  for (const agent of activeAgents) {
    // Skip if terminated during this round
    if (agent.hitPoints > 0) {
      const activeEnemies = enemies.filter((enemy) => enemy.hitPoints > 0)
      const target = selectTarget(activeEnemies, enemyAttackCounts, agent, effectiveSkillsAtRoundStart)
      if (target) {
        const attackerStats = agentStats.find((stats) => stats.id === agent.id)
        const currentAttackCount = enemyAttackCounts.get(target.id) ?? 0
        evaluateAttack(agent, attackerStats, target, undefined, 'agent_attack_roll', currentAttackCount + 1)
        // Increment attack count for this enemy
        enemyAttackCounts.set(target.id, currentAttackCount + 1)
      }
    }
  }

  console.log('\n----- 👺🗡️ Enemy Attack Phase -----')

  // Enemies attack back
  const activeEnemies = enemies.filter((enemy) => enemy.hitPoints > 0)
  activeEnemies.sort(compareActorsBySkillDescending)

  for (const enemy of activeEnemies) {
    // Skip if terminated during this round
    if (enemy.hitPoints > 0) {
      const currentActiveAgents = agents.filter((agent) => agent.hitPoints > 0)
      const target = selectTarget(currentActiveAgents, agentAttackCounts, enemy, effectiveSkillsAtRoundStart)
      if (target) {
        const defenderStats = agentStats.find((stats) => stats.id === target.id)
        const currentAttackCount = agentAttackCounts.get(target.id) ?? 0
        evaluateAttack(enemy, undefined, target, defenderStats, 'enemy_attack_roll', currentAttackCount + 1)
        // Increment attack count for this agent
        agentAttackCounts.set(target.id, currentAttackCount + 1)
      }
    }
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
