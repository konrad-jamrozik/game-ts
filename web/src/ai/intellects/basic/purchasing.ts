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
import { notTerminated } from '../../../lib/model_utils/agentUtils'
import { AGENT_HIRE_COST } from '../../../lib/data_tables/constants'
import { assertUnreachable, assertLessThan } from '../../../lib/primitives/assertPrimitives'
import { ceil } from '../../../lib/primitives/mathPrimitives'
import type { UpgradeNameOrNewAgent } from './types'
import {
  REQUIRED_TURNS_OF_SAVINGS,
  TRANSPORT_CAP_RATIO,
  TRAINING_CAP_RATIO,
  AGENT_COUNT_BASE,
  AGENT_HIRING_PURCHASED_UPGRADES_MULTIPLIER,
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
  console.log(
    `spendMoney: cannot afford ${purchaseItem}. ${currentMoney.toFixed(2)} - ${cost.toFixed(2)} = ${moneyAfterPurchase.toFixed(2)} < ${minimumRequiredSavings.toFixed(2)} = minimum required savings`,
  )
}

function computeMinimumRequiredSavings(api: PlayTurnAPI): number {
  const { gameState } = api
  const upkeepCosts = getAgentUpkeep(gameState)
  const turnsToCover = REQUIRED_TURNS_OF_SAVINGS
  const requiredSavings = upkeepCosts * turnsToCover
  return requiredSavings
}

function computeNextBuyPriority(api: PlayTurnAPI): UpgradeNameOrNewAgent {
  const { gameState, aiState } = api
  const actualAgentCount = notTerminated(gameState.agents).length

  // Priority 1: Buy agents until desired agent count is reached
  if (actualAgentCount < aiState.desiredAgentCount) {
    // Assert we can actually hire (not at agent cap)
    assertLessThan(
      actualAgentCount,
      gameState.agentCap,
      `AI bug: Trying to hire agent but at cap. actualAgentCount=${actualAgentCount}, agentCap=${gameState.agentCap}, desiredAgentCount=${aiState.desiredAgentCount}`,
    )
    return 'newAgent'
  }

  // Find the one cap/upgrade where actual < desired
  return getAndAssertExactlyOneDesiredStateIsOneAboveActual(aiState)
}

