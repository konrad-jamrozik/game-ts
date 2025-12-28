import type { AIPlayerIntellect } from '../types'
import type { PlayTurnAPI } from '../../lib/model_utils/playTurnApiTypes'
import type { Agent } from '../../lib/model/agentModel'
import type { Mission } from '../../lib/model/missionModel'
import type { Lead } from '../../lib/model/leadModel'
import type { GameState } from '../../lib/model/gameStateModel'
import type { AgentId } from '../../lib/model/modelIds'
import type { BasicIntellectState } from '../../redux/slices/aiStateSlice'
import { getUpgradePrice, type UpgradeName } from '../../lib/data_tables/upgrades'
import { getAgentUpkeep, getContractingIncome, getMoneyTurnDiff } from '../../lib/ruleset/moneyRuleset'
import { getAgentSkillBasedValue } from '../../lib/ruleset/skillRuleset'
import { calculateMissionThreatAssessment } from '../../lib/game_utils/missionThreatAssessment'
import { onTrainingAssignment, notTerminated } from '../../lib/model_utils/agentUtils'
import { filterMissionsByState, getRemainingTransportCap } from '../../lib/model_utils/missionUtils'
import { dataTables } from '../../lib/data_tables/dataTables'
import { f6mult, toF } from '../../lib/primitives/fixed6'
import { initialAgent } from '../../lib/factories/agentFactory'
import { AGENT_CONTRACTING_INCOME, AGENT_HIRE_COST } from '../../lib/data_tables/constants'
import { assertUnreachable, assertLessThan } from '../../lib/primitives/assertPrimitives'

type UpgradeNameOrNewAgent = UpgradeName | 'newAgent'

const REQUIRED_TURNS_OF_SAVINGS = 5

export const basicIntellect: AIPlayerIntellect = {
  name: 'Basic',
  playTurn(api: PlayTurnAPI): void {
    manageAgents(api)
    spendMoney(api)
    console.log(`⌛ ===== basicIntellect: finished playing turn ${api.gameState.turn}`)
  },
}

function manageAgents(api: PlayTurnAPI): void {
  unassignExhaustedAgents(api)
  assignToContractingWithPriority(api)
  deployToMissions(api)
  assignToContracting(api)
  assignToLeadInvestigation(api)
  assignToTraining(api)
  assignLeftoverToContracting(api)
}

function unassignExhaustedAgents(api: PlayTurnAPI): void {
  const { gameState } = api
  const assignedAgents = gameState.agents.filter(
    (agent) => agent.state === 'OnAssignment' || (agent.state === 'InTraining' && agent.assignment === 'Training'),
  )

  const exhaustedAgents = assignedAgents.filter((agent) => {
    const exhaustionPct = toF(agent.exhaustionPct)
    return exhaustionPct >= 30
  })

  if (exhaustedAgents.length > 0) {
    api.recallAgents(exhaustedAgents.map((agent) => agent.id))
  }

  logAgentStatistics(gameState)
}

function logAgentStatistics(gameState: GameState): void {
  const standbyAgents = gameState.agents.filter((agent) => agent.assignment === 'Standby')
  const inTrainingAgents = gameState.agents.filter((agent) => agent.assignment === 'Training')
  const inBaseAgents = gameState.agents.filter(
    (agent) => agent.assignment === 'Standby' || agent.assignment === 'Training',
  )
  const readyAgents = inBaseAgents.filter((agent) => {
    const exhaustionPct = toF(agent.exhaustionPct)
    return exhaustionPct < 5
  })
  const totalAgents = notTerminated(gameState.agents).length
  const readyAgentsPct = totalAgents > 0 ? ((readyAgents.length / totalAgents) * 100).toFixed(1) : '0.0'

  console.log(
    `unassignExhaustedAgents: ${standbyAgents.length} standby, ${inTrainingAgents.length} in training, ${readyAgents.length} ready (${readyAgentsPct}% of ${totalAgents} total agents)`,
  )
}

