/**
 * Purchasing logic for the Basic Intellect.
 * For explanation, refer to the docs/ai/about_basic_intellect.md file.
 */

import type { PlayTurnAPI } from '../../../lib/model_utils/playTurnApiTypes'
import type { GameState } from '../../../lib/model/gameStateModel'
import type { BasicIntellectState } from '../../../redux/slices/aiStateSlice'
import {
  getUpgradePrice,
  computeAgentCap,
  computeTransportCap,
  computeTrainingCap,
  type UpgradeName,
} from '../../../lib/data_tables/upgrades'
import { getAgentUpkeep } from '../../../lib/ruleset/moneyRuleset'
import { toF } from '../../../lib/primitives/fixed6'
import { AGENT_HIRE_COST } from '../../../lib/data_tables/constants'
import { assertDefined } from '../../../lib/primitives/assertPrimitives'
import { ceil } from '../../../lib/primitives/mathPrimitives'
import { log } from '../../../lib/primitives/logger'
import type { UpgradeNameOrNewAgent } from './types'
import {
  REQUIRED_TURNS_OF_SAVINGS,
  TRANSPORT_CAP_RATIO,
  TRAINING_CAP_RATIO,
  AGENT_COUNT_BASE,
  AGENT_HIRING_PURCHASED_UPGRADES_MULTIPLIER,
  MAX_DESIRED_WEAPON_DAMAGE,
  MAX_DESIRED_AGENT_COUNT,
  MAX_DESIRED_TRANSPORT_CAP,
  MAX_DESIRED_TRAINING_CAP,
  MAX_DESIRED_EXHAUSTION_RECOVERY_PCT,
  MAX_DESIRED_HIT_POINTS_RECOVERY_PCT,
} from './constants'

export function spendMoney(api: PlayTurnAPI): void {
  let priority = computeNextBuyPriority(api)
  while (hasSufficientMoneyToBuy(api, priority)) {
    buy(api, priority)
    priority = computeNextBuyPriority(api)
  }

  // Log why we didn't buy anything
  logFailedPurchase(api, priority)
}

export function computeNextBuyPriority(api: PlayTurnAPI): UpgradeNameOrNewAgent {
  const { gameState, aiState } = api
  const actualAgentCount = gameState.agents.length

  // Priority 1: Buy agents until desired agent count is reached
  // Only actionable if we can actually hire (not at agent cap)
  if (actualAgentCount < aiState.desiredAgentCount && actualAgentCount < gameState.agentCap) {
    return 'newAgent'
  }

  // Find the one cap/upgrade where actual < desired
  // If all goals are met, establish new goals via ensureDesiredGoalExists
  let upgrade = findNextDesiredUpgrade(aiState)
  if (upgrade === undefined) {
    // All desired counts are met, establish new goals
    ensureDesiredGoalExists(api)
    // Re-check after establishing new goals
    // Agent goal is only actionable if we can actually hire (not at cap)
    if (actualAgentCount < api.aiState.desiredAgentCount && actualAgentCount < gameState.agentCap) {
      return 'newAgent'
    }
    upgrade = findNextDesiredUpgrade(api.aiState)
    if (upgrade === undefined) {
      throw new Error('AI bug: ensureDesiredGoalExists failed to establish an actionable goal after maximum iterations')
    }
  }
  return upgrade
}

/**
 * Finds the next upgrade where desired > actual.
 * Returns the first upgrade found (even if multiple exist), or undefined if none found.
 * Logs a warning if multiple upgrades have desired > actual.
 */
export function findNextDesiredUpgrade(aiState: BasicIntellectState): UpgradeName | undefined {
  let foundUpgrade: UpgradeName | undefined
  const allMatches: UpgradeName[] = []

  function checkActualVsDesired(actual: number, desired: number, upgradeName: UpgradeName): void {
    if (desired > actual) {
      allMatches.push(upgradeName)
      // Pick the first one found
      foundUpgrade ??= upgradeName
    }
  }

  checkActualVsDesired(aiState.actualAgentCapUpgrades, aiState.desiredAgentCapUpgrades, 'Agent cap')
  checkActualVsDesired(aiState.actualTransportCapUpgrades, aiState.desiredTransportCapUpgrades, 'Transport cap')
  checkActualVsDesired(aiState.actualTrainingCapUpgrades, aiState.desiredTrainingCapUpgrades, 'Training cap')
  checkActualVsDesired(aiState.actualWeaponDamageUpgrades, aiState.desiredWeaponDamageUpgrades, 'Weapon damage')
  checkActualVsDesired(
    aiState.actualTrainingSkillGainUpgrades,
    aiState.desiredTrainingSkillGainUpgrades,
    'Training skill gain',
  )
  checkActualVsDesired(
    aiState.actualExhaustionRecoveryUpgrades,
    aiState.desiredExhaustionRecoveryUpgrades,
    'Exhaustion recovery %',
  )
  checkActualVsDesired(
    aiState.actualHitPointsRecoveryUpgrades,
    aiState.desiredHitPointsRecoveryUpgrades,
    'Hit points recovery %',
  )
  checkActualVsDesired(aiState.actualHitPointsUpgrades, aiState.desiredHitPointsUpgrades, 'Hit points')

  if (allMatches.length > 1) {
    log.warn(
      'purchasing',
      `Multiple upgrades have desired > actual: ${allMatches.join(', ')}. Selecting first: ${foundUpgrade}`,
    )
  }

  return foundUpgrade
}

