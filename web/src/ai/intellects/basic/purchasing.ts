/**
 * Purchasing logic for the Basic Intellect.
 * For explanation, refer to the docs/ai/about_basic_intellect.md file.
 */

import type { PlayTurnAPI } from '../../../lib/model_utils/playTurnApiTypes'
import type { BasicIntellectState } from '../../../redux/slices/aiStateSlice'
import { getUpgradePrice, type UpgradeName } from '../../../lib/data_tables/upgrades'
import { getAgentUpkeep } from '../../../lib/ruleset/moneyRuleset'
import { toF } from '../../../lib/primitives/fixed6'
import { AGENT_HIRE_COST } from '../../../lib/data_tables/constants'
import { assertAboveZero, assertDefined } from '../../../lib/primitives/assertPrimitives'
import { log } from '../../../lib/primitives/logger'
import type { BuyPriority } from './types'
import {
  REQUIRED_TURNS_OF_SAVINGS,
  TRANSPORT_CAP_RATIO,
  TRAINING_CAP_RATIO,
  AGENT_COUNT_BASE,
  AGENT_HIRING_PURCHASED_UPGRADES_MULTIPLIER,
  MAX_DESIRED_WEAPON_DAMAGE,
  MAX_DESIRED_AGENT_COUNT,
  MAX_DESIRED_EXHAUSTION_RECOVERY_PCT,
  MAX_DESIRED_HIT_POINTS_RECOVERY_PCT,
} from './constants'

/**
 * See this file header doc.
 */
export function spendMoney(api: PlayTurnAPI): number {
  let purchaseCount = 0
  while (hasSufficientMoney(api)) {
    const priority = computeNextBuyPriority(api)
    if (hasSufficientMoneyToBuy(api, priority)) {
      buy(api, priority)
      purchaseCount += 1
    } else {
      break
    }
  }
  logFailedPurchase(api, computeNextBuyPriority(api))
  return purchaseCount
}

export function computeNextBuyPriority(api: PlayTurnAPI): BuyPriority {
  const { gameState, aiState } = api
  const totalStatUpgrades = computeTotalStatUpgradesPurchased(aiState)
  const aliveAgents = gameState.agents.length
  const maxDesiredAgents = Math.min(
    AGENT_COUNT_BASE + AGENT_HIRING_PURCHASED_UPGRADES_MULTIPLIER * totalStatUpgrades,
    MAX_DESIRED_AGENT_COUNT,
  )
  if (aliveAgents < maxDesiredAgents) {
    const result = aliveAgents < gameState.agentCap ? 'newAgent' : 'Agent cap'
    return result
  }
  if (gameState.transportCap < aliveAgents * TRANSPORT_CAP_RATIO) {
    return 'Transport cap'
  }
  if (gameState.trainingCap < aliveAgents * TRAINING_CAP_RATIO) {
    return 'Training cap'
  }
  const statUpgrade = chooseStatUpgrade(api)
  return statUpgrade
}

function hasSufficientMoney(api: PlayTurnAPI): boolean {
  const { gameState } = api
  const currentMoney = gameState.money
  const minimumRequiredSavings = computeMinimumRequiredSavings(api)
  return currentMoney >= minimumRequiredSavings
}

function hasSufficientMoneyToBuy(api: PlayTurnAPI, priority: BuyPriority): boolean {
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
  const result = moneyAfterPurchase >= minimumRequiredSavings
  return result
}

function buy(api: PlayTurnAPI, priority: BuyPriority): void {
  executePurchase(api, priority)
  logBuyResult(priority)
}

function executePurchase(api: PlayTurnAPI, priority: BuyPriority): void {
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

function logBuyResult(priority: BuyPriority): void {
  const purchaseItem = priority === 'newAgent' ? 'newAgent' : priority
  log.info('purchasing', `Purchased ${purchaseItem}.`)
}

function logFailedPurchase(api: PlayTurnAPI, priority: BuyPriority): void {
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

export function computeMinimumRequiredSavings(api: PlayTurnAPI): number {
  const { gameState } = api
  const upkeepCosts = getAgentUpkeep(gameState)
  const turnsToCover = REQUIRED_TURNS_OF_SAVINGS
  const requiredSavings = upkeepCosts * turnsToCover
  return requiredSavings
}

function computeTotalStatUpgradesPurchased(aiState: BasicIntellectState): number {
  return (
    aiState.actualWeaponDamageUpgrades +
    aiState.actualTrainingSkillGainUpgrades +
    aiState.actualExhaustionRecoveryUpgrades +
    aiState.actualHitPointsRecoveryUpgrades +
    aiState.actualHitPointsUpgrades
  )
}

function chooseStatUpgrade(api: PlayTurnAPI): UpgradeName {
  const availableUpgrades = getAvailableStatUpgrades(api)
  assertAboveZero(availableUpgrades.length, 'Expected at least one stat upgrade to be available')

  const { aiState } = api
  const sumStatUpgrades = computeTotalStatUpgradesPurchased(aiState)

  const upgradeIndex = sumStatUpgrades % availableUpgrades.length
  const selectedUpgrade = availableUpgrades[upgradeIndex]
  assertDefined(
    selectedUpgrade,
    `UpgradeIndex ${upgradeIndex} out of bounds for availableUpgrades (length ${availableUpgrades.length})`,
  )
  return selectedUpgrade
}

function getAvailableStatUpgrades(api: PlayTurnAPI): UpgradeName[] {
  const { gameState } = api
  // Build array of available stat upgrades by filtering based on caps
  // Order: Hit points, Weapon damage, Training skill gain, Exhaustion recovery, Hit points recovery
  const allUpgrades: { type: UpgradeName; available: boolean }[] = [
    // Hit points - always available (no cap)
    { type: 'Hit points', available: true },
    // Weapon damage - capped at MAX_DESIRED_WEAPON_DAMAGE
    { type: 'Weapon damage', available: gameState.weaponDamage < MAX_DESIRED_WEAPON_DAMAGE },
    // Training skill gain - always available (no cap)
    { type: 'Training skill gain', available: true },
    // Exhaustion recovery - capped at MAX_DESIRED_EXHAUSTION_RECOVERY_PCT
    {
      type: 'Exhaustion recovery %',
      available: toF(gameState.exhaustionRecovery) < MAX_DESIRED_EXHAUSTION_RECOVERY_PCT,
    },
    // Hit points recovery - capped at MAX_DESIRED_HIT_POINTS_RECOVERY_PCT
    {
      type: 'Hit points recovery %',
      available: toF(gameState.hitPointsRecoveryPct) < MAX_DESIRED_HIT_POINTS_RECOVERY_PCT,
    },
  ]

  const available = allUpgrades.filter((u) => u.available).map((u) => u.type)
  return available
}
