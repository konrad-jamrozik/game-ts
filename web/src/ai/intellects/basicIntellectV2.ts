/* eslint-disable @typescript-eslint/no-loop-func */
/* eslint-disable no-continue */
import {
  hireAgent,
  assignAgentsToContracting,
  assignAgentsToTraining,
  deployAgentsToMission,
  recallAgents,
  buyUpgrade,
} from '../../redux/slices/gameStateSlice'
import { AGENT_HIRE_COST } from '../../lib/data_tables/constants'
import {
  available,
  notTerminated,
  onContractingAssignment,
  onTrainingAssignment,
  recallable,
} from '../../lib/model_utils/agentUtils'
import {
  filterMissionsByState,
  getRemainingTransportCap,
  validateMissionDeployment,
} from '../../lib/model_utils/missionUtils'
import { calculateMissionThreatAssessment } from '../../lib/game_utils/missionThreatAssessment'
import { getContractingIncome, getAgentUpkeep } from '../../lib/ruleset/moneyRuleset'
import { UPGRADE_PRICES } from '../../lib/data_tables/upgrades'
import { toF, f6mult } from '../../lib/primitives/fixed6'
import { initialAgent } from '../../lib/factories/agentFactory'
import type { AIPlayerIntellect } from '../types'
import type { GameState } from '../../lib/model/gameStateModel'
import type { AppDispatch } from '../../redux/store'
import type { Agent } from '../../lib/model/agentModel'
import type { Mission } from '../../lib/model/missionModel'

export const basicIntellectV2: AIPlayerIntellect = {
  name: 'Basic V2',
  playTurn: (getState, dispatch) => {
    basicIntellectV2PlayTurn(getState, dispatch)
  },
}

function basicIntellectV2PlayTurn(getState: () => GameState, dispatch: AppDispatch): void {
  // Unassign agents with exhaustion >= 30%
  unassignExhaustedAgents(getState, dispatch)

  let state = getState()

  // Check if we'd run out of money in 3 turns
  const wouldRunOutOfMoney = wouldRunOutOfMoneyInThreeTurns(state)

  // Money management: If would run out of money, don't spend on anything
  if (wouldRunOutOfMoney) {
    // Try to increase income by assigning more agents to contracting
    increaseContractingIncome(getState, dispatch)
    return
  }

  // If enough money available, proceed with spending
  // 1. Hire new agents
  const nonTerminatedAgents = notTerminated(state.agents)
  while (state.money >= AGENT_HIRE_COST && nonTerminatedAgents.length < state.agentCap) {
    dispatch(hireAgent())
    state = getState()
    const updatedNonTerminated = notTerminated(state.agents)
    if (updatedNonTerminated.length >= state.agentCap) {
      break
    }
    // Check again after each purchase
    if (wouldRunOutOfMoneyInThreeTurns(state)) {
      break
    }
  }

  state = getState()

  // 2. Increase agent cap if cannot hire
  if (
    nonTerminatedAgents.length >= state.agentCap &&
    state.money >= UPGRADE_PRICES['Agent cap'] &&
    !wouldRunOutOfMoneyInThreeTurnsAfterPurchase(state, UPGRADE_PRICES['Agent cap'])
  ) {
    dispatch(buyUpgrade('Agent cap'))
  }

  // 3. Send available agents to training
  state = getState()
  let availableAgents = available(state.agents)
  const agentsInTraining = onTrainingAssignment(state.agents)
  const availableTrainingCap = state.trainingCap - agentsInTraining.length

  // Sort by exhaustion (least exhausted first)
  availableAgents = sortAgentsByExhaustion(availableAgents)

  const agentsToTrain = availableAgents.slice(0, availableTrainingCap)
  if (agentsToTrain.length > 0) {
    const agentIds = agentsToTrain.map((a) => a.id)
    dispatch(assignAgentsToTraining(agentIds))
    state = getState()
    // Check again after purchase
    if (wouldRunOutOfMoneyInThreeTurns(state)) {
      // Unassign from training if we'd run out of money
      dispatch(recallAgents(agentIds))
    }
  }

  // 4. Increase training cap if cannot send agents to training
  state = getState()
  availableAgents = available(state.agents)
  if (
    availableAgents.length > 0 &&
    state.trainingCap - onTrainingAssignment(state.agents).length === 0 &&
    state.money >= UPGRADE_PRICES['Training cap'] &&
    !wouldRunOutOfMoneyInThreeTurnsAfterPurchase(state, UPGRADE_PRICES['Training cap'])
  ) {
    dispatch(buyUpgrade('Training cap'))
  }

  // 5. Manage monthly income: Aim for 100-120% of ongoing expenditures from contracting
  manageMonthlyIncome(getState, dispatch)

  // 6. Mission deployment
  state = getState()
  availableAgents = available(state.agents)
  availableAgents = sortAgentsByExhaustion(availableAgents)
  const activeMissions = filterMissionsByState(state.missions, ['Active'])
  deployToMissions(getState, dispatch, availableAgents, activeMissions)

  // 7. Increase transport cap if needed for missions
  state = getState()
  const remainingTransportCap = getRemainingTransportCap(state.missions, state.transportCap)
  const needsMoreTransportCap = checkIfNeedsMoreTransportCap(state, activeMissions, remainingTransportCap)
  if (
    needsMoreTransportCap &&
    state.money >= UPGRADE_PRICES['Transport cap'] &&
    !wouldRunOutOfMoneyInThreeTurnsAfterPurchase(state, UPGRADE_PRICES['Transport cap'])
  ) {
    dispatch(buyUpgrade('Transport cap'))
  }

  // 8. Assign remaining available agents to contracting for income
  state = getState()
  availableAgents = available(state.agents)
  availableAgents = sortAgentsByExhaustion(availableAgents)
  if (availableAgents.length > 0) {
    const agentIds = availableAgents.map((a) => a.id)
    dispatch(assignAgentsToContracting(agentIds))
  }
}

