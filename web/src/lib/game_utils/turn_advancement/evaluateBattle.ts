import pluralize from 'pluralize'
import { sum } from 'radash'
import {
  f6c0,
  f6fmtInt,
  f6fmtPctDec0,
  f6cmp,
  f6eq,
  f6sumBy,
  f6gt,
  f6lt,
  f6le,
  toF,
  type Fixed6,
} from '../../primitives/fixed6'
import type { Actor } from '../../model/actorModel'
import type { Enemy } from '../../model/enemyModel'
import type { Agent, AgentCombatStats } from '../../model/agentModel'
import {
  AGENTS_COMBAT_RATING_RETREAT_THRESHOLD,
  RETREAT_ENEMY_TO_AGENTS_COMBAT_RATING_THRESHOLD,
} from '../../data_tables/constants'
import { shouldRetreat, canParticipateInBattle, isIncapacitated, type RetreatResult } from '../../ruleset/missionRuleset'
import { effectiveSkill } from '../../ruleset/skillRuleset'
import { calculateCombatRating } from '../../ruleset/combatRatingRuleset'
import { assertDefined, assertNotEmpty } from '../../primitives/assertPrimitives'
import { isAgent } from '../../model_utils/agentUtils'
import { fmtPctDec0 } from '../../primitives/formatPrimitives'
import { evaluateAttack } from './evaluateAttack'
import { selectTarget } from './selectTarget'
import { compareIdsNumeric } from '../../primitives/stringPrimitives'
import { log } from '../../primitives/logger'
import type { RoundLog, AttackLog } from '../../model/turnReportModel'
import type { BattleOutcome } from '../../model/outcomeTypes'

type CombatRoundResult = {
  attackLogs: AttackLog[]
  activeAgents: Agent[]
  activeEnemies: Enemy[]
}

export type BattleReport = {
  rounds: number
  agentCasualties: number
  agentsTerminated: number
  agentsIncapacitated: number
  enemyCasualties: number
  retreated: boolean
  agentSkillUpdates: Record<string, Fixed6>
  initialAgentEffectiveSkill: Fixed6
  initialAgentHitPoints: Fixed6
  initialEnemySkill: Fixed6
  initialEnemyHitPoints: Fixed6
  initialAgentCombatRating: number
  totalDamageInflicted: number
  totalDamageTaken: number
  initialAgentExhaustion: Fixed6
  initialAgentExhaustionByAgentId: Record<string, Fixed6>
  agentExhaustionAfterBattle: number
  agentsWounded: number
  agentsUnscathed: number
  roundLogs: RoundLog[]
  attackLogs: AttackLog[]
}

