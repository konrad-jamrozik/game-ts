import pluralize from 'pluralize'
import { sum } from 'radash'
import {
  toF6,
  toF6r,
  f6fmtInt,
  f6fmtPctDec0,
  f6cmp,
  f6div,
  f6eq,
  f6sum,
  f6gt,
  f6lt,
  f6le,
  toF,
  type Fixed6,
} from '../../primitives/fixed6'
import type { Actor, Enemy } from '../../model/model'
import type { Agent, AgentCombatStats } from '../../model/agentModel'
import { AGENTS_SKILL_RETREAT_THRESHOLD, RETREAT_ENEMY_TO_AGENTS_SKILL_THRESHOLD } from '../../ruleset/constants'
import { shouldRetreat, type RetreatResult } from '../../ruleset/missionRuleset'
import { effectiveSkill, canParticipateInBattle } from '../../ruleset/skillRuleset'
import { assertDefined, assertNotEmpty } from '../../primitives/assertPrimitives'
import { fmtPctDec0 } from '../../primitives/formatPrimitives'
import { evaluateAttack } from './evaluateAttack'
import { selectTarget } from './selectTarget'
import { compareIdsNumeric } from '../../primitives/stringPrimitives'
import type { RoundLog, AttackLog } from '../../model/turnReportModel'
import type { BattleOutcome } from '../../model/outcomeTypes'

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
  roundLogs: RoundLog[]
  attackLogs: AttackLog[]
}