function wouldRunOutOfMoneyInThreeTurns(state: GameState): boolean {
  let projectedMoney = state.money

  // Project 3 turns ahead
  // Note: We exclude funding income from projections (as per rules)
  for (let turn = 0; turn < 3; turn += 1) {
    // Calculate turn diff excluding funding (only contracting income - upkeep)
    const contractingIncome = getContractingIncome(state)
    const agentUpkeep = getAgentUpkeep(state)
    const turnDiff = contractingIncome - agentUpkeep

    projectedMoney += turnDiff

    // If we'd run out of money (go negative), return true
    if (projectedMoney < 0) {
      return true
    }

    // Create a projected state for next iteration (simplified - assumes no changes)
    // We can't modify the actual state, so we simulate by using current state
    // This is an approximation - in reality, agent counts might change
  }

  return false
}

function wouldRunOutOfMoneyInThreeTurnsAfterPurchase(state: GameState, purchaseCost: number): boolean {
  // Simulate the purchase
  const simulatedState: GameState = {
    ...state,
    money: state.money - purchaseCost,
  }

  return wouldRunOutOfMoneyInThreeTurns(simulatedState)
}

function unassignExhaustedAgents(getState: () => GameState, dispatch: AppDispatch): void {
  const state = getState()
  const recallableAgents = recallable(state.agents)
  const exhaustedAgents = recallableAgents.filter((agent) => {
    const exhaustionPct = toF(agent.exhaustionPct)
    return exhaustionPct >= 30
  })

  if (exhaustedAgents.length > 0) {
    const agentIds = exhaustedAgents.map((a) => a.id)
    dispatch(recallAgents(agentIds))
  }
}

function increaseContractingIncome(getState: () => GameState, dispatch: AppDispatch): void {
  let state = getState()

  // Unassign agents from training first if needed
  const trainingAgents = onTrainingAssignment(state.agents)
  if (trainingAgents.length > 0) {
    const agentIds = trainingAgents.map((a) => a.id)
    dispatch(recallAgents(agentIds))
    state = getState()
  }

  // Assign available agents to contracting
  let availableAgents = available(state.agents)
  availableAgents = sortAgentsByExhaustion(availableAgents)

  if (availableAgents.length > 0) {
    const agentIds = availableAgents.map((a) => a.id)
    dispatch(assignAgentsToContracting(agentIds))
  }
}