export function evaluateBattle(agents: Agent[], enemies: Enemy[]): BattleReport {
  assertNotEmpty(agents)
  assertNotEmpty(enemies)

  const agentStats = bldAgentsCombatStats(agents)

  const agentSkillUpdates: Record<string, Fixed6> = {}

  // Calculate initial totals for percentage tracking
  const initialAgentEffectiveSkill = f6sumBy(agentStats, (stats) => stats.initialEffectiveSkill)
  const initialAgentHitPoints = f6sumBy(agents, (agent) => agent.maxHitPoints)
  const initialEnemySkill = f6sumBy(enemies, (enemy) => effectiveSkill(enemy))
  const initialEnemyHitPoints = f6sumBy(enemies, (enemy) => enemy.maxHitPoints)
  const initialAgentCombatRating = sum(agents, (agent) => calculateCombatRating(agent))

  // Track initial agent exhaustion for calculating total exhaustion gain
  const initialAgentExhaustion = f6sumBy(agents, (agent) => agent.exhaustionPct)
  const initialAgentExhaustionByAgentId: Record<string, Fixed6> = {}
  for (const agent of agents) {
    initialAgentExhaustionByAgentId[agent.id] = agent.exhaustionPct
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

  // Initialize active lists once before the battle loop
  let activeAgents = agents.filter((agent) => canParticipateInBattle(agent))
  let activeEnemies = enemies.filter((enemy) => canParticipateInBattle(enemy))

  let roundIdx = 0
  let combatRounds = 0
  let retreated = false
  let battleEnded: boolean
  do {
    roundIdx += 1
    combatRounds += 1

    // Capture round state at start of round (before combat)
    const activeAgentsAtRoundStart = activeAgents
    const activeEnemiesAtRoundStart = activeEnemies
    const agentSkillAtRoundStart = f6sumBy(activeAgentsAtRoundStart, (agent) => effectiveSkill(agent))
    const agentHpAtRoundStart = sum(activeAgentsAtRoundStart, (agent) => toF(agent.hitPoints))
    const enemySkillAtRoundStart = f6sumBy(activeEnemiesAtRoundStart, (enemy) => effectiveSkill(enemy))
    const enemyHpAtRoundStart = sum(activeEnemiesAtRoundStart, (enemy) => toF(enemy.hitPoints))
    const agentCombatRatingAtRoundStart = sum(activeAgentsAtRoundStart, (agent) => calculateCombatRating(agent))
    const enemyCombatRatingAtRoundStart = sum(activeEnemiesAtRoundStart, (enemy) => calculateCombatRating(enemy))
    const combatRatingRatioAtRoundStart =
      agentCombatRatingAtRoundStart > 0 ? enemyCombatRatingAtRoundStart / agentCombatRatingAtRoundStart : 0

    // // Show round status with detailed statistics
    // showRoundStatus(
    //   roundIdx,
    //   activeAgentsAtRoundStart,
    //   activeEnemiesAtRoundStart,
    //   initialAgentEffectiveSkill,
    //   initialAgentHitPoints,
    //   initialEnemySkill,
    //   initialEnemyHitPoints,
    // )

    const roundResult = evaluateCombatRound(
      activeAgentsAtRoundStart,
      agentStats,
      activeEnemiesAtRoundStart,
      initialEnemyEffectiveSkillMap,
      roundIdx,
    )
    attackLogs.push(...roundResult.attackLogs)

    // Update active lists for next round
    activeAgents = roundResult.activeAgents
    activeEnemies = roundResult.activeEnemies

    const sideEliminated = isSideEliminated(activeAgents, activeEnemies)

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
      agentHpTotal: toF(initialAgentHitPoints),
      enemyCount: activeEnemiesAtRoundStart.length,
      enemyCountTotal: enemies.length,
      enemySkill: enemySkillAtRoundStart,
      enemySkillTotal: initialEnemySkill,
      enemyHp: enemyHpAtRoundStart,
      enemyHpTotal: toF(initialEnemyHitPoints),
      combatRatingRatio: combatRatingRatioAtRoundStart,
    }
    roundLogs.push(roundLog)

    // Check for retreat after logging current round
    if (!sideEliminated) {
      const retreatResult = shouldRetreat(activeAgents, agentStats, activeEnemies)
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
  const activeAgentsAtBattleEnd = activeAgents
  const activeEnemiesAtBattleEnd = activeEnemies
  const agentSkillAtBattleEnd = f6sumBy(activeAgentsAtBattleEnd, (agent) => effectiveSkill(agent))
  const agentHpAtBattleEnd = sum(activeAgentsAtBattleEnd, (agent) => toF(agent.hitPoints))
  const enemySkillAtBattleEnd = f6sumBy(activeEnemiesAtBattleEnd, (enemy) => effectiveSkill(enemy))
  const enemyHpAtBattleEnd = sum(activeEnemiesAtBattleEnd, (enemy) => toF(enemy.hitPoints))
  const agentCombatRatingAtBattleEnd = sum(activeAgentsAtBattleEnd, (agent) => calculateCombatRating(agent))
  const enemyCombatRatingAtBattleEnd = sum(activeEnemiesAtBattleEnd, (enemy) => calculateCombatRating(enemy))
  // When all agents are terminated, combat rating ratio is undefined (division by zero).
  // Use 0 as a placeholder - the 'Wiped' status already conveys the battle outcome.
  const combatRatingRatioAtBattleEnd =
    agentCombatRatingAtBattleEnd > 0 ? enemyCombatRatingAtBattleEnd / agentCombatRatingAtBattleEnd : 0

  const allAgentsTerminated = agents.every((agent) => f6le(agent.hitPoints, f6c0))
  const endOfBattleStatus: BattleOutcome = retreated ? 'Retreated' : allAgentsTerminated ? 'Wiped' : 'Won'

  const endOfBattleLog: RoundLog = {
    roundNumber: roundIdx + 1,
    status: endOfBattleStatus,
    agentCount: activeAgentsAtBattleEnd.length,
    agentCountTotal: agents.length,
    agentSkill: agentSkillAtBattleEnd,
    agentSkillTotal: initialAgentEffectiveSkill,
    agentHp: agentHpAtBattleEnd,
    agentHpTotal: toF(initialAgentHitPoints),
    enemyCount: activeEnemiesAtBattleEnd.length,
    enemyCountTotal: enemies.length,
    enemySkill: enemySkillAtBattleEnd,
    enemySkillTotal: initialEnemySkill,
    enemyHp: enemyHpAtBattleEnd,
    enemyHpTotal: toF(initialEnemyHitPoints),
    combatRatingRatio: combatRatingRatioAtBattleEnd,
  }
  roundLogs.push(endOfBattleLog)

  // Count casualties - terminated, incapacitated, and wounded
  const agentsTerminated = agents.filter((agent) => f6le(agent.hitPoints, f6c0)).length
  // Incapacitated: alive but effective skill fell to 10% or below of base skill
  const agentsIncapacitated = agents.filter(
    (agent) => f6gt(agent.hitPoints, f6c0) && isIncapacitated(agent),
  ).length
  const agentsWounded = agents.filter((agent) => {
    const initialHp = initialAgentHitPointsMap.get(agent.id) ?? agent.maxHitPoints
    return f6gt(agent.hitPoints, f6c0) && f6lt(agent.hitPoints, initialHp)
  }).length
  const agentCasualties = agentsWounded + agentsTerminated

  const enemiesTerminated = enemies.filter((enemy) => f6le(enemy.hitPoints, f6c0)).length
  const enemiesWounded = enemies.filter((enemy) => {
    const initialHp = initialEnemyHitPointsMap.get(enemy.id) ?? enemy.maxHitPoints
    return f6gt(enemy.hitPoints, f6c0) && f6lt(enemy.hitPoints, initialHp)
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
    totalDamageInflicted += toF(initialHp) - toF(enemy.hitPoints)
  }

  // Calculate total damage taken (by agents from enemies)
  let totalDamageTaken = 0
  for (const agent of agents) {
    const initialHp = initialAgentHitPointsMap.get(agent.id) ?? agent.maxHitPoints
    totalDamageTaken += toF(initialHp) - toF(agent.hitPoints)
  }

  // agentExhaustionAfterBattle will be calculated in evaluateDeployedMission after casualty penalty is applied

  showRoundStatus(
    combatRounds,
    activeAgentsAtBattleEnd,
    activeEnemiesAtBattleEnd,
    initialAgentEffectiveSkill,
    initialAgentHitPoints,
    initialEnemySkill,
    initialEnemyHitPoints,
    true,
  )

  log.info(
    'combat',
    `Agent casualties: ${agentCasualties} / ${agents.length} (${agentsWounded} wounded, ${agentsTerminated} terminated)`,
  )
  log.info(
    'combat',
    `Enemy casualties: ${enemyCasualties} / ${enemies.length} (${enemiesWounded} wounded, ${enemiesTerminated} terminated)`,
  )

  return {
    rounds: combatRounds,
    agentCasualties,
    agentsTerminated,
    agentsIncapacitated,
    enemyCasualties,
    retreated,
    agentSkillUpdates,
    initialAgentEffectiveSkill,
    initialAgentHitPoints,
    initialEnemySkill,
    initialEnemyHitPoints,
    initialAgentCombatRating,
    totalDamageInflicted,
    totalDamageTaken,
    initialAgentExhaustion,
    initialAgentExhaustionByAgentId,
    agentExhaustionAfterBattle: 0, // Will be calculated in evaluateDeployedMission after casualty penalty is applied
    agentsWounded: 0, // Will be set in updateAgentsAfterBattle
    agentsUnscathed: 0, // Will be set in updateAgentsAfterBattle
    roundLogs,
    attackLogs,
  }
}

function bldAgentsCombatStats(agents: Agent[]): AgentCombatStats[] {
  return agents.map((agent: Agent) => ({
    id: agent.id,
    initialEffectiveSkill: effectiveSkill(agent),
    initialCombatRating: calculateCombatRating(agent),
    skillGained: f6c0,
  }))
}

function isSideEliminated(activeAgents: Agent[], activeEnemies: Enemy[]): boolean {
  // A side is eliminated when there are no active units remaining
  return activeAgents.length === 0 || activeEnemies.length === 0
}

function logRetreat(retreatResult: RetreatResult): void {
  const agentsCombatRatingPct =
    retreatResult.agentsTotalOriginalCombatRating > 0
      ? retreatResult.agentsTotalCurrentCombatRating / retreatResult.agentsTotalOriginalCombatRating
      : 0
  const agentsCombatRatingPctFmt = fmtPctDec0(agentsCombatRatingPct)
  const agentsCombatRatingThresholdFmt = fmtPctDec0(AGENTS_COMBAT_RATING_RETREAT_THRESHOLD)
  const enemyToAgentsCombatRatingRatioFmt = fmtPctDec0(retreatResult.enemyToAgentsCombatRatingRatio)
  const enemyToAgentsCombatRatingThresholdFmt = fmtPctDec0(RETREAT_ENEMY_TO_AGENTS_COMBAT_RATING_THRESHOLD)
  log.info(
    'combat',
    `🏃 Agent mission commander orders retreat! ` +
      `Agents Current/Total combat rating = ${agentsCombatRatingPctFmt} < ${agentsCombatRatingThresholdFmt} threshold. ` +
      `Enemy/Agents combat rating ratio = ${enemyToAgentsCombatRatingRatioFmt} >= ${enemyToAgentsCombatRatingThresholdFmt} threshold.`,
  )
}

function evaluateCombatRound(
  activeAgents: Agent[],
  agentStats: AgentCombatStats[],
  activeEnemies: Enemy[],
  initialEnemyEffectiveSkillMap: Map<string, Fixed6>,
  roundNumber: number,
): CombatRoundResult {
  const attackLogs: AttackLog[] = []

  // Track attack counts per target for fair distribution
  const enemyAttackCounts = new Map<string, number>()
  const agentAttackCounts = new Map<string, number>()

  // Calculate effective skills at round start to prevent targets from becoming more attractive
  // as they take damage during the round
  const effectiveSkillsAtRoundStart = new Map<string, Fixed6>()
  for (const agent of activeAgents) {
    effectiveSkillsAtRoundStart.set(agent.id, effectiveSkill(agent))
  }
  for (const enemy of activeEnemies) {
    effectiveSkillsAtRoundStart.set(enemy.id, effectiveSkill(enemy))
  }

  // console.log('\n----- 👤🗡️ Agent Attack Phase -----')

  // Agents attack in order of least skilled to most skilled
  const sortedActiveAgents = [...activeAgents]
  sortedActiveAgents.sort(compareActorsBySkillDescending)

  // Each agent attacks
  let currentActiveEnemies = activeEnemies
  const stillActiveAgents: Agent[] = []
  for (const agent of sortedActiveAgents) {
    // Update active enemies list after previous attacks
    currentActiveEnemies = processAttack(
      agent,
      currentActiveEnemies,
      enemyAttackCounts,
      agentStats,
      initialEnemyEffectiveSkillMap,
      effectiveSkillsAtRoundStart,
      roundNumber,
      attackLogs,
      'agent_attack_roll',
    )
    // Check if attacker is still active after attacking (may have become exhausted)
    if (canParticipateInBattle(agent)) {
      stillActiveAgents.push(agent)
    }
  }

  // console.log('\n----- 👺🗡️ Enemy Attack Phase -----')

  // Enemies attack back (using currentActiveEnemies after agents attacked)
  const sortedActiveEnemies = [...currentActiveEnemies]
  sortedActiveEnemies.sort(compareActorsBySkillDescending)

  let currentActiveAgents = stillActiveAgents
  const stillActiveEnemies: Enemy[] = []
  for (const enemy of sortedActiveEnemies) {
    // Update active agents list after previous attacks
    currentActiveAgents = processAttack(
      enemy,
      currentActiveAgents,
      agentAttackCounts,
      agentStats,
      initialEnemyEffectiveSkillMap,
      effectiveSkillsAtRoundStart,
      roundNumber,
      attackLogs,
      'enemy_attack_roll',
    )
    // Check if attacker is still active after attacking (may have become exhausted)
    if (canParticipateInBattle(enemy)) {
      stillActiveEnemies.push(enemy)
    }
  }

  return {
    attackLogs,
    activeAgents: currentActiveAgents,
    activeEnemies: stillActiveEnemies,
  }
}

function processAttack(
  attacker: Agent,
  activeTargets: Enemy[],
  attackCounts: Map<string, number>,
  agentStats: AgentCombatStats[],
  initialEnemyEffectiveSkillMap: Map<string, Fixed6>,
  effectiveSkillsAtRoundStart: Map<string, Fixed6>,
  roundNumber: number,
  attackLogs: AttackLog[],
  attackType: 'agent_attack_roll',
): Enemy[]
function processAttack(
  attacker: Enemy,
  activeTargets: Agent[],
  attackCounts: Map<string, number>,
  agentStats: AgentCombatStats[],
  initialEnemyEffectiveSkillMap: Map<string, Fixed6>,
  effectiveSkillsAtRoundStart: Map<string, Fixed6>,
  roundNumber: number,
  attackLogs: AttackLog[],
  attackType: 'enemy_attack_roll',
): Agent[]
function processAttack(
  attacker: Agent | Enemy,
  activeTargets: Agent[] | Enemy[],
  attackCounts: Map<string, number>,
  agentStats: AgentCombatStats[],
  initialEnemyEffectiveSkillMap: Map<string, Fixed6>,
  effectiveSkillsAtRoundStart: Map<string, Fixed6>,
  roundNumber: number,
  attackLogs: AttackLog[],
  attackType: 'agent_attack_roll' | 'enemy_attack_roll',
): Agent[] | Enemy[] {
  // Attacker is guaranteed to be active since caller passes only active attackers
  const target = selectTarget(activeTargets as (Agent | Enemy)[], attackCounts, attacker, effectiveSkillsAtRoundStart)
  if (target) {
    const isAttackerAgent = isAgent(attacker)
    const isTargetAgent = isAgent(target)

    // Get attacker stats/skill
    let attackerStats: AgentCombatStats | undefined
    let attackerSkillAtStart: Fixed6
    if (isAttackerAgent) {
      const foundStats = agentStats.find((stats) => stats.id === attacker.id)
      assertDefined(foundStats)
      attackerStats = foundStats
      attackerSkillAtStart = foundStats.initialEffectiveSkill
    } else {
      attackerStats = undefined
      attackerSkillAtStart = initialEnemyEffectiveSkillMap.get(attacker.id) ?? f6c0
    }

    // Get defender stats/skill
    let defenderStats: AgentCombatStats | undefined
    let defenderSkillAtStart: Fixed6
    if (isTargetAgent) {
      const foundStats = agentStats.find((stats) => stats.id === target.id)
      assertDefined(foundStats)
      defenderStats = foundStats
      defenderSkillAtStart = foundStats.initialEffectiveSkill
    } else {
      defenderStats = undefined
      defenderSkillAtStart = initialEnemyEffectiveSkillMap.get(target.id) ?? f6c0
    }

    const currentAttackCount = attackCounts.get(target.id) ?? 0
    const attackLog = evaluateAttack(
      attacker,
      attackerStats,
      target,
      defenderStats,
      attackerSkillAtStart,
      defenderSkillAtStart,
      roundNumber,
      attackType,
      currentAttackCount + 1,
    )
    attackLogs.push(attackLog)
    // Increment attack count for this target
    attackCounts.set(target.id, currentAttackCount + 1)
  }

  // Filter out the attacked target if it became incapacitated after the attack
  // Only the attacked target's state changed (hitPoints/exhaustion), so other targets don't need re-checking
  if (!target) {
    // No target was attacked, return list as-is
    return activeTargets
  }

  // Type narrowing based on the first element to determine the array type
  if (activeTargets.length === 0) {
    return activeTargets
  }
  const firstTarget = activeTargets[0]
  if (!firstTarget) {
    return activeTargets
  }

  if (isAgent(firstTarget)) {
    // activeTargets must be Agent[], filter out attacked target if incapacitated
    return activeTargets.filter((t): t is Agent => isAgent(t) && (t.id !== target.id || canParticipateInBattle(t)))
  }
  // activeTargets must be Enemy[], filter out attacked target if incapacitated
  return activeTargets.filter((t): t is Enemy => !isAgent(t) && (t.id !== target.id || canParticipateInBattle(t)))
}

function showRoundStatus(
  rounds: number,
  activeAgents: Agent[],
  activeEnemies: Enemy[],
  initialAgentEffectiveSkill: Fixed6,
  initialAgentHitPoints: Fixed6,
  initialEnemySkill: Fixed6,
  initialEnemyHitPoints: Fixed6,
  battleConcluded = false,
): void {
  if (battleConcluded) {
    const roundsStr = pluralize('round', rounds)
    log.info('combat', `\n========== 📊 Battle Concluded after ${rounds} ${roundsStr} ==========`)
  } else {
    log.info('combat', `\n========== ⚔️ Combat Round ${rounds} ==========`)
  }

  // Current agent statistics
  const currentAgentEffectiveSkill = f6sumBy(activeAgents, (agent) => effectiveSkill(agent))
  const currentAgentHitPoints = sum(activeAgents, (agent) => toF(agent.hitPoints))
  const agentSkillPct = f6fmtPctDec0(currentAgentEffectiveSkill, initialAgentEffectiveSkill)
  const agentHpPct = fmtPctDec0(currentAgentHitPoints, toF(initialAgentHitPoints))

  // Current enemy statistics
  const currentEnemyEffectiveSkill = f6sumBy(activeEnemies, (enemy) => effectiveSkill(enemy))
  const currentEnemyHitPoints = sum(activeEnemies, (enemy) => toF(enemy.hitPoints))
  const enemySkillPct = f6fmtPctDec0(currentEnemyEffectiveSkill, initialEnemySkill)
  const enemyHpPct = fmtPctDec0(currentEnemyHitPoints, toF(initialEnemyHitPoints))

  log.info(
    'combat',
    `👤👤 Agents: ${activeAgents.length} units, ${f6fmtInt(currentAgentEffectiveSkill)} total skill (${agentSkillPct}), ${currentAgentHitPoints} HP (${agentHpPct})`,
  )
  log.info(
    'combat',
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
