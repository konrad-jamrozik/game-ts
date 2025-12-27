import type { AIPlayerIntellect, PlayTurnAPI } from '../types'
import type { Agent } from '../../lib/model/agentModel'
import type { Mission } from '../../lib/model/missionModel'
import type { Lead } from '../../lib/model/leadModel'
import type { GameState } from '../../lib/model/gameStateModel'
import { getUpgradePrice, type UpgradeName } from '../../lib/data_tables/upgrades'
import { getAgentUpkeep, getContractingIncome } from '../../lib/ruleset/moneyRuleset'
import { calculateMissionThreatAssessment } from '../../lib/game_utils/missionThreatAssessment'
import { onTrainingAssignment, notTerminated } from '../../lib/model_utils/agentUtils'
import { filterMissionsByState, getRemainingTransportCap } from '../../lib/model_utils/missionUtils'
import { dataTables } from '../../lib/data_tables/dataTables'
import { f6mult, toF } from '../../lib/primitives/fixed6'
import { initialAgent } from '../../lib/factories/agentFactory'
import { AGENT_CONTRACTING_INCOME } from '../../lib/data_tables/constants'

// KJA got error: Error: Lead lead-black-lotus-member already has an active investigation
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

function deployToMissions(api: PlayTurnAPI): void {
  const { gameState } = api
  const activeMissions = filterMissionsByState(gameState.missions, ['Active'])

  let deploymentsAttempted = 0
  let deploymentsSuccessful = 0
  const cancelledDeployments: { missionId: string; reason: 'insufficientThreat' | 'insufficientTransport' }[] = []

  let mission = selectNextMissionToDeploy(activeMissions)
  while (mission !== undefined) {
    deploymentsAttempted += 1
    const deployed = deployToMission(api, mission, cancelledDeployments)
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
  cancelledDeployments: { missionId: string; reason: 'insufficientThreat' | 'insufficientTransport' }[],
): void {
  const cancelledByThreat = cancelledDeployments.filter((f) => f.reason === 'insufficientThreat').length
  const cancelledByTransportCap = cancelledDeployments.filter((f) => f.reason === 'insufficientTransport').length
  console.log(
    `deployToMissions: attempted ${deploymentsAttempted} missions, deployed ${deploymentsSuccessful}. Cancelled: ${cancelledByThreat} insufficient threat, ${cancelledByTransportCap} insufficient transport cap`,
  )
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
  cancelledDeployments: { missionId: string; reason: 'insufficientThreat' | 'insufficientTransport' }[],
): boolean {
  const { gameState } = api
  const enemyThreat = calculateMissionThreatAssessment(mission)
  const targetThreat = enemyThreat * 1.2 // 120% of enemy threat

  const selectedAgents: Agent[] = []
  let currentThreat = 0

  // Select agents until we reach target threat
  while (currentThreat < targetThreat) {
    const agent = selectNextBestReadyAgent(
      gameState,
      selectedAgents.map((a) => a.id),
    )
    if (agent === undefined) {
      break
    }

    selectedAgents.push(agent)
    currentThreat += calculateAgentThreatAssessment(agent)
  }

  // Check if we have enough threat
  if (currentThreat < targetThreat) {
    cancelledDeployments.push({ missionId: mission.id, reason: 'insufficientThreat' })
    return false
  }

  // Check transport capacity
  const remainingTransportCap = getRemainingTransportCap(gameState.missions, gameState.transportCap)
  if (selectedAgents.length > remainingTransportCap) {
    cancelledDeployments.push({ missionId: mission.id, reason: 'insufficientTransport' })
    return false
  }

  // KJA1 problem here and with all actions
  // it should not be possible to forcefully do things with agents bypassing checks. E.g. recovering agents
  // cannot be deployed to missions, but api.deployAgentsToMission would ignore it.
  // Basically the validation from the UI PlayerActions.tsx is missing. Consider pushing the validation down
  // from PlayerActions.tsx handle* functions to the reducers, e.g. agentReducers.ts and missionReducers.ts
  //
  // But note this  is nontrivial, e.g. when assigning agents to contracting, PlayerActions.tsx
  // checks validateAvailableAgents and validateNotExhaustedAgents; but these checks must be made
  // BEFORE dispatching the action to the reducer. So these validate* functions should be invoked
  // inside the reducer itself and also be separately exposed so the PlayerActions and AI player
  // can use them before invoking the reducer.
  //
  // Perhaps the solution here is to have all the Validate* patterns currently in PlayerActions.tsx
  // to be captured withing PlayTurnAPI, and then make PlayerActions.tsx reuse them.
  // So e.g. api.deployAgentsToMission first runs the validate
  // functions and dispatches the action to the reducer if valid, otherwise returns information about the error
  // for the UI to display.

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

  const selectedAgentIds: string[] = []
  // Estimate desired agent count based on average agent income (using base income as approximation)
  const baseAgentIncome = AGENT_CONTRACTING_INCOME
  const desiredAgentCount = incomeGap > 0 ? Math.ceil(incomeGap / baseAgentIncome) : 0

  while (currentIncome < targetIncome) {
    const doNotIncludeInTraining = false
    const agent = selectNextBestReadyAgent(gameState, selectedAgentIds, doNotIncludeInTraining)
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

  const selectedAgentIds: string[] = []

  for (let i = 0; i < agentsToAssign; i += 1) {
    const lead = selectLeadToInvestigate(availableLeads)
    if (lead === undefined) {
      break
    }

    const agent = selectNextBestReadyAgent(gameState, selectedAgentIds)
    if (agent === undefined) {
      break
    }

    selectedAgentIds.push(agent.id)

    // Check if there's an existing investigation for this lead
    const existingInvestigation = Object.values(gameState.leadInvestigations).find(
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
    }
  }

  console.log(`assignToLeadInvestigation: desired ${agentsToAssign} agents, assigned ${selectedAgentIds.length}`)
}

function assignToTraining(api: PlayTurnAPI): void {
  const { gameState } = api
  const agentsInTraining = onTrainingAssignment(gameState.agents)
  const availableTrainingSlots = gameState.trainingCap - agentsInTraining.length

  const selectedAgentIds: string[] = []

  for (let i = 0; i < availableTrainingSlots; i += 1) {
    const agent = selectNextBestReadyAgent(gameState, selectedAgentIds)
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
  const selectedAgentIds: string[] = []

  const doNotIncludeInTraining = false
  let agent = selectNextBestReadyAgent(gameState, selectedAgentIds, doNotIncludeInTraining)
  while (agent !== undefined) {
    selectedAgentIds.push(agent.id)
    agent = selectNextBestReadyAgent(gameState, selectedAgentIds, doNotIncludeInTraining)
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

function selectNextBestReadyAgent(
  gameState: GameState,
  excludeAgentIds: string[],
  includeInTraining = true,
): Agent | undefined {
  // Get agents in base (Available or in Training)
  // KJA1 introduce inBaseAgents to agentUtils.ts and overall make the AI player reuse
  // these utils in many places.
  const inBaseAgents = gameState.agents.filter((agent: Agent) => {
    if (agent.assignment === 'Standby') {
      return true
    }
    if (agent.assignment === 'Training') {
      return includeInTraining
    }
    return false
  })

  const totalAgentCount = notTerminated(gameState.agents).length

  // Return no agent if less than 20% of all agents are ready
  if (inBaseAgents.length < totalAgentCount * 0.2) {
    return undefined
  }

  // Filter out agents with exhaustion >= 5% and excluded agents
  const readyAgents = inBaseAgents.filter((agent: Agent) => {
    const exhaustionPct = toF(agent.exhaustionPct)
    return exhaustionPct < 5 && !excludeAgentIds.includes(agent.id)
  })

  if (readyAgents.length === 0) {
    return undefined
  }

  // Pick agent with lowest exhaustion, randomly if tied
  return pickAtRandomFromLowestExhaustion(readyAgents)
}

function spendMoney(api: PlayTurnAPI): void {
  while (hasSufficientMoney(api)) {
    const priority = computeNextBuyPriority(api)
    if (priority === undefined) {
      break
    }

    if (hasSufficientMoneyToBuy(api, priority)) {
      buy(api, priority)
    } else {
      break
    }
  }
}

function hasSufficientMoney(api: PlayTurnAPI): boolean {
  const minimumRequiredSavings = computeMinimumRequiredSavings(api)
  const currentMoney = api.gameState.money
  return currentMoney >= minimumRequiredSavings
}

function computeMinimumRequiredSavings(api: PlayTurnAPI): number {
  const { gameState } = api
  const upkeepCosts = getAgentUpkeep(gameState)
  const uncoveredUpkeepCosts = upkeepCosts * 0.5 // Only 50% covered by contracting income
  const turnsToCover = 5
  return uncoveredUpkeepCosts * turnsToCover
}

function computeNextBuyPriority(api: PlayTurnAPI): UpgradeName | 'hireAgent' | undefined {
  const { gameState } = api

  // Priority 1: Buy agents until desired agent count is reached
  if (shouldBuyAgent(gameState)) {
    if (canHireAgent(gameState)) {
      return 'hireAgent'
    }
    return 'Agent cap'
  }

  // Priority 2: Buy transport capacity until desired transport capacity is reached
  if (shouldBuyTransportCapacity(gameState)) {
    return 'Transport cap'
  }

  // Priority 3: Buy training capacity until desired training capacity is reached
  if (shouldBuyTrainingCapacity(gameState)) {
    return 'Training cap'
  }

  // Priority 4: Buy agent effectiveness capabilities until desired agent effectiveness is reached
  if (shouldBuyWeaponDamage(gameState)) {
    return 'Weapon damage'
  }
  if (shouldBuyTrainingSkillGain(gameState)) {
    return 'Training skill gain'
  }
  if (shouldBuyExhaustionRecovery(gameState)) {
    return 'Exhaustion recovery'
  }
  if (shouldBuyHitPointsRecovery(gameState)) {
    return 'Hit points recovery %'
  }

  return undefined
}

function shouldBuyAgent(gameState: GameState): boolean {
  const desiredAgentCount = computeDesiredAgentCount(gameState)
  const actualAgentCount = notTerminated(gameState.agents).length
  return actualAgentCount < desiredAgentCount
}

function canHireAgent(gameState: GameState): boolean {
  const currentAgentCount = notTerminated(gameState.agents).length
  return currentAgentCount < gameState.agentCap
}

function computeDesiredAgentCount(gameState: GameState): number {
  const turnNumber = gameState.turn
  return 4 + Math.floor((turnNumber - 1) / 4)
}

function shouldBuyTransportCapacity(gameState: GameState): boolean {
  const desiredAgentCount = computeDesiredAgentCount(gameState)
  const desiredTransportCapacity = Math.floor(desiredAgentCount * 0.5)
  const actualTransportCapacity = gameState.transportCap
  return actualTransportCapacity < desiredTransportCapacity
}

function shouldBuyTrainingCapacity(gameState: GameState): boolean {
  const desiredAgentCount = computeDesiredAgentCount(gameState)
  const desiredTrainingCapacity = Math.floor(desiredAgentCount * 0.6)
  const actualTrainingCapacity = gameState.trainingCap
  return actualTrainingCapacity < desiredTrainingCapacity
}

function shouldBuyWeaponDamage(gameState: GameState): boolean {
  const desiredLevel = computeDesiredWeaponDamageLevel(gameState)
  const actualLevel = gameState.weaponDamage
  return actualLevel < desiredLevel
}

function shouldBuyTrainingSkillGain(gameState: GameState): boolean {
  const desiredLevel = computeDesiredTrainingSkillGainLevel(gameState)
  const actualLevel = toF(gameState.trainingSkillGain)
  return actualLevel < desiredLevel
}

function shouldBuyExhaustionRecovery(gameState: GameState): boolean {
  const desiredLevel = computeDesiredExhaustionRecoveryLevel(gameState)
  const actualLevel = toF(gameState.exhaustionRecovery)
  return actualLevel < desiredLevel
}

function shouldBuyHitPointsRecovery(gameState: GameState): boolean {
  const desiredLevel = computeDesiredHitPointsRecoveryLevel(gameState)
  const actualLevel = toF(gameState.hitPointsRecoveryPct)
  return actualLevel < desiredLevel
}

function computeDesiredWeaponDamageLevel(gameState: GameState): number {
  const turnNumber = gameState.turn
  return Math.floor(turnNumber / 10)
}

function computeDesiredTrainingSkillGainLevel(gameState: GameState): number {
  const turnNumber = gameState.turn
  return Math.floor(turnNumber / 10)
}

function computeDesiredExhaustionRecoveryLevel(gameState: GameState): number {
  const turnNumber = gameState.turn
  return Math.floor(turnNumber / 10)
}

function computeDesiredHitPointsRecoveryLevel(gameState: GameState): number {
  const turnNumber = gameState.turn
  return Math.floor(turnNumber / 10)
}

function hasSufficientMoneyToBuy(api: PlayTurnAPI, priority: UpgradeName | 'hireAgent'): boolean {
  const { gameState } = api
  let cost: number

  if (priority === 'hireAgent') {
    // AGENT_HIRE_COST from constants
    cost = 50
  } else {
    cost = getUpgradePrice(priority)
  }

  const currentMoney = gameState.money
  return currentMoney >= cost
}

function buy(api: PlayTurnAPI, priority: UpgradeName | 'hireAgent'): void {
  if (priority === 'hireAgent') {
    api.hireAgent()
  } else {
    api.buyUpgrade(priority)
  }
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
  // Rough estimate: use agent skill relative to initial agent
  const initialAgentSkill = toF(initialAgent.skill)
  const agentSkill = toF(agent.skill)
  const skillMultiplier = agentSkill / initialAgentSkill
  // Base income per agent is AGENT_CONTRACTING_INCOME (30)
  return 30 * skillMultiplier
}

function getAvailableLeads(gameState: GameState): Lead[] {
  const allLeads = dataTables.leads
  const availableLeads: Lead[] = []

  for (const lead of allLeads) {
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
