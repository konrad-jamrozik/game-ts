import type { PlayTurnAPI } from '../../../lib/model_utils/playTurnApiTypes'
import type { GameState } from '../../../lib/model/gameStateModel'
import type { BasicIntellectState } from '../../../redux/slices/aiStateSlice'
import {
  getUpgradePrice,
  computeAgentCap,
  computeTransportCap,
  computeTrainingCap,
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
  PURCHASED_UPGRADES_MULTIPLIER,
  PROBABILITY_AGENTS,
  PROBABILITY_WEAPON_DAMAGE,
  PROBABILITY_TRAINING_SKILL_GAIN,
  PROBABILITY_EXHAUSTION_RECOVERY,
  PROBABILITY_HIT_POINTS_RECOVERY,
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

  // KJA1 this can be simplified: the assertExactlyOneDesiredStateIsOneAboveActual should return the exactly one desired upgrade and we return it.
  // It should be renamed to getAndAssertExactlyOneDesiredStateIsOneAboveActual

  // Priority 2: Buy agent cap if below desired
  const desiredAgentCap = computeAgentCap(aiState.desiredAgentCapUpgrades)
  if (gameState.agentCap < desiredAgentCap) {
    return 'Agent cap'
  }

  // Find the one cap/upgrade where actual < desired
  assertExactlyOneDesiredStateIsOneAboveActual(aiState)
  const desiredTransportCap = computeTransportCap(aiState.desiredTransportCapUpgrades)
  if (gameState.transportCap < desiredTransportCap) {
    return 'Transport cap'
  }
  const desiredTrainingCap = computeTrainingCap(aiState.desiredTrainingCapUpgrades)
  if (gameState.trainingCap < desiredTrainingCap) {
    return 'Training cap'
  }
  if (aiState.actualWeaponDamageUpgrades < aiState.desiredWeaponDamageUpgrades) {
    return 'Weapon damage'
  }
  if (aiState.actualTrainingSkillGainUpgrades < aiState.desiredTrainingSkillGainUpgrades) {
    return 'Training skill gain'
  }
  if (aiState.actualExhaustionRecoveryUpgrades < aiState.desiredExhaustionRecoveryUpgrades) {
    return 'Exhaustion recovery'
  }
  if (aiState.actualHitPointsRecoveryUpgrades < aiState.desiredHitPointsRecoveryUpgrades) {
    return 'Hit points recovery %'
  }

  assertUnreachable('computeNextBuyPriority: no priority found')
}

function assertExactlyOneDesiredStateIsOneAboveActual(aiState: BasicIntellectState): void {
  const mismatches: string[] = []
  let exactlyOneAboveCount = 0

  function checkActualVsDesired(actual: number, desired: number, name: string): void {
    if (actual !== desired) {
      if (desired === actual + 1) {
        exactlyOneAboveCount += 1
      } else {
        mismatches.push(`${name}: actual=${actual}, desired=${desired}`)
      }
    }
  }

  checkActualVsDesired(aiState.actualAgentCapUpgrades, aiState.desiredAgentCapUpgrades, 'agentCapUpgrades')
  checkActualVsDesired(aiState.actualTransportCapUpgrades, aiState.desiredTransportCapUpgrades, 'transportCapUpgrades')
  checkActualVsDesired(aiState.actualTrainingCapUpgrades, aiState.desiredTrainingCapUpgrades, 'trainingCapUpgrades')
  checkActualVsDesired(aiState.actualWeaponDamageUpgrades, aiState.desiredWeaponDamageUpgrades, 'weaponDamageUpgrades')
  checkActualVsDesired(
    aiState.actualTrainingSkillGainUpgrades,
    aiState.desiredTrainingSkillGainUpgrades,
    'trainingSkillGainUpgrades',
  )
  checkActualVsDesired(
    aiState.actualExhaustionRecoveryUpgrades,
    aiState.desiredExhaustionRecoveryUpgrades,
    'exhaustionRecoveryUpgrades',
  )
  checkActualVsDesired(
    aiState.actualHitPointsRecoveryUpgrades,
    aiState.desiredHitPointsRecoveryUpgrades,
    'hitPointsRecoveryUpgrades',
  )

  if (exactlyOneAboveCount !== 1) {
    const mismatchDetails = mismatches.length > 0 ? ` Mismatches: ${mismatches.join('; ')}` : ''
    throw new Error(
      `AI bug: Expected exactly one desired cap/upgrade to be exactly 1 above actual, but found ${exactlyOneAboveCount}.${mismatchDetails}`,
    )
  }
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
    console.log(`spendMoney: purchased newAgent`)
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
    case 'Exhaustion recovery':
      api.incrementActualExhaustionRecoveryUpgrades()
      break
    case 'Hit points recovery %':
      api.incrementActualHitPointsRecoveryUpgrades()
      break
  }

  if (priority === 'Agent cap' || priority === 'Transport cap' || priority === 'Training cap') {
    console.log(`spendMoney: purchased cap ${priority}`)
  } else {
    console.log(`spendMoney: purchased upgrade ${priority}`)
  }
}

