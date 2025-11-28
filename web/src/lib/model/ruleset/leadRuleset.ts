import { bps, BPS_PRECISION, type Bps } from '../bps'
import { f2addToInt } from '../fixed2'
import { ceil, div } from '../../utils/mathUtils'
import { agV } from '../agents/AgentView'
import type { Agent } from '../model'
import { AGENT_ESPIONAGE_INTEL, INTEL_DECAY, MAX_INTEL_DECAY } from './constants'
import { calculateAgentSkillBasedValue } from './skillRuleset'

/**
 * Calculates lead success chance based on accumulated intel and difficulty.
 * Difficulty of X means the player must accumulate X intel to have a 100% chance of success.
 * Hence difficulty of 100 means the player must accumulate 100 intel to have a 100% chance of success,
 * or 1 intel = 1% success chance.
 *
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
 * Calculates intel decay based on accumulated intel.
 * Formula:
 * intelDecay = min(accumulatedIntel * INTEL_DECAY, MAX_INTEL_DECAY)
 *            = min(accumulatedIntel * 0.1%, 50%)
 *
 * E.g. at INTEL_DECAY = 10, MAX_INTEL_DECAY = 5000,
 * intelDecayPct(  1) =   1 * 0.1% = 0.1%
 * intelDecayPct(  5) =   5 * 0.1% = 0.5%
 * intelDecayPct( 10) =  10 * 0.1% = 1%
 * intelDecayPct( 40) =  40 * 0.1% = 4%
 * intelDecayPct(100) = 100 * 0.1% = 10%
 * intelDecayPct(250) = 250 * 0.1% = 25%
 * intelDecayPct(300) = 300 * 0.1% = 30%
 * intelDecayPct(500) = 500 * 0.1% = 50%
 * intelDecayPct(600) = 600 * 0.1% = 50% not 60%, because of min(... , 50%)

 * Overall the values for equilibrium (== eq) are:
 *   k intel / turn: eq = sqrt(1000 * k) IF k <= 250, 2k otherwise.
 * This is because at 500 intel (which is == 2k) the max 50% decay kicks in.
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
export function calculateLeadIntelDecayPct(accumulatedIntel: number): Bps {
  const decayPct = Math.min(accumulatedIntel * INTEL_DECAY, MAX_INTEL_DECAY)
  return bps(decayPct)
}

/**
 * Calculates intel decay amount based on accumulated intel.
 * Formula: ceil((accumulatedIntel * decayPct) / 10_000)
 *
 * Example values:
 * decayAbs(  1) = ceil(  1 *  0.1%) = ceil(  0.001) =   1
 * decayAbs(  5) = ceil(  5 *  0.5%) = ceil(  0.025) =   1
 * decayAbs(100) = ceil(100 * 10  %) = ceil( 10    ) =  10
 * decayAbs(250) = ceil(250 * 25  %) = ceil( 62.5  ) =  63
 * decayAbs(300) = ceil(300 * 30  %) = ceil( 90    ) =  90
 * decayAbs(500) = ceil(500 * 50  %) = ceil(250    ) = 250
 * decayAbs(600) = ceil(600 * 50  %) = ceil(300    ) = 300
 *
 * @param accumulatedIntel - The accumulated intel value
 * @returns The decay amount (rounded up)
 */
export function calculateLeadIntelDecayAbsRounded(accumulatedIntel: number): number {
  const decay = calculateLeadIntelDecayPct(accumulatedIntel)
  const res = ceil((accumulatedIntel * decay.value) / BPS_PRECISION)
  return res
}

/**
 * Calculates total intel accumulated from investigating agents
 */
export function calculateLeadAccumulatedIntel(agents: Agent[]): number {
  let total = 0
  for (const agent of agents) {
    const intelFromAgent = calculateAgentSkillBasedValue(agV(agent), AGENT_ESPIONAGE_INTEL)
    total = f2addToInt(total, intelFromAgent)
  }
  return total
}
