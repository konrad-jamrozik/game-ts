import type { PlayTurnAPI } from '../../../lib/model_utils/playTurnApiTypes'
import type { GameState } from '../../../lib/model/gameStateModel'
import { getAgentUpkeep, getContractingIncome, getMoneyTurnDiff } from '../../../lib/ruleset/moneyRuleset'
import { AGENT_CONTRACTING_INCOME } from '../../../lib/data_tables/constants'
import { MAX_READY_URGENT_EXHAUSTION_PCT, TARGET_UPKEEP_CONTRACTING_COVERAGE_MULTIPLIER } from './constants'
import { removeAgentsById, selectNextBestReadyAgents, type AgentWithStats } from './agentSelection'
import { unassignAgentsFromTraining } from './utils'
import { log } from '../../../lib/primitives/logger'

export function assignToContractingWithPriority(api: PlayTurnAPI, agents: AgentWithStats[]): AgentWithStats[] {
  const { gameState } = api
  let projectedIncome = getMoneyTurnDiff(gameState)

  // If projected income is already non-negative, no need to assign agents
  if (projectedIncome >= 0) {
    log.info('agents', `projected income ${projectedIncome.toFixed(2)} is non-negative, no assignment needed`)
    return agents
  }

  const selectedAgents: AgentWithStats[] = []

  // Assign agents until projected income becomes non-negative
  while (projectedIncome < 0) {
    const nextAgents = selectNextBestReadyAgents(
      agents,
      1,
      selectedAgents.map((agent) => agent.id),
      selectedAgents.length,
      gameState.agents.length,
      {
        includeInTraining: true,
        maxExhaustionPct: MAX_READY_URGENT_EXHAUSTION_PCT,
      },
    )
    const selectedAgent = nextAgents[0]
    if (selectedAgent === undefined) {
      // No more agents available to assign
      break
    }

    selectedAgents.push(selectedAgent)
    // Estimate income increase from this agent
    projectedIncome += selectedAgent.contractingIncome
  }

  if (selectedAgents.length > 0) {
    unassignAgentsFromTraining(api, selectedAgents)
    api.assignAgentsToContracting(selectedAgents.map((agent) => agent.id))
    const finalProjectedIncome = getMoneyTurnDiff(gameState)
    log.info(
      'agents',
      `assigned ${selectedAgents.length} agents to ensure non-negative income. Projected income: ${finalProjectedIncome.toFixed(2)}`,
    )
  } else {
    log.info('agents', `projected income ${projectedIncome.toFixed(2)} is negative but no agents available to assign`)
  }

  return removeAgentsById(
    agents,
    selectedAgents.map((agent) => agent.id),
  )
}

export function assignToContracting(api: PlayTurnAPI, agents: AgentWithStats[]): AgentWithStats[] {
  const { gameState } = api
  const upkeepCosts = getAgentUpkeep(gameState)
  const targetIncome = upkeepCosts * TARGET_UPKEEP_CONTRACTING_COVERAGE_MULTIPLIER
  let currentIncome = getContractingIncome(gameState)
  const incomeGap = targetIncome - currentIncome

  const selectedAgents: AgentWithStats[] = []
  // Estimate desired agent count based on average agent income (using base income as approximation)
  const baseAgentIncome = AGENT_CONTRACTING_INCOME
  const desiredAgentCount = incomeGap > 0 ? Math.ceil(incomeGap / baseAgentIncome) : 0

  while (currentIncome < targetIncome) {
    const nextAgents = selectNextBestReadyAgents(
      agents,
      1,
      selectedAgents.map((agent) => agent.id),
      selectedAgents.length,
      gameState.agents.length,
      {
        includeInTraining: false,
      },
    )
    const selectedAgent = nextAgents[0]
    if (selectedAgent === undefined) {
      break
    }

    selectedAgents.push(selectedAgent)
    currentIncome += selectedAgent.contractingIncome
  }

  if (selectedAgents.length > 0) {
    api.assignAgentsToContracting(selectedAgents.map((agent) => agent.id))
  }

  log.info('agents', `desired ${desiredAgentCount} agents, assigned ${selectedAgents.length}`)

  return removeAgentsById(
    agents,
    selectedAgents.map((agent) => agent.id),
  )
}

export function assignLeftoverToContracting(api: PlayTurnAPI, agents: AgentWithStats[]): AgentWithStats[] {
  const { gameState } = api

  const selectedAgents = selectNextBestReadyAgents(agents, Number.MAX_SAFE_INTEGER, [], 0, gameState.agents.length, {
    includeInTraining: false,
  })
  const selectedAgentIds = selectedAgents.map((agent) => agent.id)

  if (selectedAgentIds.length > 0) {
    api.assignAgentsToContracting(selectedAgentIds)
  }

  logLeftoverContractingStatistics(gameState, selectedAgentIds.length)

  return removeAgentsById(agents, selectedAgentIds)
}

function logLeftoverContractingStatistics(gameState: GameState, assignedCount: number): void {
  const standbyAgents = gameState.agents.filter((a) => a.assignment === 'Standby').length
  const inTrainingAgents = gameState.agents.filter((a) => a.assignment === 'Training').length
  const totalAvailable = standbyAgents + inTrainingAgents

  log.info(
    'agents',
    `assigned ${assignedCount} agents, ${totalAvailable} total Standby/InTraining (${standbyAgents} Standby, ${inTrainingAgents} InTraining)`,
  )
}