export function evaluateBattle(agents: Agent[], enemies: Enemy[]): BattleReport {
  assertNotEmpty(agents)
  assertNotEmpty(enemies)

  const agentStats = newAgentsCombatStats(agents)

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
  const initialAgentHitPointsMap = new Map<string, Fixed6>(agents.map((agent) => [agent.id, agent.hitPoints]))
  const initialEnemyHitPointsMap = new Map<string, Fixed6>(enemies.map((enemy) => [enemy.id, enemy.hitPoints]))

  // Track initial enemy effective skills (similar to agentStats for agents)
  const initialEnemyEffectiveSkillMap = new Map<string, Fixed6>(
    enemies.map((enemy) => [enemy.id, effectiveSkill(enemy)]),
  )

  const roundLogs: RoundLog[] = []
  const attackLogs: AttackLog[] = []

  let roundIdx = 0
  let combatRounds = 0
  let retreated = false
  // eslint-disable-next-line @typescript-eslint/init-declarations
  let battleEnded: boolean
  do {
    roundIdx += 1
    combatRounds += 1

    // Capture round state at start of round (before combat)
    const activeAgentsAtRoundStart = agents.filter(
      (agent) => f6gt(agent.hitPoints, toF6(0)) && canParticipateInBattle(agent),
    )
    const activeEnemiesAtRoundStart = enemies.filter(
      (enemy) => f6gt(enemy.hitPoints, toF6(0)) && canParticipateInBattle(enemy),
    )
    const agentSkillAtRoundStart = f6sum(...activeAgentsAtRoundStart.map((agent) => effectiveSkill(agent)))
    const agentHpAtRoundStart = sum(activeAgentsAtRoundStart, (agent) => toF(agent.hitPoints))
    const enemySkillAtRoundStart = f6sum(...activeEnemiesAtRoundStart.map((enemy) => effectiveSkill(enemy)))
    const enemyHpAtRoundStart = sum(activeEnemiesAtRoundStart, (enemy) => toF(enemy.hitPoints))
    const skillRatioAtRoundStart = toF6r(f6div(enemySkillAtRoundStart, agentSkillAtRoundStart))

    // // Show round status with detailed statistics
    // showRoundStatus(
    //   roundIdx,
    //   agents,
    //   enemies,
    //   initialAgentEffectiveSkill,
    //   initialAgentHitPoints,
    //   initialEnemySkill,
    //   initialEnemyHitPoints,
    // )

    const roundAttackLogs = evaluateCombatRound(agents, agentStats, enemies, initialEnemyEffectiveSkillMap, roundIdx)
    attackLogs.push(...roundAttackLogs)

    const sideEliminated = isSideEliminated(agents, enemies)

    // Create round log entry for current round showing state at round START (before combat).
    // Status is always 'Ongoing' here; the final battle outcome is recorded in the end-of-battle log.
    const roundLog: RoundLog = {
      roundNumber: roundIdx,
      status: 'Ongoing',
      agentCount: activeAgentsAtRoundStart.length,
      agentCountTotal: agents.length,
      agentSkill: agentSkillAtRoundStart,
      agentSkillTotal: initialAgentEffectiveSkill,
      agentHp: agentHpAtRoundStart,
      agentHpTotal: initialAgentHitPoints,
      enemyCount: activeEnemiesAtRoundStart.length,
      enemyCountTotal: enemies.length,
      enemySkill: enemySkillAtRoundStart,
      enemySkillTotal: initialEnemySkill,
      enemyHp: enemyHpAtRoundStart,
      enemyHpTotal: initialEnemyHitPoints,
      skillRatio: skillRatioAtRoundStart,
    }
    roundLogs.push(roundLog)

    // Check for retreat after logging current round
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

  // Create end-of-battle round log showing final state after all combat.
  // This provides a consistent pattern: all combat round logs show state at round start,
  // and this final log shows the state after the battle concludes.
  const zeroF6 = toF6(0)
  const activeAgentsAtBattleEnd = agents.filter(
    (agent) => f6gt(agent.hitPoints, zeroF6) && canParticipateInBattle(agent),
  )
  const activeEnemiesAtBattleEnd = enemies.filter(
    (enemy) => f6gt(enemy.hitPoints, zeroF6) && canParticipateInBattle(enemy),
  )
  const agentSkillAtBattleEnd = f6sum(...activeAgentsAtBattleEnd.map((agent) => effectiveSkill(agent)))
  const agentHpAtBattleEnd = sum(activeAgentsAtBattleEnd, (agent) => toF(agent.hitPoints))
  const enemySkillAtBattleEnd = f6sum(...activeEnemiesAtBattleEnd.map((enemy) => effectiveSkill(enemy)))
  const enemyHpAtBattleEnd = sum(activeEnemiesAtBattleEnd, (enemy) => toF(enemy.hitPoints))
  // When all agents are terminated, skill ratio is undefined (division by zero).
  // Use 0 as a placeholder - the 'Wiped' status already conveys the battle outcome.
  const skillRatioAtBattleEnd = f6eq(agentSkillAtBattleEnd, zeroF6)
    ? zeroF6
    : toF6r(f6div(enemySkillAtBattleEnd, agentSkillAtBattleEnd))

  const allAgentsTerminated = agents.every((agent) => f6le(agent.hitPoints, toF6(0)))
  const endOfBattleStatus: BattleOutcome = retreated ? 'Retreated' : allAgentsTerminated ? 'Wiped' : 'Won'

  const endOfBattleLog: RoundLog = {
    roundNumber: roundIdx + 1,
    status: endOfBattleStatus,
    agentCount: activeAgentsAtBattleEnd.length,
    agentCountTotal: agents.length,
    agentSkill: agentSkillAtBattleEnd,
    agentSkillTotal: initialAgentEffectiveSkill,
    agentHp: agentHpAtBattleEnd,
    agentHpTotal: initialAgentHitPoints,
    enemyCount: activeEnemiesAtBattleEnd.length,
    enemyCountTotal: enemies.length,
    enemySkill: enemySkillAtBattleEnd,
    enemySkillTotal: initialEnemySkill,
    enemyHp: enemyHpAtBattleEnd,
    enemyHpTotal: initialEnemyHitPoints,
    skillRatio: skillRatioAtBattleEnd,
  }
  roundLogs.push(endOfBattleLog)

  // Count casualties - terminated and wounded
  const agentsTerminated = agents.filter((agent) => f6le(agent.hitPoints, zeroF6)).length
  const agentsWounded = agents.filter((agent) => {
    const initialHp = initialAgentHitPointsMap.get(agent.id) ?? toF6(agent.maxHitPoints)
    return f6gt(agent.hitPoints, zeroF6) && f6lt(agent.hitPoints, initialHp)
  }).length
  const agentCasualties = agentsWounded + agentsTerminated

  const enemiesTerminated = enemies.filter((enemy) => f6le(enemy.hitPoints, zeroF6)).length
  const enemiesWounded = enemies.filter((enemy) => {
    const initialHp = initialEnemyHitPointsMap.get(enemy.id) ?? toF6(enemy.maxHitPoints)
    return f6gt(enemy.hitPoints, zeroF6) && f6lt(enemy.hitPoints, initialHp)
  }).length
  const enemyCasualties = enemiesWounded + enemiesTerminated

  // Collect skill updates
  agentStats.forEach((stats) => {
    agentSkillUpdates[stats.id] = stats.skillGained
  })

  // Calculate total damage inflicted (by agents to enemies)
  let totalDamageInflicted = 0
  for (const enemy of enemies) {
    const initialHp = initialEnemyHitPointsMap.get(enemy.id) ?? toF6(enemy.maxHitPoints)
    totalDamageInflicted += toF(initialHp) - toF(enemy.hitPoints)
  }

  // Calculate total damage taken (by agents from enemies)
  let totalDamageTaken = 0
  for (const agent of agents) {
    const initialHp = initialAgentHitPointsMap.get(agent.id) ?? toF6(agent.maxHitPoints)
    totalDamageTaken += toF(initialHp) - toF(agent.hitPoints)
  }

  // agentExhaustionAfterBattle will be calculated in evaluateDeployedMissionSite after casualty penalty is applied

  showRoundStatus(
    combatRounds,
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
    rounds: combatRounds,
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
    roundLogs,
    attackLogs,
  }
}

function newAgentsCombatStats(agents: Agent[]): AgentCombatStats[] {
  return agents.map((agent: Agent) => ({
    id: agent.id,
    initialEffectiveSkill: effectiveSkill(agent),
    skillGained: toF6(0),
  }))
}

function isSideEliminated(agents: Agent[], enemies: Enemy[]): boolean {
  const zeroF6 = toF6(0)
  // A side is eliminated when all units are either terminated (HP <= 0) or incapacitated (effective skill < 10% base)
  const allAgentsEliminated = agents.every((agent) => f6le(agent.hitPoints, zeroF6) || !canParticipateInBattle(agent))
  const allEnemiesEliminated = enemies.every((enemy) => f6le(enemy.hitPoints, zeroF6) || !canParticipateInBattle(enemy))
  return allAgentsEliminated || allEnemiesEliminated
}

function logRetreat(retreatResult: RetreatResult): void {
  const agentsEffectiveSkillPct = f6div(
    retreatResult.agentsTotalCurrentEffectiveSkill,
    retreatResult.agentsTotalOriginalEffectiveSkill,
  )
  const agentsSkillPctFmt = fmtPctDec0(agentsEffectiveSkillPct)
  const agentsSkillThresholdFmt = fmtPctDec0(AGENTS_SKILL_RETREAT_THRESHOLD)
  const enemyToAgentsSkillRatioFmt = f6fmtPctDec0(retreatResult.enemyToAgentsSkillRatio)
  const enemyToAgentsSkillThresholdFmt = fmtPctDec0(RETREAT_ENEMY_TO_AGENTS_SKILL_THRESHOLD)
  console.log(
    `🏃 Agent mission commander orders retreat! ` +
      `Agents Current/Total skill = ${agentsSkillPctFmt} < ${agentsSkillThresholdFmt} threshold. ` +
      `Enemy/Agents skill ratio = ${enemyToAgentsSkillRatioFmt} >= ${enemyToAgentsSkillThresholdFmt} threshold.`,
  )
}

function evaluateCombatRound(
  agents: Agent[],
  agentStats: AgentCombatStats[],
  enemies: Enemy[],
  initialEnemyEffectiveSkillMap: Map<string, Fixed6>,
  roundNumber: number,
): AttackLog[] {
  const attackLogs: AttackLog[] = []

  // Track attack counts per target for fair distribution
  const enemyAttackCounts = new Map<string, number>()
  const agentAttackCounts = new Map<string, number>()

  // Calculate effective skills at round start to prevent targets from becoming more attractive
  // as they take damage during the round
  const zeroF6 = toF6(0)
  const effectiveSkillsAtRoundStart = new Map<string, Fixed6>()
  for (const agent of agents) {
    if (f6gt(agent.hitPoints, zeroF6) && canParticipateInBattle(agent)) {
      effectiveSkillsAtRoundStart.set(agent.id, effectiveSkill(agent))
    }
  }
  for (const enemy of enemies) {
    if (f6gt(enemy.hitPoints, zeroF6) && canParticipateInBattle(enemy)) {
      effectiveSkillsAtRoundStart.set(enemy.id, effectiveSkill(enemy))
    }
  }

  // console.log('\n----- 👤🗡️ Agent Attack Phase -----')

  // Agents attack in order of least skilled to most skilled
  const activeAgents = agents.filter((agent) => f6gt(agent.hitPoints, zeroF6) && canParticipateInBattle(agent))
  activeAgents.sort(compareActorsBySkillDescending)

  // Each agent attacks
  for (const agent of activeAgents) {
    // Skip if terminated or incapacitated during this round
    if (f6gt(agent.hitPoints, zeroF6) && canParticipateInBattle(agent)) {
      const activeEnemies = enemies.filter((enemy) => f6gt(enemy.hitPoints, zeroF6) && canParticipateInBattle(enemy))
      const target = selectTarget(activeEnemies, enemyAttackCounts, agent, effectiveSkillsAtRoundStart)
      if (target) {
        const attackerStats = agentStats.find((stats) => stats.id === agent.id)
        assertDefined(attackerStats)
        const attackerSkillAtStart = attackerStats.initialEffectiveSkill
        const defenderSkillAtStart = initialEnemyEffectiveSkillMap.get(target.id) ?? toF6(0)
        const currentAttackCount = enemyAttackCounts.get(target.id) ?? 0
        const attackLog = evaluateAttack(
          agent,
          attackerStats,
          target,
          undefined,
          attackerSkillAtStart,
          defenderSkillAtStart,
          roundNumber,
          'agent_attack_roll',
          currentAttackCount + 1,
        )
        attackLogs.push(attackLog)
        // Increment attack count for this enemy
        enemyAttackCounts.set(target.id, currentAttackCount + 1)
      }
    }
  }

  // console.log('\n----- 👺🗡️ Enemy Attack Phase -----')

  // Enemies attack back
  const activeEnemies = enemies.filter((enemy) => f6gt(enemy.hitPoints, zeroF6) && canParticipateInBattle(enemy))
  activeEnemies.sort(compareActorsBySkillDescending)

  for (const enemy of activeEnemies) {
    // Skip if terminated or incapacitated during this round
    if (f6gt(enemy.hitPoints, zeroF6) && canParticipateInBattle(enemy)) {
      const currentActiveAgents = agents.filter(
        (agent) => f6gt(agent.hitPoints, zeroF6) && canParticipateInBattle(agent),
      )
      const target = selectTarget(currentActiveAgents, agentAttackCounts, enemy, effectiveSkillsAtRoundStart)
      if (target) {
        const defenderStats = agentStats.find((stats) => stats.id === target.id)
        assertDefined(defenderStats)
        const attackerSkillAtStart = initialEnemyEffectiveSkillMap.get(enemy.id) ?? toF6(0)
        const defenderSkillAtStart = defenderStats.initialEffectiveSkill
        const currentAttackCount = agentAttackCounts.get(target.id) ?? 0
        const attackLog = evaluateAttack(
          enemy,
          undefined,
          target,
          defenderStats,
          attackerSkillAtStart,
          defenderSkillAtStart,
          roundNumber,
          'enemy_attack_roll',
          currentAttackCount + 1,
        )
        attackLogs.push(attackLog)
        // Increment attack count for this agent
        agentAttackCounts.set(target.id, currentAttackCount + 1)
      }
    }
  }

  return attackLogs
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
  const activeAgents = agents.filter((agent) => f6gt(agent.hitPoints, toF6(0)) && canParticipateInBattle(agent))
  const currentAgentEffectiveSkill = f6sum(...activeAgents.map((agent) => effectiveSkill(agent)))
  const currentAgentHitPoints = sum(activeAgents, (agent) => toF(agent.hitPoints))
  const agentSkillPct = f6fmtPctDec0(currentAgentEffectiveSkill, initialAgentEffectiveSkill)
  const agentHpPct = fmtPctDec0(currentAgentHitPoints, initialAgentHitPoints)

  // Current enemy statistics
  const activeEnemies = enemies.filter((enemy) => f6gt(enemy.hitPoints, toF6(0)) && canParticipateInBattle(enemy))
  const currentEnemyEffectiveSkill = f6sum(...activeEnemies.map((enemy) => effectiveSkill(enemy)))
  const currentEnemyHitPoints = sum(activeEnemies, (enemy) => toF(enemy.hitPoints))
  const enemySkillPct = f6fmtPctDec0(currentEnemyEffectiveSkill, initialEnemySkill)
  const enemyHpPct = fmtPctDec0(currentEnemyHitPoints, initialEnemyHitPoints)

  console.log(
    `👤👤 Agents: ${activeAgents.length} units, ${f6fmtInt(currentAgentEffectiveSkill)} total skill (${agentSkillPct}), ${currentAgentHitPoints} HP (${agentHpPct})`,
  )
  console.log(
    `👺👺 Enemies: ${activeEnemies.length} units, ${f6fmtInt(currentEnemyEffectiveSkill)} total skill (${enemySkillPct}), ${currentEnemyHitPoints} HP (${enemyHpPct})`,
  )
}

// Helper function to compare actors by effective skill descending (higher skill first), then by ID if skills are equal
function compareActorsBySkillDescending(actorA: Actor, actorB: Actor): number {
  const skillA = effectiveSkill(actorA)
  const skillB = effectiveSkill(actorB)
  if (f6eq(skillA, skillB)) {
    return compareIdsNumeric(actorA.id, actorB.id)
  }
  // Return the actor with higher effective skill as first.
  // Explanation:
  // sort() will return actorA as first if output is negative, i.e. when skillB < skillA.
  return f6cmp(skillB, skillA)
}