function areAllDesiredCountsMet(gameState: GameState, aiState: BasicIntellectState): boolean {
  const actualAgentCount = notTerminated(gameState.agents).length
  // KJA1 this can be simplified: we don't compute the caps. Just upgrade counts.
  const desiredAgentCap = computeAgentCap(aiState.desiredAgentCapUpgrades)
  const desiredTransportCap = computeTransportCap(aiState.desiredTransportCapUpgrades)
  const desiredTrainingCap = computeTrainingCap(aiState.desiredTrainingCapUpgrades)
  return (
    actualAgentCount >= aiState.desiredAgentCount &&
    gameState.agentCap >= desiredAgentCap &&
    gameState.transportCap >= desiredTransportCap &&
    gameState.trainingCap >= desiredTrainingCap &&
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

  // KJA1 do not log caps, just upgrade counts
  const desiredAgentCap = computeAgentCap(aiState.desiredAgentCapUpgrades)
  const desiredTransportCap = computeTransportCap(aiState.desiredTransportCapUpgrades)
  const desiredTrainingCap = computeTrainingCap(aiState.desiredTrainingCapUpgrades)
  console.log(
    `buy: Purchased ${purchaseItem}. ${increaseMessage}.\n  Desired counts: agents=${aiState.desiredAgentCount}, agentCapUpgrades=${aiState.desiredAgentCapUpgrades} (cap=${desiredAgentCap}), transportCapUpgrades=${aiState.desiredTransportCapUpgrades} (cap=${desiredTransportCap}), trainingCapUpgrades=${aiState.desiredTrainingCapUpgrades} (cap=${desiredTrainingCap}), weaponDamageUpgrades=${aiState.desiredWeaponDamageUpgrades}, trainingSkillGainUpgrades=${aiState.desiredTrainingSkillGainUpgrades}, exhaustionRecoveryUpgrades=${aiState.desiredExhaustionRecoveryUpgrades}, hitPointsRecoveryUpgrades=${aiState.desiredHitPointsRecoveryUpgrades}`,
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
    // KJA1 do not log caps, just upgrade counts
    const desiredCap = computeAgentCap(aiState.desiredAgentCapUpgrades)
    return `Increased desired agentCapUpgrades to ${aiState.desiredAgentCapUpgrades} (cap=${desiredCap})`
  }
  if (aiState.desiredTransportCapUpgrades > stateBeforeIncrease.desiredTransportCapUpgrades) {
    const desiredCap = computeTransportCap(aiState.desiredTransportCapUpgrades)
    return `Increased desired transportCapUpgrades to ${aiState.desiredTransportCapUpgrades} (cap=${desiredCap})`
  }
  if (aiState.desiredTrainingCapUpgrades > stateBeforeIncrease.desiredTrainingCapUpgrades) {
    const desiredCap = computeTrainingCap(aiState.desiredTrainingCapUpgrades)
    return `Increased desired trainingCapUpgrades to ${aiState.desiredTrainingCapUpgrades} (cap=${desiredCap})`
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

  // Calculate sum of all purchased upgrades (including caps)
  const sumTotalAllAlreadyPurchasedUpgraded =
    aiState.actualAgentCapUpgrades +
    aiState.actualTransportCapUpgrades +
    aiState.actualTrainingCapUpgrades +
    aiState.actualWeaponDamageUpgrades +
    aiState.actualTrainingSkillGainUpgrades +
    aiState.actualExhaustionRecoveryUpgrades +
    aiState.actualHitPointsRecoveryUpgrades

  // Note: if the multiplier for sumTotalAllAlreadyPurchasedUpgraded is too large,
  // then the AI player spends all money just buying agents and catching up with transport and training cap.
  // Always roll for desiredAgentCount if condition is met
  if (
    aiState.desiredAgentCount <=
    AGENT_COUNT_BASE + sumTotalAllAlreadyPurchasedUpgraded * PURCHASED_UPGRADES_MULTIPLIER
  ) {
    decideDesiredAgentCount(api)
    return
  }

  // Weighted random (if no priority pick and condition not met)
  // Agents: 50%, Weapon damage: 12.5%, Training skill gain: 12.5%,
  // Exhaustion recovery: 12.5%, Hit points recovery: 12.5%
  const random = Math.random()

  if (random < PROBABILITY_AGENTS) {
    decideDesiredAgentCount(api)
    return
  }

  if (random < PROBABILITY_WEAPON_DAMAGE) {
    api.increaseDesiredCount('weaponDamageUpgrades')
    return
  }

  if (random < PROBABILITY_TRAINING_SKILL_GAIN) {
    api.increaseDesiredCount('trainingSkillGainUpgrades')
    return
  }

  if (random < PROBABILITY_EXHAUSTION_RECOVERY) {
    api.increaseDesiredCount('exhaustionRecoveryUpgrades')
    return
  }

  if (random < PROBABILITY_HIT_POINTS_RECOVERY) {
    api.increaseDesiredCount('hitPointsRecoveryUpgrades')
    return
  }
  assertUnreachable('decideSomeDesiredCount: no priority pick met')
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
