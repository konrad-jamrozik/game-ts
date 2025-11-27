import {
  AGENT_CONTRACTING_INCOME,
  AGENT_ESPIONAGE_INTEL,
  AGENT_UPKEEP_COST,
  INTEL_DECAY,
  MAX_INTEL_DECAY,
  RETREAT_ENEMY_SKILL_THRESHOLD,
  RETREAT_THRESHOLD,
  SUPPRESSION_DECAY_PCT,
} from './constants'
import { div, floor, ceil } from '../../utils/mathUtils'
import type { Agent, Enemy, GameState, MissionSite } from '../model'
import { agsV, type AgentsView } from '../agents/AgentsView'
import { agV } from '../agents/AgentView'
import { BPS_PRECISION, type Bps, bps } from '../bps'
import { f2AsFloat } from '../fixed2'
import { effectiveSkill } from '../../utils/actorUtils'
import type { AgentCombatStats } from '../../turn_advancement/evaluateAttack'

export function getAgentUpkeep(agents: AgentsView): number {
  return agents.notTerminated().length * AGENT_UPKEEP_COST
}

export function getContractingIncome(agents: AgentsView): number {
  const contractingAgents = agents.onContractingAssignment()
  let total = 0
  for (const agent of contractingAgents) {
    const agentEffectiveSkill = f2AsFloat(agent.effectiveSkill())
    total += floor((AGENT_CONTRACTING_INCOME * agentEffectiveSkill) / 100)
  }
  return total
}

export function getEspionageIntel(agents: AgentsView): number {
  const espionageAgents = agents.onEspionageAssignment()
  let total = 0
  for (const agent of espionageAgents) {
    const agentEffectiveSkill = f2AsFloat(agent.effectiveSkill())
    total += floor((AGENT_ESPIONAGE_INTEL * agentEffectiveSkill) / 100)
  }
  return total
}
export function getMoneyDiff(gameState: GameState): number {
  const agents = agsV(gameState.agents)
  return gameState.funding + agents.contractingIncome() - agents.agentUpkeep()
}

export function getIntelDiff(gameState: GameState): number {
  return agsV(gameState.agents).espionageIntel()
}

export function getMoneyNewBalance(gameState: GameState): number {
  return gameState.money + getMoneyDiff(gameState)
}

export function getIntelNewBalance(gameState: GameState): number {
  return gameState.intel + getIntelDiff(gameState)
}

export function isMissionSiteConcluded(missionSite: MissionSite): boolean {
  return missionSite.state === 'Successful' || missionSite.state === 'Failed' || missionSite.state === 'Expired'
}

export function getRecoveryTurns(damage: number, hitPoints: number, hitPointsRecoveryPct: number): number {
  const hitPointsLostPercentage = Math.min(div(damage, hitPoints) * 100, 100)
  const recoveryTurns = Math.ceil(div(hitPointsLostPercentage, hitPointsRecoveryPct))
  return recoveryTurns
}

/**
 * Calculates panic increase from faction threat level and suppression.
 *
 * Formula: Math.max(0, threatLevel - suppression)
 *
 * This is the source of truth for panic increase calculation.
 *
 * @param threatLevel - The faction's threat level (in basis points)
 * @param suppression - The faction's suppression value (in basis points)
 * @returns The panic increase (never negative, in basis points)
 */

export function calculatePanicIncrease(threatLevel: Bps, suppression: Bps): Bps {
  return bps(Math.max(0, threatLevel.value - suppression.value))
}
export function decaySuppression(suppression: Bps): Bps {
  return bps(floor(suppression.value * (1 - SUPPRESSION_DECAY_PCT / 100)))
}

/**
 * Calculates the total panic increase from all factions in the game state.
 *
 * @param gameState - The current game state
 * @returns Total panic increase value (in basis points, as a number)
 */
export function getTotalPanicIncrease(gameState: GameState): number {
  let totalPanicIncrease = 0
  for (const faction of gameState.factions) {
    const panicIncrease = calculatePanicIncrease(faction.threatLevel, faction.suppression)
    totalPanicIncrease += panicIncrease.value
  }
  return totalPanicIncrease
}

/**
 * Calculates projected panic value after turn advancement (without mission panic reductions).
 * Panic increases by the sum of panic increases from all factions.
 *
 * @param gameState - The current game state
 * @returns Projected panic value (in basis points)
 */
export function getPanicNewBalance(gameState: GameState): Bps {
  const totalPanicIncrease = getTotalPanicIncrease(gameState)
  return bps(gameState.panic.value + totalPanicIncrease)
}

/**
 * Calculates intel decay based on accumulated intel.
 * Formula: min(accumulatedIntel * INTEL_DECAY, MAX_INTEL_DECAY)
 *
 * E.g. at INTEL_DECAY = 10, MAX_INTEL_DECAY = 5000,
 * 100 intel decays by 100*0.1% = 10% = 10 intel.
 * Overall the values for equilibrium are:
 *   k intel / turn: eq = sqrt(1000 * k) IF k <= 250, 2k otherwise.
 *   5 intel / turn: eq = 70.7 (70.7 * 0.1% = 7.07% decay. 70.7*(1-0.0707) = 65.7 intel + 5 = 70.7)
 *  10 intel / turn: eq = 100 (100 * 0.1% = 10% decay. 100*(1-0.1) = 90 intel + 10 = 100)
 *  40 intel / turn: eq = 200 (200 * 0.1% = 20% decay. 200*(1-0.2) = 160 intel + 40 = 200)
 * 250 intel / turn: eq = 500 (500 * 0.1% = 50% decay. 500*(1-0.5) = 250 intel + 250 = 500)
 * 300 intel / turn: eq = 600 (600 * 0.1% = 60% decay. 600*(1-0.5) = 300 intel + 300 = 300)
 *
 * See also:
 * https://chatgpt.com/g/g-p-684e89e14dbc8191a947cc29c20ee528-game-ts/c/6918110b-7590-8325-8caa-62ae074491c6
 * https://chatgpt.com/g/g-p-684e89e14dbc8191a947cc29c20ee528-game-ts/c/69111d90-db18-832b-bf78-813bb22fab30
 *
 * @param accumulatedIntel - The accumulated intel value
 * @returns The decay in basis points
 */