function hasSufficientMoneyToBuy(api: PlayTurnAPI, priority: UpgradeNameOrNewAgent): boolean {
  const { gameState } = api
  let cost: number

  if (priority === 'newAgent') {
    cost = AGENT_HIRE_COST
  } else {
    cost = getUpgradePrice(priority)
  }

  const currentMoney = gameState.money
  const moneyAfterPurchase = currentMoney - cost
  const minimumRequiredSavings = computeMinimumRequiredSavings(api)
  return moneyAfterPurchase >= minimumRequiredSavings
}

function buy(api: PlayTurnAPI, priority: UpgradeNameOrNewAgent): void {
  executePurchase(api, priority)
  logBuyResult(api, priority)
}

function executePurchase(api: PlayTurnAPI, priority: UpgradeNameOrNewAgent): void {
  if (priority === 'newAgent') {
    api.hireAgent()
    log.success('purchasing', 'purchased newAgent 🪖')
    return
  }

  api.buyUpgrade(priority)

  if (priority === 'Agent cap' || priority === 'Transport cap' || priority === 'Training cap') {
    log.success('purchasing', `purchased cap 🏦 ${priority}`)
  } else {
    log.success('purchasing', `purchased upgrade ⏫ ${priority}`)
  }
}

export function areAllDesiredCountsMet(gameState: GameState, aiState: BasicIntellectState): boolean {
  const actualAgentCount = gameState.agents.length
  return (
    actualAgentCount >= aiState.desiredAgentCount &&
    aiState.actualAgentCapUpgrades >= aiState.desiredAgentCapUpgrades &&
    aiState.actualTransportCapUpgrades >= aiState.desiredTransportCapUpgrades &&
    aiState.actualTrainingCapUpgrades >= aiState.desiredTrainingCapUpgrades &&
    aiState.actualWeaponDamageUpgrades >= aiState.desiredWeaponDamageUpgrades &&
    aiState.actualTrainingSkillGainUpgrades >= aiState.desiredTrainingSkillGainUpgrades &&
    aiState.actualExhaustionRecoveryUpgrades >= aiState.desiredExhaustionRecoveryUpgrades &&
    aiState.actualHitPointsRecoveryUpgrades >= aiState.desiredHitPointsRecoveryUpgrades &&
    aiState.actualHitPointsUpgrades >= aiState.desiredHitPointsUpgrades
  )
}

function logBuyResult(
  api: PlayTurnAPI,
  priority: UpgradeNameOrNewAgent,
  stateBeforeIncrease?: BasicIntellectState,
): void {
  const { aiState } = api
  const purchaseItem = priority === 'newAgent' ? 'newAgent' : priority
  const increaseMessage = getIncreaseMessage(api, stateBeforeIncrease)

  log.info(
    'purchasing',
    `Purchased ${purchaseItem}. ${increaseMessage}.\n  Desired counts: agents=${aiState.desiredAgentCount}, agentCapUpgrades=${aiState.desiredAgentCapUpgrades}, transportCapUpgrades=${aiState.desiredTransportCapUpgrades}, trainingCapUpgrades=${aiState.desiredTrainingCapUpgrades}, weaponDamageUpgrades=${aiState.desiredWeaponDamageUpgrades}, trainingSkillGainUpgrades=${aiState.desiredTrainingSkillGainUpgrades}, exhaustionRecoveryUpgrades=${aiState.desiredExhaustionRecoveryUpgrades}, hitPointsRecoveryUpgrades=${aiState.desiredHitPointsRecoveryUpgrades}, hitPointsUpgrades=${aiState.desiredHitPointsUpgrades}`,
  )
}