function assignToContractingWithPriority(api: PlayTurnAPI): void {
  const { gameState } = api
  let projectedIncome = getMoneyTurnDiff(gameState)

  // If projected income is already non-negative, no need to assign agents
  if (projectedIncome >= 0) {
    console.log(
      `assignToContractingWithPriority: projected income ${projectedIncome.toFixed(2)} is non-negative, no assignment needed`,
    )
    return
  }

  const selectedAgentIds: AgentId[] = []
  const includeInTraining = true

  // Assign agents until projected income becomes non-negative
  while (projectedIncome < 0) {
    const agent = selectNextAgentForPriorityContracting(gameState, selectedAgentIds, includeInTraining)
    if (agent === undefined) {
      // No more agents available to assign
      break
    }

    selectedAgentIds.push(agent.id)
    // Estimate income increase from this agent
    const agentIncome = estimateAgentContractingIncome(agent)
    projectedIncome += agentIncome
  }

  if (selectedAgentIds.length > 0) {
    api.assignAgentsToContracting(selectedAgentIds)
    const finalProjectedIncome = getMoneyTurnDiff(gameState)
    console.log(
      `assignToContractingWithPriority: assigned ${selectedAgentIds.length} agents to ensure non-negative income. Projected income: ${finalProjectedIncome.toFixed(2)}`,
    )
  } else {
    console.log(
      `assignToContractingWithPriority: projected income ${projectedIncome.toFixed(2)} is negative but no agents available to assign`,
    )
  }
}

function deployToMissions(api: PlayTurnAPI): void {
  const { gameState } = api
  const activeMissions = filterMissionsByState(gameState.missions, ['Active'])

  let deploymentsAttempted = 0
  let deploymentsSuccessful = 0
  const cancelledDeployments: {
    missionId: string
    reason: 'insufficientThreat' | 'insufficientTransport'
    details?: string
  }[] = []

  let mission = selectNextMissionToDeploy(activeMissions)
  while (mission !== undefined) {
    deploymentsAttempted += 1
    const missionId = mission.id
    const deployed = deployToMission(api, mission, cancelledDeployments)
    // Remove the evaluated mission from the list
    const missionIndex = activeMissions.findIndex((m) => m.id === missionId)
    if (missionIndex !== -1) {
      activeMissions.splice(missionIndex, 1)
    }
    if (deployed) {
      deploymentsSuccessful += 1
      mission = selectNextMissionToDeploy(activeMissions)
    } else {
      break
    }
  }

  logDeploymentStatistics(deploymentsAttempted, deploymentsSuccessful, cancelledDeployments)
}

function logDeploymentStatistics(
  deploymentsAttempted: number,
  deploymentsSuccessful: number,
  cancelledDeployments: {
    missionId: string
    reason: 'insufficientThreat' | 'insufficientTransport'
    details?: string
  }[],
): void {
  const cancelledByThreat = cancelledDeployments.filter((f) => f.reason === 'insufficientThreat')
  const cancelledByTransportCap = cancelledDeployments.filter((f) => f.reason === 'insufficientTransport')

  let logMessage = `deployToMissions: attempted ${deploymentsAttempted} missions, deployed ${deploymentsSuccessful}. Cancelled: ${cancelledByThreat.length} insufficient threat, ${cancelledByTransportCap.length} insufficient transport cap`

  // Add details for insufficient threat cancellations
  for (const cancelled of cancelledByThreat) {
    if (cancelled.details !== undefined) {
      logMessage += `\n  - ${cancelled.details}`
    }
  }

  // Add details for insufficient transport cancellations
  for (const cancelled of cancelledByTransportCap) {
    if (cancelled.details !== undefined) {
      logMessage += `\n  - ${cancelled.details}`
    }
  }

  console.log(logMessage)
}

function selectNextMissionToDeploy(availableMissions: Mission[]): Mission | undefined {
  if (availableMissions.length === 0) {
    return undefined
  }

  // Special case: HQ raids (defensive level 6) are chosen first
  const hqRaidMissions = availableMissions.filter((mission) => mission.operationLevel === 6)
  if (hqRaidMissions.length > 0) {
    return pickAtRandom(hqRaidMissions)
  }

  // Otherwise, prioritize by expiry time (earliest first)
  const sortedMissions = availableMissions.toSorted((a, b) => {
    if (a.expiresIn === 'never' && b.expiresIn === 'never') return 0
    if (a.expiresIn === 'never') return 1
    if (b.expiresIn === 'never') return -1
    return a.expiresIn - b.expiresIn
  })

  const firstMission = sortedMissions[0]
  if (firstMission === undefined) {
    return undefined
  }

  const earliestExpiry = firstMission.expiresIn
  if (earliestExpiry === 'never') {
    return pickAtRandom(sortedMissions)
  }

  const missionsWithEarliestExpiry = sortedMissions.filter((mission) => mission.expiresIn === earliestExpiry)
  return pickAtRandom(missionsWithEarliestExpiry)
}

