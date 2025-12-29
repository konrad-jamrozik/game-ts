import type { PlayTurnAPI } from '../../../lib/model_utils/playTurnApiTypes'
import type { GameState } from '../../../lib/model/gameStateModel'
import type { BasicIntellectState } from '../../../redux/slices/aiStateSlice'
import { getUpgradePrice } from '../../../lib/data_tables/upgrades'
import { getAgentUpkeep } from '../../../lib/ruleset/moneyRuleset'
import { notTerminated } from '../../../lib/model_utils/agentUtils'
import { AGENT_CAP, AGENT_HIRE_COST, TRAINING_CAP, TRANSPORT_CAP } from '../../../lib/data_tables/constants'
import { assertUnreachable, assertLessThan } from '../../../lib/primitives/assertPrimitives'
import { ceil } from '../../../lib/primitives/mathPrimitives'
import { REQUIRED_TURNS_OF_SAVINGS, type UpgradeNameOrNewAgent } from './types'

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

  // Priority 2: Buy agent cap if below desired
  // KJA2 these constants should come from relevant upgrades data table
  const desiredAgentCap = AGENT_CAP + aiState.desiredAgentCapUpgrades * 4
  if (gameState.agentCap < desiredAgentCap) {
    return 'Agent cap'
  }

  // Find the one cap/upgrade where actual < desired
  assertExactlyOneDesiredStateIsOneAboveActual(aiState)
  const desiredTransportCap = TRANSPORT_CAP + aiState.desiredTransportCapUpgrades * 2
  if (gameState.transportCap < desiredTransportCap) {
    return 'Transport cap'
  }
  const desiredTrainingCap = TRAINING_CAP + aiState.desiredTrainingCapUpgrades * 4
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
  // KJA2 these constants should come from relevant upgrades data table
  const desiredAgentCap = AGENT_CAP + aiState.desiredAgentCapUpgrades * 4
  const desiredTransportCap = TRANSPORT_CAP + aiState.desiredTransportCapUpgrades * 2
  const desiredTrainingCap = TRAINING_CAP + aiState.desiredTrainingCapUpgrades * 4
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

  // KJA2 these constants should come from relevant upgrades data table
  const desiredAgentCap = AGENT_CAP + aiState.desiredAgentCapUpgrades * 4
  const desiredTransportCap = TRANSPORT_CAP + aiState.desiredTransportCapUpgrades * 2
  const desiredTrainingCap = TRAINING_CAP + aiState.desiredTrainingCapUpgrades * 4
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
  // KJA2 these constants should come from relevant upgrades data table
  if (aiState.desiredAgentCapUpgrades > stateBeforeIncrease.desiredAgentCapUpgrades) {
    const desiredCap = AGENT_CAP + aiState.desiredAgentCapUpgrades * 4
    return `Increased desired agentCapUpgrades to ${aiState.desiredAgentCapUpgrades} (cap=${desiredCap})`
  }
  if (aiState.desiredTransportCapUpgrades > stateBeforeIncrease.desiredTransportCapUpgrades) {
    const desiredCap = TRANSPORT_CAP + aiState.desiredTransportCapUpgrades * 2
    return `Increased desired transportCapUpgrades to ${aiState.desiredTransportCapUpgrades} (cap=${desiredCap})`
  }
  if (aiState.desiredTrainingCapUpgrades > stateBeforeIncrease.desiredTrainingCapUpgrades) {
    const desiredCap = TRAINING_CAP + aiState.desiredTrainingCapUpgrades * 4
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
  const targetTransportCap = ceil(aiState.desiredAgentCount * 0.25)
  // KJA2 these constants (for caps) should come from relevant upgrades data table
  const currentTransportCap = TRANSPORT_CAP + aiState.desiredTransportCapUpgrades * 2
  if (currentTransportCap < targetTransportCap) {
    api.increaseDesiredCount('transportCapUpgrades')
    return
  }

  const targetTrainingCap = ceil(aiState.desiredAgentCount * 0.3)
  const currentTrainingCap = TRAINING_CAP + aiState.desiredTrainingCapUpgrades * 4
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

  // KJA2 make these 8 and 4 and ratios above and below into constants, once this is moved to AI
  // Note: if the multiplier for sumTotalAllAlreadyPurchasedUpgraded is too large,
  // then the AI player spends all money just buying agents and catching up with transport and training cap.
  // Always roll for desiredAgentCount if condition is met
  if (aiState.desiredAgentCount <= 8 + sumTotalAllAlreadyPurchasedUpgraded * 2) {
    decideDesiredAgentCount(api)
    return
  }

  // Weighted random (if no priority pick and condition not met)
  // Agents: 50%, Weapon damage: 12.5%, Training skill gain: 12.5%,
  // Exhaustion recovery: 12.5%, Hit points recovery: 12.5%
  const random = Math.random()

  if (random < 0.5) {
    decideDesiredAgentCount(api)
    return
  }

  if (random < 0.625) {
    api.increaseDesiredCount('weaponDamageUpgrades')
    return
  }

  if (random < 0.75) {
    api.increaseDesiredCount('trainingSkillGainUpgrades')
    return
  }

  if (random < 0.875) {
    api.increaseDesiredCount('exhaustionRecoveryUpgrades')
    return
  }

  api.increaseDesiredCount('hitPointsRecoveryUpgrades')
}

function decideDesiredAgentCount(api: PlayTurnAPI): void {
  const { aiState } = api
  // Special case: if at cap, increase agent cap instead
  const currentAgentCap = AGENT_CAP + aiState.desiredAgentCapUpgrades * 4
  if (aiState.desiredAgentCount === currentAgentCap) {
    api.increaseDesiredCount('agentCapUpgrades')
    return
  }
  api.increaseDesiredCount('agentCount')
}
