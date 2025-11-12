import {
  AGENT_CONTRACTING_INCOME,
  AGENT_ESPIONAGE_INTEL,
  AGENT_RECOVERY_TURNS_FACTOR,
  AGENT_UPKEEP_COST,
  INTEL_DECAY,
  MAX_INTEL_DECAY,
  SUPPRESSION_DECAY_PCT,
} from './constants'
import { div, floor, ceil } from '../../utils/mathUtils'
import type { GameState, MissionSite } from '../model'
import { agsV, type AgentsView } from '../agents/AgentsView'
import { type Bps, bps } from '../bps'

export function getAgentUpkeep(agents: AgentsView): number {
  return agents.notTerminated().length * AGENT_UPKEEP_COST
}

export function getContractingIncome(agents: AgentsView): number {
  const contractingAgents = agents.onContractingAssignment()
  let total = 0
  for (const agent of contractingAgents) {
    const effectiveSkill = agent.effectiveSkill()
    total += floor((AGENT_CONTRACTING_INCOME * effectiveSkill) / 100)
  }
  return total
}

export function getEspionageIntel(agents: AgentsView): number {
  const espionageAgents = agents.onEspionageAssignment()
  let total = 0
  for (const agent of espionageAgents) {
    const effectiveSkill = agent.effectiveSkill()
    total += floor((AGENT_ESPIONAGE_INTEL * effectiveSkill) / 100)
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

export function getRecoveryTurns(damage: number, hitPoints: number): number {
  const hitPointsLostPercentage = Math.min(div(damage, hitPoints) * 100, 100)
  const recoveryTurns = Math.ceil(div(hitPointsLostPercentage, AGENT_RECOVERY_TURNS_FACTOR))
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
 * @param accumulatedIntel - The accumulated intel value
 * @returns The decay in basis points
 */
export function calculateIntelDecay(accumulatedIntel: number): Bps {
  const decayBps = Math.min(accumulatedIntel * INTEL_DECAY, MAX_INTEL_DECAY)
  return bps(decayBps)
}

/**
 * Calculates intel decay amount based on accumulated intel.
 * Formula: ceil((accumulatedIntel * decay) / 10_000)
 *
 * @param accumulatedIntel - The accumulated intel value
 * @returns The decay amount (rounded up)
 */
export function calculateIntelDecayAmount(accumulatedIntel: number): number {
  const decay = calculateIntelDecay(accumulatedIntel)
  return ceil((accumulatedIntel * decay.value) / 10_000)
}

/**
 * Calculates lead success chance based on accumulated intel and difficulty.
 * Formula: successChance = min(bps(accumulatedIntel * difficulty), 100%)
 *
 * @param accumulatedIntel - The accumulated intel value
 * @param difficulty - The difficulty in basis points
 * @returns The success chance (in basis points, capped at 100%)
 */
export function calculateLeadSuccessChance(accumulatedIntel: number, difficulty: Bps): Bps {
  return bps(Math.min(accumulatedIntel * difficulty.value, 10_000))
}