function deployToMission(
  api: PlayTurnAPI,
  mission: Mission,
  cancelledDeployments: {
    missionId: string
    reason: 'insufficientThreat' | 'insufficientTransport'
    details?: string
  }[],
): boolean {
  const { gameState } = api
  const enemyThreat = calculateMissionThreatAssessment(mission)
  const targetThreat = enemyThreat * 1.2 // 120% of enemy threat

  const selectedAgents: Agent[] = []
  let currentThreat = 0

  const includeInTraining = true
  // KJA2 this "doNot" patterns is confusing, as someone will think doNot == false, so "do".
  // Fix everywhere. Also doNotIncludeInTraining.
  const doNotKeepReserve = false
  // Select agents until we reach target threat
  while (currentThreat < targetThreat) {
    const agent = selectNextBestReadyAgent(
      gameState,
      selectedAgents.map((a) => a.id),
      selectedAgents.length,
      includeInTraining,
      doNotKeepReserve,
    )
    if (agent === undefined) {
      break
    }

    selectedAgents.push(agent)
    currentThreat += calculateAgentThreatAssessment(agent)
  }

  // Check if we have enough threat
  if (currentThreat < targetThreat) {
    const details = `Gathered ${selectedAgents.length} agents with total threat of ${currentThreat.toFixed(2)} against required ${targetThreat.toFixed(2)}`
    cancelledDeployments.push({ missionId: mission.id, reason: 'insufficientThreat', details })
    return false
  }

  // Check transport capacity
  const remainingTransportCap = getRemainingTransportCap(gameState.missions, gameState.transportCap)
  if (selectedAgents.length > remainingTransportCap) {
    const details = `Needed ${selectedAgents.length} transport capacity, had ${remainingTransportCap} available out of ${gameState.transportCap} total capacity`
    cancelledDeployments.push({ missionId: mission.id, reason: 'insufficientTransport', details })
    return false
  }
  // Deploy agents
  api.deployAgentsToMission({
    missionId: mission.id,
    agentIds: selectedAgents.map((agent) => agent.id),
  })
  return true
}

function assignToContracting(api: PlayTurnAPI): void {
  const { gameState } = api
  const upkeepCosts = getAgentUpkeep(gameState)
  const targetIncome = upkeepCosts * 1.2 // Target 120% of costs
  let currentIncome = getContractingIncome(gameState)
  const incomeGap = targetIncome - currentIncome

  const selectedAgentIds: AgentId[] = []
  // Estimate desired agent count based on average agent income (using base income as approximation)
  const baseAgentIncome = AGENT_CONTRACTING_INCOME
  const desiredAgentCount = incomeGap > 0 ? Math.ceil(incomeGap / baseAgentIncome) : 0

  while (currentIncome < targetIncome) {
    const doNotIncludeInTraining = false
    const agent = selectNextBestReadyAgent(gameState, selectedAgentIds, selectedAgentIds.length, doNotIncludeInTraining)
    if (agent === undefined) {
      break
    }

    selectedAgentIds.push(agent.id)
    // Estimate income increase (rough approximation)
    const agentIncome = estimateAgentContractingIncome(agent)
    currentIncome += agentIncome
  }

  if (selectedAgentIds.length > 0) {
    api.assignAgentsToContracting(selectedAgentIds)
  }

  console.log(`assignToContracting: desired ${desiredAgentCount} agents, assigned ${selectedAgentIds.length}`)
}

function assignToLeadInvestigation(api: PlayTurnAPI): void {
  const { gameState } = api
  const availableLeads = getAvailableLeads(gameState)
  if (availableLeads.length === 0) {
    return
  }

  const targetAgentCount = computeTargetAgentCountForInvestigation(gameState)
  const currentAgentCount = countAgentsInvestigatingLeads(gameState)
  const agentsToAssign = targetAgentCount - currentAgentCount

  const selectedAgentIds: AgentId[] = []

  for (let i = 0; i < agentsToAssign; i += 1) {
    const lead = selectLeadToInvestigate(availableLeads)
    if (lead === undefined) {
      break
    }

    const agent = selectNextBestReadyAgent(gameState, selectedAgentIds, selectedAgentIds.length)
    if (agent === undefined) {
      break
    }

    selectedAgentIds.push(agent.id)

    // Check if there's an existing investigation for this lead
    // Re-read gameState to get the latest state after previous API calls
    const { gameState: currentGameState } = api
    const { leadInvestigations: currentLeadInvestigations } = currentGameState
    const existingInvestigation = Object.values(currentLeadInvestigations).find(
      (inv) => inv.leadId === lead.id && inv.state === 'Active',
    )

    if (existingInvestigation) {
      api.addAgentsToInvestigation({
        investigationId: existingInvestigation.id,
        agentIds: [agent.id],
      })
    } else {
      api.startLeadInvestigation({
        leadId: lead.id,
        agentIds: [agent.id],
      })
      // Remove the lead from availableLeads since it now has an active investigation
      const leadIndex = availableLeads.findIndex((l) => l.id === lead.id)
      if (leadIndex !== -1) {
        availableLeads.splice(leadIndex, 1)
      }
    }
  }

  console.log(`assignToLeadInvestigation: desired ${agentsToAssign} agents, assigned ${selectedAgentIds.length}`)
}