export function calculateIntelDecay(accumulatedIntel: number): Bps {
  const decayBps = Math.min(accumulatedIntel * INTEL_DECAY, MAX_INTEL_DECAY)
  return bps(decayBps)
}

/**
 * Calculates lead success chance based on accumulated intel and difficulty.
 * Difficulty of X means the player must accumulate X intel to have a 100% chance of success.
 * Hence difficulty of 100 means the player must accumulate 100 intel to have a 100% chance of success,
 * or 1 intel = 1% success chance.

 * Formula: 
 * successChance = MIN(100%, accumulatedIntel / difficulty)
 *
 * @param accumulatedIntel - The accumulated intel value
 * @param difficulty - The difficulty in basis points
 * @returns The success chance
 */
export function calculateLeadSuccessChance(accumulatedIntel: number, difficulty: number): number {
  // Example 1:
  // accumulatedIntel = 1, difficulty = 100
  // successChance = 1/100 = 1%
  //
  // Example 2:
  // accumulatedIntel = 10, difficulty = 200
  // successChance = 10/200 = 5%
  //
  // Example 3
  // accumulatedIntel = 100, difficulty = 300
  // successChance = 100/300 = 1/3 = 33.(3)%
  if (difficulty === 0) {
    if (accumulatedIntel > 0) {
      return 1
    }
    return 0
  }
  return Math.min(1, div(accumulatedIntel, difficulty))
}

/**
 * Calculates intel decay amount based on accumulated intel.
 * Formula: ceil((accumulatedIntel * decay) / 10_000)
 *
 * @param accumulatedIntel - The accumulated intel value
 * @returns The decay amount (rounded up)
 */
export function calculateIntelDecayRounded(accumulatedIntel: number): number {
  const decay = calculateIntelDecay(accumulatedIntel)
  return ceil((accumulatedIntel * decay.value) / BPS_PRECISION)
}

/**
 * Calculates total intel accumulated from investigating agents
 */
export function calculateAccumulatedIntel(agents: Agent[]): number {
  let total = 0
  for (const agent of agents) {
    const agentEffectiveSkill = f2AsFloat(agV(agent).effectiveSkill())
    total += floor((AGENT_ESPIONAGE_INTEL * agentEffectiveSkill) / 100)
  }
  return total
}

/**
 * Result of retreat evaluation containing the decision and calculated values.
 */
export type RetreatResult = {
  shouldRetreat: boolean
  totalOriginalEffectiveSkill: number
  totalCurrentEffectiveSkill: number
  enemySkillRatio: number
}

/**
 * Determines whether agents should retreat from battle based on their current combat effectiveness
 * and enemy strength.
 *
 * Retreat occurs when BOTH of the following conditions are met:
 * 1. Agents' total current effective skill is less than RETREAT_THRESHOLD (50%) of their original effective skill
 * 2. Enemy total effective skill is at least RETREAT_ENEMY_SKILL_THRESHOLD (80%) of agents' current effective skill
 *
 * This ensures agents only retreat when they are both weakened AND facing a strong enemy force,
 * preventing unnecessary retreats when agents are weakened but enemies are also significantly damaged.
 *
 * @param agents - Array of all agents in the battle (alive and terminated)
 * @param agentStats - Array of combat statistics for each agent, including their initial effective skill
 * @param enemies - Array of all enemies in the battle (alive and terminated)
 * @returns RetreatResult containing the retreat decision and calculated values for logging
 */
export function shouldRetreat(agents: Agent[], agentStats: AgentCombatStats[], enemies: Enemy[]): RetreatResult {
  const aliveAgents = agents.filter((agent) => agent.hitPoints > 0)
  // KJA reduce over fixed2
  const totalOriginalEffectiveSkill = agentStats.reduce((sum, stats) => sum + f2AsFloat(stats.initialEffectiveSkill), 0)
  const totalCurrentEffectiveSkill = aliveAgents.reduce((sum, agent) => sum + f2AsFloat(agV(agent).effectiveSkill()), 0)

  const agentEffectiveSkillThreshold = totalOriginalEffectiveSkill * RETREAT_THRESHOLD

  // Check if agents' effective skill is below threshold
  const agentsBelowThreshold = totalCurrentEffectiveSkill < agentEffectiveSkillThreshold

  // Check if enemy effective skill is at least 80% of agents' current effective skill
  const aliveEnemies = enemies.filter((enemy) => enemy.hitPoints > 0)
  const totalCurrentEnemyEffectiveSkill = aliveEnemies.reduce((sum, enemy) => sum + f2AsFloat(effectiveSkill(enemy)), 0)
  const enemySkillRatio = div(totalCurrentEnemyEffectiveSkill, totalCurrentEffectiveSkill)
  const enemyAboveThreshold = enemySkillRatio >= RETREAT_ENEMY_SKILL_THRESHOLD

  // Retreat when agents are below threshold AND enemy skill is at least 80% of agent skill
  return {
    shouldRetreat: agentsBelowThreshold && enemyAboveThreshold,
    totalOriginalEffectiveSkill,
    totalCurrentEffectiveSkill,
    enemySkillRatio,
  }
}