function manageMonthlyIncome(getState: () => GameState, dispatch: AppDispatch): void {
  let state = getState()

  // Calculate ongoing expenditures (agent upkeep only, excluding one-time costs)
  const ongoingExpenditures = getAgentUpkeep(state)

  // Calculate current contracting income (excluding funding)
  const currentContractingIncome = getContractingIncome(state)

  // Target: 100% to 120% of ongoing expenditures
  // eslint-disable-next-line no-implicit-coercion
  const targetMin = ongoingExpenditures * 1.0
  const targetMax = ongoingExpenditures * 1.2

  if (currentContractingIncome < targetMin) {
    // Need more income - assign more agents to contracting
    let availableAgents = available(state.agents)
    availableAgents = sortAgentsByExhaustion(availableAgents)

    // Unassign from training if needed
    const trainingAgents = onTrainingAssignment(state.agents)
    if (trainingAgents.length > 0 && availableAgents.length === 0) {
      const agentIds = trainingAgents.map((a) => a.id)
      dispatch(recallAgents(agentIds))
      state = getState()
      availableAgents = available(state.agents)
      availableAgents = sortAgentsByExhaustion(availableAgents)
    }

    // Assign agents until we reach target
    for (const agent of availableAgents) {
      const currentIncome = getContractingIncome(state)
      if (currentIncome >= targetMax) {
        break
      }

      dispatch(assignAgentsToContracting([agent.id]))
      state = getState()

      const newIncome = getContractingIncome(state)
      if (newIncome >= targetMax) {
        break
      }
    }
  } else if (currentContractingIncome > targetMax) {
    // Have too much income - can unassign some agents (but keep at least targetMin)
    const contractingAgents = onContractingAssignment(state.agents)
    // Sort by exhaustion (most exhausted first, so we unassign them)
    const sortedContractingAgents = [...contractingAgents].toSorted(
      (a, b) => toF(b.exhaustionPct) - toF(a.exhaustionPct),
    )

    for (const agent of sortedContractingAgents) {
      const currentIncome = getContractingIncome(state)
      if (currentIncome <= targetMin) {
        break
      }

      dispatch(recallAgents([agent.id]))
      state = getState()

      const newIncome = getContractingIncome(state)
      if (newIncome <= targetMin) {
        break
      }
    }
  }
}

function sortAgentsByExhaustion(agents: Agent[]): Agent[] {
  return [...agents].toSorted((a, b) => toF(a.exhaustionPct) - toF(b.exhaustionPct))
}

function calculateAgentThreatAssessment(agent: Agent): number {
  const hpMultiplier = toF(agent.hitPoints) / 100
  const damageMultiplier = (agent.weapon.damage * 2) / 100
  const multiplier = 1 + hpMultiplier + damageMultiplier
  return f6mult(agent.skill, multiplier)
}

function calculateTotalAgentThreatAssessment(agents: Agent[]): number {
  const totalThreat = agents.reduce((sum, agent) => sum + calculateAgentThreatAssessment(agent), 0)
  // Normalize by dividing by initial agent threat assessment (same as mission threat assessment)
  const initialAgentThreat = calculateAgentThreatAssessment(initialAgent)
  return totalThreat / initialAgentThreat
}

function deployToMissions(
  getState: () => GameState,
  dispatch: AppDispatch,
  availableAgents: Agent[],
  activeMissions: Mission[],
): Agent[] {
  let state = getState()
  let currentAvailableAgents = availableAgents

  for (const mission of activeMissions) {
    if (currentAvailableAgents.length === 0) break

    const validation = validateMissionDeployment(mission)
    if (!validation.isValid) continue

    const missionThreat = calculateMissionThreatAssessment(mission)
    const remainingTransportCap = getRemainingTransportCap(state.missions, state.transportCap)

    if (remainingTransportCap === 0) break

    // Find agents that can meet the threat requirement
    const agentsToDeploy: Agent[] = []
    let totalThreat = 0

    for (const agent of currentAvailableAgents) {
      if (agentsToDeploy.length >= remainingTransportCap) break

      agentsToDeploy.push(agent)
      totalThreat = calculateTotalAgentThreatAssessment(agentsToDeploy)

      if (totalThreat >= missionThreat) {
        break
      }
    }

    // Only deploy if we meet the threat requirement
    if (totalThreat >= missionThreat && agentsToDeploy.length > 0) {
      const agentIds = agentsToDeploy.map((a) => a.id)
      dispatch(deployAgentsToMission({ missionId: mission.id, agentIds }))
      state = getState()
      currentAvailableAgents = available(state.agents)
      currentAvailableAgents = sortAgentsByExhaustion(currentAvailableAgents)
    }
  }

  return currentAvailableAgents
}

function checkIfNeedsMoreTransportCap(
  state: GameState,
  activeMissions: Mission[],
  remainingTransportCap: number,
): boolean {
  // Check if there are missions we can't deploy to due to transport cap
  for (const mission of activeMissions) {
    const validation = validateMissionDeployment(mission)
    if (!validation.isValid) continue

    const missionThreat = calculateMissionThreatAssessment(mission)
    const availableAgents = available(state.agents)
    const sortedAgents = sortAgentsByExhaustion(availableAgents)

    // Check if we have enough agents to meet threat, but not enough transport cap
    // eslint-disable-next-line no-useless-assignment
    let totalThreat = 0
    // eslint-disable-next-line no-useless-assignment
    let agentsNeeded = 0

    for (const [index] of sortedAgents.entries()) {
      agentsNeeded = index + 1
      totalThreat = calculateTotalAgentThreatAssessment(sortedAgents.slice(0, agentsNeeded))

      if (totalThreat >= missionThreat) {
        // We have enough agents, but do we have enough transport cap?
        if (agentsNeeded > remainingTransportCap) {
          return true
        }
        break
      }
    }
  }

  return false
}