function assignToTraining(api: PlayTurnAPI): void {
  const { gameState } = api
  const agentsInTraining = onTrainingAssignment(gameState.agents)
  const availableTrainingSlots = gameState.trainingCap - agentsInTraining.length

  const selectedAgentIds: AgentId[] = []

  for (let i = 0; i < availableTrainingSlots; i += 1) {
    const agent = selectNextBestReadyAgent(gameState, selectedAgentIds, selectedAgentIds.length)
    if (agent === undefined) {
      break
    }

    selectedAgentIds.push(agent.id)
  }

  if (selectedAgentIds.length > 0) {
    api.assignAgentsToTraining(selectedAgentIds)
  }

  console.log(`assignToTraining: desired ${availableTrainingSlots} agents, assigned ${selectedAgentIds.length}`)
}

function assignLeftoverToContracting(api: PlayTurnAPI): void {
  const { gameState } = api
  const selectedAgentIds: AgentId[] = []

  const doNotIncludeInTraining = false
  let agent = selectNextBestReadyAgent(gameState, selectedAgentIds, selectedAgentIds.length, doNotIncludeInTraining)
  while (agent !== undefined) {
    selectedAgentIds.push(agent.id)
    agent = selectNextBestReadyAgent(gameState, selectedAgentIds, selectedAgentIds.length, doNotIncludeInTraining)
  }

  if (selectedAgentIds.length > 0) {
    api.assignAgentsToContracting(selectedAgentIds)
  }

  logLeftoverContractingStatistics(gameState, selectedAgentIds.length)
}

function logLeftoverContractingStatistics(gameState: GameState, assignedCount: number): void {
  const standbyAgents = gameState.agents.filter((a) => a.assignment === 'Standby').length
  const inTrainingAgents = gameState.agents.filter((a) => a.assignment === 'Training').length
  const totalAvailable = standbyAgents + inTrainingAgents

  console.log(
    `assignLeftoverToContracting: assigned ${assignedCount} agents, ${totalAvailable} total Standby/InTraining (${standbyAgents} Standby, ${inTrainingAgents} InTraining)`,
  )
}

function selectNextAgentForPriorityContracting(
  gameState: GameState,
  excludeAgentIds: string[],
  includeInTraining = true,
): Agent | undefined {
  // Get agents in base (Standby or in Training)
  const inBaseAgents = gameState.agents.filter((agent: Agent) => {
    // Only select agents that are Available (required for validation)
    if (agent.state !== 'Available') {
      return false
    }
    if (agent.assignment === 'Standby') {
      return true
    }
    // KJA3 this is currently effectively no-op, because agent must
    // become smarter, and first unassign training agents.
    // OR change game logic to allow directly assigning agents in training.
    if (agent.assignment === 'Training') {
      return includeInTraining
    }
    return false
  })

  // Filter out excluded agents only (no exhaustion filter)
  const availableAgents = inBaseAgents.filter((agent: Agent) => !excludeAgentIds.includes(agent.id))

  // Return no agent if none available
  if (availableAgents.length === 0) {
    return undefined
  }

  // Pick agent with lowest exhaustion, randomly if tied
  return pickAtRandomFromLowestExhaustion(availableAgents)
}