function getAndAssertExactlyOneDesiredStateIsOneAboveActual(aiState: BasicIntellectState): UpgradeName {
  const mismatches: string[] = []
  let foundUpgrade: UpgradeName | undefined

  function checkActualVsDesired(actual: number, desired: number, upgradeName: UpgradeName): void {
    if (actual !== desired) {
      if (desired === actual + 1) {
        if (foundUpgrade !== undefined) {
          throw new Error(
            `AI bug: Found multiple upgrades with desired === actual + 1: ${foundUpgrade} and ${upgradeName}`,
          )
        }
        foundUpgrade = upgradeName
      } else {
        mismatches.push(`${upgradeName}: actual=${actual}, desired=${desired}`)
      }
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

  if (foundUpgrade === undefined) {
    const mismatchDetails = mismatches.length > 0 ? ` Mismatches: ${mismatches.join('; ')}` : ''
    throw new Error(
      `AI bug: Expected exactly one desired cap/upgrade to be exactly 1 above actual, but found none.${mismatchDetails}`,
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

  const { gameState: gameStateAfter, aiState: aiStateAfter } = api

  if (areAllDesiredCountsMet(gameStateAfter, aiStateAfter)) {
    const stateBeforeIncrease = { ...aiStateAfter }
    decideSomeDesiredCount(api)
    logBuyResult(api, priority, stateBeforeIncrease)
  } else {
    logBuyResult(api, priority)
  }
}

function executePurchase(api: PlayTurnAPI, priority: UpgradeNameOrNewAgent): void {
  if (priority === 'newAgent') {
    api.hireAgent()
    console.log(`spendMoney: purchased newAgent 🪖`)
    return
  }

  api.buyUpgrade(priority)
  // Track actual upgrade counts
  switch (priority) {
    case 'Agent cap':
      api.incrementActualAgentCapUpgrades()
      break
    case 'Transport cap':
      api.incrementActualTransportCapUpgrades()
      break
    case 'Training cap':
      api.incrementActualTrainingCapUpgrades()
      break
    case 'Weapon damage':
      api.incrementActualWeaponDamageUpgrades()
      break
    case 'Training skill gain':
      api.incrementActualTrainingSkillGainUpgrades()
      break
    case 'Exhaustion recovery %':
      api.incrementActualExhaustionRecoveryUpgrades()
      break
    case 'Hit points recovery %':
      api.incrementActualHitPointsRecoveryUpgrades()
      break
  }

  if (priority === 'Agent cap' || priority === 'Transport cap' || priority === 'Training cap') {
    console.log(`spendMoney: purchased cap 🏦 ${priority}`)
  } else {
    console.log(`spendMoney: purchased upgrade ⏫ ${priority}`)
  }
}

function areAllDesiredCountsMet(gameState: GameState, aiState: BasicIntellectState): boolean {
  const actualAgentCount = notTerminated(gameState.agents).length
  return (
    actualAgentCount >= aiState.desiredAgentCount &&
    aiState.actualAgentCapUpgrades >= aiState.desiredAgentCapUpgrades &&
    aiState.actualTransportCapUpgrades >= aiState.desiredTransportCapUpgrades &&
    aiState.actualTrainingCapUpgrades >= aiState.desiredTrainingCapUpgrades &&
    aiState.actualWeaponDamageUpgrades >= aiState.desiredWeaponDamageUpgrades &&
    aiState.actualTrainingSkillGainUpgrades >= aiState.desiredTrainingSkillGainUpgrades &&
    aiState.actualExhaustionRecoveryUpgrades >= aiState.desiredExhaustionRecoveryUpgrades &&
    aiState.actualHitPointsRecoveryUpgrades >= aiState.desiredHitPointsRecoveryUpgrades
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

  console.log(
    `buy: Purchased ${purchaseItem}. ${increaseMessage}.\n  Desired counts: agents=${aiState.desiredAgentCount}, agentCapUpgrades=${aiState.desiredAgentCapUpgrades}, transportCapUpgrades=${aiState.desiredTransportCapUpgrades}, trainingCapUpgrades=${aiState.desiredTrainingCapUpgrades}, weaponDamageUpgrades=${aiState.desiredWeaponDamageUpgrades}, trainingSkillGainUpgrades=${aiState.desiredTrainingSkillGainUpgrades}, exhaustionRecoveryUpgrades=${aiState.desiredExhaustionRecoveryUpgrades}, hitPointsRecoveryUpgrades=${aiState.desiredHitPointsRecoveryUpgrades}`,
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
  return 'No change detected'
}

function decideSomeDesiredCount(api: PlayTurnAPI): void {
  const { aiState } = api
  // Priority picks (deterministic, checked first)
  const targetTransportCap = ceil(aiState.desiredAgentCount * TRANSPORT_CAP_RATIO)
  const currentTransportCap = computeTransportCap(aiState.desiredTransportCapUpgrades)
  if (currentTransportCap < targetTransportCap) {
    api.increaseDesiredCount('transportCapUpgrades')
    return
  }

  const targetTrainingCap = ceil(aiState.desiredAgentCount * TRAINING_CAP_RATIO)
  const currentTrainingCap = computeTrainingCap(aiState.desiredTrainingCapUpgrades)
  if (currentTrainingCap < targetTrainingCap) {
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
    aiState.actualHitPointsRecoveryUpgrades

  // Note: if the multiplier for sumTotalAllAlreadyPurchasedUpgraded is too large,
  // then the AI player spends all money just buying agents and catching up with transport and training cap.
  // Always roll for desiredAgentCount if condition is met
  if (
    aiState.desiredAgentCount <=
    AGENT_COUNT_BASE + sumTotalAllAlreadyPurchasedUpgraded * AGENT_HIRING_PURCHASED_UPGRADES_MULTIPLIER
  ) {
    decideDesiredAgentCount(api)
    return
  }

  // Deterministic round-robin for stat upgrades
  const sumStatUpgrades =
    aiState.actualWeaponDamageUpgrades +
    aiState.actualTrainingSkillGainUpgrades +
    aiState.actualExhaustionRecoveryUpgrades +
    aiState.actualHitPointsRecoveryUpgrades

  const upgradeIndex = sumStatUpgrades % 4
  switch (upgradeIndex) {
    case 0:
      api.increaseDesiredCount('weaponDamageUpgrades')
      return
    case 1:
      api.increaseDesiredCount('trainingSkillGainUpgrades')
      return
    case 2:
      api.increaseDesiredCount('exhaustionRecoveryUpgrades')
      return
    case 3:
      api.increaseDesiredCount('hitPointsRecoveryUpgrades')
      return
  }
  assertUnreachable('decideSomeDesiredCount: invalid upgrade index')
}

function decideDesiredAgentCount(api: PlayTurnAPI): void {
  const { aiState } = api
  // Special case: if at cap, increase agent cap instead
  const currentAgentCap = computeAgentCap(aiState.desiredAgentCapUpgrades)
  if (aiState.desiredAgentCount === currentAgentCap) {
    api.increaseDesiredCount('agentCapUpgrades')
    return
  }
  api.increaseDesiredCount('agentCount')
}