function getIncreaseMessage(api: PlayTurnAPI, stateBeforeIncrease?: BasicIntellectState): string {
  if (stateBeforeIncrease === undefined) {
    return 'No increase (goals not yet met)'
  }

  const { aiState } = api
  if (aiState.desiredAgentCount > stateBeforeIncrease.desiredAgentCount) {
    return `Increased desired agents to ${aiState.desiredAgentCount}`
  }
  if (aiState.desiredAgentCapUpgrades > stateBeforeIncrease.desiredAgentCapUpgrades) {
    return `Increased desired agentCapUpgrades to ${aiState.desiredAgentCapUpgrades}`
  }
  if (aiState.desiredTransportCapUpgrades > stateBeforeIncrease.desiredTransportCapUpgrades) {
    return `Increased desired transportCapUpgrades to ${aiState.desiredTransportCapUpgrades}`
  }
  if (aiState.desiredTrainingCapUpgrades > stateBeforeIncrease.desiredTrainingCapUpgrades) {
    return `Increased desired trainingCapUpgrades to ${aiState.desiredTrainingCapUpgrades}`
  }
  if (aiState.desiredWeaponDamageUpgrades > stateBeforeIncrease.desiredWeaponDamageUpgrades) {
    return `Increased desired weaponDamageUpgrades to ${aiState.desiredWeaponDamageUpgrades}`
  }
  if (aiState.desiredTrainingSkillGainUpgrades > stateBeforeIncrease.desiredTrainingSkillGainUpgrades) {
    return `Increased desired trainingSkillGainUpgrades to ${aiState.desiredTrainingSkillGainUpgrades}`
  }
  if (aiState.desiredExhaustionRecoveryUpgrades > stateBeforeIncrease.desiredExhaustionRecoveryUpgrades) {
    return `Increased desired exhaustionRecoveryUpgrades to ${aiState.desiredExhaustionRecoveryUpgrades}`
  }
  if (aiState.desiredHitPointsRecoveryUpgrades > stateBeforeIncrease.desiredHitPointsRecoveryUpgrades) {
    return `Increased desired hitPointsRecoveryUpgrades to ${aiState.desiredHitPointsRecoveryUpgrades}`
  }
  if (aiState.desiredHitPointsUpgrades > stateBeforeIncrease.desiredHitPointsUpgrades) {
    return `Increased desired hitPointsUpgrades to ${aiState.desiredHitPointsUpgrades}`
  }
  return 'No change detected'
}

function decideSomeDesiredCount(api: PlayTurnAPI): void {
  const { aiState, gameState } = api
  // Priority picks (deterministic, checked first)
  const targetTransportCap = ceil(aiState.desiredAgentCount * TRANSPORT_CAP_RATIO)
  const currentTransportCap = computeTransportCap(aiState.desiredTransportCapUpgrades)
  if (currentTransportCap < targetTransportCap && currentTransportCap < MAX_DESIRED_TRANSPORT_CAP) {
    api.increaseDesiredCount('transportCapUpgrades')
    return
  }

  const targetTrainingCap = ceil(aiState.desiredAgentCount * TRAINING_CAP_RATIO)
  const currentTrainingCap = computeTrainingCap(aiState.desiredTrainingCapUpgrades)
  if (currentTrainingCap < targetTrainingCap && currentTrainingCap < MAX_DESIRED_TRAINING_CAP) {
    api.increaseDesiredCount('trainingCapUpgrades')
    return
  }

  // Calculate sum of all purchased upgrades, excluding caps,
  // as it will be used to determine if it's time to purchase an upgrade instead of more agents,
  // or the supporting infrastructure for them (in form of caps).
  const sumTotalAllAlreadyPurchasedUpgraded =
    aiState.actualWeaponDamageUpgrades +
    aiState.actualTrainingSkillGainUpgrades +
    aiState.actualExhaustionRecoveryUpgrades +
    aiState.actualHitPointsRecoveryUpgrades +
    aiState.actualHitPointsUpgrades

  // Always roll for desiredAgentCount if condition is met
  // Note: if the AGENT_HIRING_PURCHASED_UPGRADES_MULTIPLIER is too large,
  // then the AI player spends all money just buying agents and catching up with transport and training cap.
  if (
    aiState.desiredAgentCount <=
    AGENT_COUNT_BASE + sumTotalAllAlreadyPurchasedUpgraded * AGENT_HIRING_PURCHASED_UPGRADES_MULTIPLIER
  ) {
    decideDesiredAgentCount(api)
    return
  }

  // Deterministic round-robin for stat upgrades
  decideStatUpgrade(api, gameState)
}

function decideStatUpgrade(api: PlayTurnAPI, gameState: GameState): void {
  const availableUpgrades = getAvailableStatUpgrades(gameState)

  if (availableUpgrades.length === 0) {
    // All stat upgrades are at max, just keep increasing hit points (no cap)
    api.increaseDesiredCount('hitPointsUpgrades')
    return
  }

  const { aiState } = api
  const sumStatUpgrades =
    aiState.actualWeaponDamageUpgrades +
    aiState.actualTrainingSkillGainUpgrades +
    aiState.actualExhaustionRecoveryUpgrades +
    aiState.actualHitPointsRecoveryUpgrades +
    aiState.actualHitPointsUpgrades

  const upgradeIndex = sumStatUpgrades % availableUpgrades.length
  const selectedUpgrade = availableUpgrades[upgradeIndex]
  assertDefined(
    selectedUpgrade,
    `Bug: upgradeIndex ${upgradeIndex} out of bounds for availableUpgrades (length ${availableUpgrades.length})`,
  )
  api.increaseDesiredCount(selectedUpgrade)
}