function selectNextBestReadyAgent(
  gameState: GameState,
  excludeAgentIds: string[],
  alreadySelectedCount: number,
  includeInTraining = true,
  keepReserve = true,
): Agent | undefined {
  // Get agents in base (Available or in Training)
  // KJA3 introduce inBaseAgents to agentUtils.ts and overall make the AI player reuse
  // these utils in many places.
  const inBaseAgents = gameState.agents.filter((agent: Agent) => {
    // Only select agents that are Available (required for validation)
    if (agent.state !== 'Available') {
      return false
    }
    if (agent.assignment === 'Standby') {
      return true
    }
    if (agent.assignment === 'Training') {
      return includeInTraining
    }
    return false
  })

  const totalAgentCount = notTerminated(gameState.agents).length

  // Filter out agents with exhaustion >= 5% and excluded agents
  const readyAgents = inBaseAgents.filter((agent: Agent) => {
    const exhaustionPct = toF(agent.exhaustionPct)
    return exhaustionPct < 5 && !excludeAgentIds.includes(agent.id)
  })

  // Return no agent if none available
  if (readyAgents.length === 0) {
    return undefined
  }

  // Return no agent if less than 20% of all agents will be ready after selecting alreadySelectedCount agents (only if keepReserve is true)
  if (keepReserve && readyAgents.length - alreadySelectedCount < totalAgentCount * 0.2) {
    return undefined
  }

  // Pick agent with lowest exhaustion, randomly if tied
  return pickAtRandomFromLowestExhaustion(readyAgents)
}

function spendMoney(api: PlayTurnAPI): void {
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
  if (gameState.agentCap < aiState.desiredAgentCap) {
    return 'Agent cap'
  }

  // Find the one cap/upgrade where actual < desired
  // KJA3 assert here that exactly one desired cap is exactly 1 above actual
  if (gameState.transportCap < aiState.desiredTransportCap) {
    return 'Transport cap'
  }
  if (gameState.trainingCap < aiState.desiredTrainingCap) {
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
    api.increaseDesiredCounts()
    logBuyResult(api, priority, stateBeforeIncrease)
  } else {
    logBuyResult(api, priority)
  }
}

function executePurchase(api: PlayTurnAPI, priority: UpgradeNameOrNewAgent): void {
  if (priority === 'newAgent') {
    api.hireAgent()
    return
  }

  api.buyUpgrade(priority)
  // Track actual upgrade counts (caps are tracked via game state, not here)
  switch (priority) {
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
    case 'Agent cap':
    case 'Transport cap':
    case 'Training cap':
      // Cap upgrades are tracked via game state, not in aiState
      break
  }
}

