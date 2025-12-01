import { ceil, div } from '../primitives/mathPrimitives'
import { f6floorToInt } from '../primitives/fixed6Primitives'
import type { Agent } from '../model/agentModel'
import { AGENT_ESPIONAGE_INTEL, LEAD_INTEL_DECAY_PER_ONE_INTEL, MAX_INTEL_DECAY } from './constants'
import { sumAgentSkillBasedValues } from './skillRuleset'

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
export function getLeadSuccessChance(accumulatedIntel: number, difficulty: number): number {
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
 * Formula: ceil(accumulatedIntel * decayPct)
 *
 * For example I/O pairs, refer to the test of this function.
 *
 * @param accumulatedIntel - The accumulated intel value
 * @returns The decay amount (rounded up)
 */
export function getLeadIntelDecay(accumulatedIntel: number): number {
  const decayPct = getLeadIntelDecayPct(accumulatedIntel)
  const decay = ceil(accumulatedIntel * decayPct)
  return decay
}

/**
 * Calculates intel decay based on accumulated intel.
 * Formula:
 * intelDecay = min(accumulatedIntel * INTEL_DECAY, MAX_INTEL_DECAY)
 *            = min(accumulatedIntel * 0.1%, 50%)
 *
 * For example I/O pairs, refer to the test of this function.

 * Overall the values for equilibrium (== eq) are:
 *   k intel / turn: eq = sqrt(1000 * k) IF k <= 250, 2k otherwise.
 * This is because at 500 intel (which is == 2k) the max 50% decay kicks in.
 *   5 intel / turn: eq = 70.7 ( 70.7 * 0.1% =  7.07% decay. 70.7 * (1-0.0707) =  65.7 intel +   5 =  70.7)
 *  10 intel / turn: eq = 100  (100   * 0.1% = 10%    decay. 100  * (1-0.1)    =  90   intel +  10 = 100)
 *  40 intel / turn: eq = 200  (200   * 0.1% = 20%    decay. 200  * (1-0.2)    = 160   intel +  40 = 200)
 * 250 intel / turn: eq = 500  (500   * 0.1% = 50%    decay. 500  * (1-0.5)    = 250   intel + 250 = 500)
 * 300 intel / turn: eq = 600  (600   * 0.1% = 60%    decay. 600  * (1-0.5)    = 300   intel + 300 = 300)
 *
 * See also:
 * https://chatgpt.com/g/g-p-684e89e14dbc8191a947cc29c20ee528-game-ts/c/6918110b-7590-8325-8caa-62ae074491c6
 * https://chatgpt.com/g/g-p-684e89e14dbc8191a947cc29c20ee528-game-ts/c/69111d90-db18-832b-bf78-813bb22fab30
 *
 * @param accumulatedIntel - The accumulated intel value
 * @returns The decay in basis points
 */
export function getLeadIntelDecayPct(accumulatedIntel: number): number {
  const decayPct = Math.min(accumulatedIntel * LEAD_INTEL_DECAY_PER_ONE_INTEL, MAX_INTEL_DECAY)
  return decayPct
}

/**
 * Calculates total intel accumulated from investigating agents
 */
export function getLeadAccumulatedIntel(agents: Agent[]): number {
  // This flooring strips any fractional intel from the total
  return f6floorToInt(sumAgentSkillBasedValues(agents, AGENT_ESPIONAGE_INTEL))
}