type StatUpgradeType =
  | 'hitPointsUpgrades'
  | 'weaponDamageUpgrades'
  | 'trainingSkillGainUpgrades'
  | 'exhaustionRecoveryUpgrades'
  | 'hitPointsRecoveryUpgrades'

function getAvailableStatUpgrades(gameState: GameState): StatUpgradeType[] {
  // Build array of available stat upgrades by filtering based on caps
  const allUpgrades: { type: StatUpgradeType; available: boolean }[] = [
    // Hit points - always available (no cap)
    { type: 'hitPointsUpgrades', available: true },
    // Weapon damage - capped at MAX_WEAPON_DAMAGE
    { type: 'weaponDamageUpgrades', available: gameState.weaponDamage < MAX_DESIRED_WEAPON_DAMAGE },
    // Training skill gain - always available (no cap)
    { type: 'trainingSkillGainUpgrades', available: true },
    // Exhaustion recovery - capped at MAX_DESIRED_EXHAUSTION_RECOVERY_PCT
    {
      type: 'exhaustionRecoveryUpgrades',
      available: toF(gameState.exhaustionRecovery) < MAX_DESIRED_EXHAUSTION_RECOVERY_PCT,
    },
    // Hit points recovery - capped at MAX_DESIRED_HIT_POINTS_RECOVERY_PCT
    {
      type: 'hitPointsRecoveryUpgrades',
      available: toF(gameState.hitPointsRecoveryPct) < MAX_DESIRED_HIT_POINTS_RECOVERY_PCT,
    },
  ]

  return allUpgrades.filter((u) => u.available).map((u) => u.type)
}

function decideDesiredAgentCount(api: PlayTurnAPI): void {
  const { aiState, gameState } = api

  // Check if we've reached the maximum desired agent count
  if (aiState.desiredAgentCount >= MAX_DESIRED_AGENT_COUNT) {
    // At max agent count, switch to stat upgrades
    decideStatUpgrade(api, gameState)
    return
  }

  // Special case: if at cap, increase agent cap instead (if not at max agent count)
  const currentAgentCap = computeAgentCap(aiState.desiredAgentCapUpgrades)
  if (aiState.desiredAgentCount === currentAgentCap) {
    api.increaseDesiredCount('agentCapUpgrades')
    return
  }
  api.increaseDesiredCount('agentCount')
}

function logFailedPurchase(api: PlayTurnAPI, priority: UpgradeNameOrNewAgent): void {
  const { gameState } = api
  let cost: number

  if (priority === 'newAgent') {
    cost = AGENT_HIRE_COST
  } else {
    cost = getUpgradePrice(priority)
  }

  const currentMoney = gameState.money
  const moneyAfterPurchase = currentMoney - cost
  const minimumRequiredSavings = computeMinimumRequiredSavings(api)

  const purchaseItem = priority === 'newAgent' ? 'newAgent' : priority
  log.info(
    'purchasing',
    `cannot afford ${purchaseItem}. ${currentMoney.toFixed(2)} - ${cost.toFixed(2)} = ${moneyAfterPurchase.toFixed(2)} < ${minimumRequiredSavings.toFixed(2)} = minimum required savings`,
  )
}

function computeMinimumRequiredSavings(api: PlayTurnAPI): number {
  const { gameState } = api
  const upkeepCosts = getAgentUpkeep(gameState)
  const turnsToCover = REQUIRED_TURNS_OF_SAVINGS
  const requiredSavings = upkeepCosts * turnsToCover
  return requiredSavings
}

function ensureDesiredGoalExists(api: PlayTurnAPI): void {
  // KJA this is silly why 50 iterations would be needed?
  const MAX_ITERATIONS = 50
  for (let i = 0; i < MAX_ITERATIONS; i += 1) {
    const { gameState, aiState } = api
    const actualAgentCount = gameState.agents.length

    // Check if we have an actionable goal
    // Agent goal is only actionable if we can actually hire (not at cap)
    if (actualAgentCount < aiState.desiredAgentCount && actualAgentCount < gameState.agentCap) {
      return // Agent goal exists
    }

    if (findNextDesiredUpgrade(aiState) !== undefined) {
      return // Upgrade goal exists
    }

    // No actionable goal - establish new goals
    decideSomeDesiredCount(api)
  }

  // If we exhausted iterations, this is a genuine bug
  throw new Error(
    `AI bug: ensureDesiredGoalExists exhausted ${MAX_ITERATIONS} iterations without establishing an actionable goal`,
  )
}