function areAllDesiredCountsMet(gameState: GameState, aiState: BasicIntellectState): boolean {
  const actualAgentCount = notTerminated(gameState.agents).length
  return (
    actualAgentCount >= aiState.desiredAgentCount &&
    gameState.agentCap >= aiState.desiredAgentCap &&
    gameState.transportCap >= aiState.desiredTransportCap &&
    gameState.trainingCap >= aiState.desiredTrainingCap &&
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
    `buy: Purchased ${purchaseItem}. ${increaseMessage}.\n  Desired counts: agents=${aiState.desiredAgentCount}, agentCap=${aiState.desiredAgentCap}, transportCap=${aiState.desiredTransportCap}, trainingCap=${aiState.desiredTrainingCap}, weaponDamageUpgrades=${aiState.desiredWeaponDamageUpgrades}, trainingSkillGainUpgrades=${aiState.desiredTrainingSkillGainUpgrades}, exhaustionRecoveryUpgrades=${aiState.desiredExhaustionRecoveryUpgrades}, hitPointsRecoveryUpgrades=${aiState.desiredHitPointsRecoveryUpgrades}`,
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
  if (aiState.desiredAgentCap > stateBeforeIncrease.desiredAgentCap) {
    return `Increased desired agentCap to ${aiState.desiredAgentCap}`
  }
  if (aiState.desiredTransportCap > stateBeforeIncrease.desiredTransportCap) {
    return `Increased desired transportCap to ${aiState.desiredTransportCap}`
  }
  if (aiState.desiredTrainingCap > stateBeforeIncrease.desiredTrainingCap) {
    return `Increased desired trainingCap to ${aiState.desiredTrainingCap}`
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

// Helper functions

function calculateAgentThreatAssessment(agent: Agent): number {
  const hpMultiplier = toF(agent.hitPoints) / 100
  const damageMultiplier = (agent.weapon.damage * 2) / 100
  const multiplier = 1 + hpMultiplier + damageMultiplier
  const agentThreat = f6mult(agent.skill, multiplier)

  // Normalize by dividing by initial agent threat assessment (same as mission threat assessment)
  const initialAgentThreat = calculateInitialAgentThreatAssessment()
  return agentThreat / initialAgentThreat
}

function calculateInitialAgentThreatAssessment(): number {
  const hpMultiplier = toF(initialAgent.hitPoints) / 100
  const damageMultiplier = (initialAgent.weapon.damage * 2) / 100
  const multiplier = 1 + hpMultiplier + damageMultiplier
  return f6mult(initialAgent.skill, multiplier)
}

function estimateAgentContractingIncome(agent: Agent): number {
  return toF(getAgentSkillBasedValue(agent, AGENT_CONTRACTING_INCOME))
}

function getAvailableLeads(gameState: GameState): Lead[] {
  const allLeads = dataTables.leads
  const availableLeads: Lead[] = []

  for (const lead of allLeads) {
    // Never investigate the deep state lead
    // It exists primarily for debugging purposes. Scheduled to be removed later.
    if (lead.id === 'lead-deep-state') {
      continue
    }

    // Check if lead dependencies are met
    const dependenciesMet = lead.dependsOn.every((depId) => {
      // Check if it's a mission dependency (completed missions)
      if (depId.startsWith('missiondata-')) {
        // Check if there's a mission with this missionDataId that has been won
        const missionWon = gameState.missions.some(
          (mission: Mission) => mission.missionDataId === depId && mission.state === 'Won',
        )
        return missionWon
      }
      // Check if it's a lead dependency (investigation count > 0)
      const investigationCount = gameState.leadInvestigationCounts[depId] ?? 0
      return investigationCount > 0
    })

    if (dependenciesMet) {
      // Check if lead is repeatable or hasn't been investigated yet
      const investigationCount = gameState.leadInvestigationCounts[lead.id] ?? 0
      if (lead.repeatable || investigationCount === 0) {
        // Check if there's an active investigation
        const hasActiveInvestigation = Object.values(gameState.leadInvestigations).some(
          (inv) => inv.leadId === lead.id && inv.state === 'Active',
        )
        // Include if no active investigation (can start new one)
        if (!hasActiveInvestigation) {
          availableLeads.push(lead)
        }
      }
    }
  }

  return availableLeads
}

function selectLeadToInvestigate(availableLeads: Lead[]): Lead | undefined {
  // Prioritize non-repeatable leads over repeatable leads
  const nonRepeatableLeads = availableLeads.filter((lead) => !lead.repeatable)
  if (nonRepeatableLeads.length > 0) {
    return pickAtRandom(nonRepeatableLeads)
  }

  // If no non-repeatable leads, pick from repeatable leads
  return pickAtRandom(availableLeads)
}

function computeTargetAgentCountForInvestigation(gameState: GameState): number {
  const totalAgentCount = notTerminated(gameState.agents).length
  // At least 1 agent, plus 1 extra for each 10 agents
  return 1 + Math.floor(totalAgentCount / 10)
}

function countAgentsInvestigatingLeads(gameState: GameState): number {
  const activeInvestigations = Object.values(gameState.leadInvestigations).filter((inv) => inv.state === 'Active')
  const agentIds = new Set<string>()
  for (const inv of activeInvestigations) {
    for (const agentId of inv.agentIds) {
      agentIds.add(agentId)
    }
  }
  return agentIds.size
}

function pickAtRandom<T>(items: T[]): T {
  if (items.length === 0) {
    throw new Error('Cannot pick from empty array')
  }
  const index = Math.floor(Math.random() * items.length)
  const item = items[index]
  if (item === undefined) {
    throw new Error('Array index out of bounds')
  }
  return item
}

function pickAtRandomFromLowestExhaustion(agents: Agent[]): Agent {
  if (agents.length === 0) {
    throw new Error('Cannot pick from empty array')
  }

  const firstAgent = agents[0]
  if (firstAgent === undefined) {
    throw new Error('Cannot pick from empty array')
  }

  // Find minimum exhaustion
  let minExhaustion = toF(firstAgent.exhaustionPct)
  for (const agent of agents) {
    const exhaustion = toF(agent.exhaustionPct)
    if (exhaustion < minExhaustion) {
      minExhaustion = exhaustion
    }
  }

  // Filter agents with minimum exhaustion
  const agentsWithMinExhaustion = agents.filter((agent: Agent) => {
    const exhaustion = toF(agent.exhaustionPct)
    return exhaustion === minExhaustion
  })

  return pickAtRandom(agentsWithMinExhaustion)
}
