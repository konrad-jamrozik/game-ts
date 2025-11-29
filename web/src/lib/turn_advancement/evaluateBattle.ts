import pluralize from 'pluralize'
import { sum } from 'radash'
import type { AgentsView } from '../model/agents/AgentsView'
import { agV, type AgentView } from '../model/agents/AgentView'
import { asF6, f6div, f6fmtInt, f6fmtPctDec0, f6sum, type Fixed6 } from '../model/fixed6'
import type { Agent, Enemy } from '../model/model'
import { AGENTS_SKILL_RETREAT_THRESHOLD, RETREAT_ENEMY_TO_AGENTS_SKILL_THRESHOLD } from '../model/ruleset/constants'
import { shouldRetreat, type RetreatResult } from '../model/ruleset/missionRuleset'
import { compareActorsBySkillDescending, effectiveSkill } from '../utils/actorUtils'
import { assertNotEmpty } from '../utils/assert'
import { fmtPctDec0 } from '../utils/formatUtils'
import { evaluateAttack, type AgentCombatStats } from './evaluateAttack'
import { selectTarget } from './selectTarget'

export type BattleReport = {
  rounds: number
  agentCasualties: number
  agentsTerminated: number
  enemyCasualties: number
  retreated: boolean
  agentSkillUpdates: Record<string, Fixed6>
  initialAgentEffectiveSkill: Fixed6
  initialAgentHitPoints: number
  initialEnemySkill: Fixed6
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

  const agentSkillUpdates: Record<string, Fixed6> = {}

  // Calculate initial totals for percentage tracking
  const initialAgentEffectiveSkill = f6sum(...agentStats.map((stats) => stats.initialEffectiveSkill))
  const initialAgentHitPoints = sum(agents, (agent) => agent.maxHitPoints)
  const initialEnemySkill = f6sum(...enemies.map((enemy) => effectiveSkill(enemy)))
  const initialEnemyHitPoints = sum(enemies, (enemy) => enemy.maxHitPoints)

  // Track initial agent exhaustion for calculating total exhaustion gain
  const initialAgentExhaustion = sum(agents, (agent) => agent.exhaustion)
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
    agentsTerminated,
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
  return agentViews.map((agentView: AgentView) => ({
    id: agentView.agent().id,
    initialEffectiveSkill: agentView.effectiveSkill(),
    skillGained: asF6(0),
  }))
}

function isSideEliminated(agents: Agent[], enemies: Enemy[]): boolean {
  const allAgentsTerminated = agents.every((agent) => agent.hitPoints <= 0)
  const allEnemiesTerminated = enemies.every((enemy) => enemy.hitPoints <= 0)
  return allAgentsTerminated || allEnemiesTerminated
}

function logRetreat(retreatResult: RetreatResult): void {
  const agentsEffectiveSkillPct = f6div(
    retreatResult.agentsTotalCurrentEffectiveSkill,
    retreatResult.agentsTotalOriginalEffectiveSkill,
  )
  const agentsSkillPctFmt = f6fmtPctDec0(agentsEffectiveSkillPct)
  const agentsSkillThresholdFmt = fmtPctDec0(AGENTS_SKILL_RETREAT_THRESHOLD)
  const enemyToAgentsSkillRatioFmt = f6fmtPctDec0(retreatResult.enemyToAgentsSkillRatio)
  const enemyToAgentsSkillThresholdFmt = fmtPctDec0(RETREAT_ENEMY_TO_AGENTS_SKILL_THRESHOLD)
  console.log(
    `🏃 Agent mission commander orders retreat! ` +
      `Agents Current/Total skill = ${agentsSkillPctFmt} < ${agentsSkillThresholdFmt} threshold. ` +
      `Enemy/Agents skill ratio = ${enemyToAgentsSkillRatioFmt} >= ${enemyToAgentsSkillThresholdFmt} threshold.`,
  )
}

function evaluateCombatRound(agents: Agent[], agentStats: AgentCombatStats[], enemies: Enemy[]): void {
  // Track attack counts per target for fair distribution
  const enemyAttackCounts = new Map<string, number>()
  const agentAttackCounts = new Map<string, number>()

  // Calculate effective skills at round start to prevent targets from becoming more attractive
  // as they take damage during the round
  const effectiveSkillsAtRoundStart = new Map<string, Fixed6>()
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
  initialAgentEffectiveSkill: Fixed6,
  initialAgentHitPoints: number,
  initialEnemySkill: Fixed6,
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
  const currentAgentEffectiveSkill = f6sum(...activeAgents.map((agent) => agV(agent).effectiveSkill()))
  const currentAgentHitPoints = sum(activeAgents, (agent) => agent.hitPoints)
  const agentSkillPct = f6fmtPctDec0(currentAgentEffectiveSkill, initialAgentEffectiveSkill)
  const agentHpPct = fmtPctDec0(currentAgentHitPoints, initialAgentHitPoints)

  // Current enemy statistics
  const activeEnemies = enemies.filter((enemy) => enemy.hitPoints > 0)
  const currentEnemySkill = f6sum(...activeEnemies.map((enemy) => effectiveSkill(enemy)))
  const currentEnemyHitPoints = sum(activeEnemies, (enemy) => enemy.hitPoints)
  const enemySkillPct = f6fmtPctDec0(currentEnemySkill, initialEnemySkill)
  const enemyHpPct = fmtPctDec0(currentEnemyHitPoints, initialEnemyHitPoints)

  console.log(
    `👤👤 Agents: ${activeAgents.length} units, ${f6fmtInt(currentAgentEffectiveSkill)} total skill (${agentSkillPct}), ${currentAgentHitPoints} HP (${agentHpPct})`,
  )
  console.log(
    `👺👺 Enemies: ${activeEnemies.length} units, ${f6fmtInt(currentEnemySkill)} total skill (${enemySkillPct}), ${currentEnemyHitPoints} HP (${enemyHpPct})`,
  )
}
