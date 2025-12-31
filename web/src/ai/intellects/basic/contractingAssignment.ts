import type { PlayTurnAPI } from '../../../lib/model_utils/playTurnApiTypes'
import type { GameState } from '../../../lib/model/gameStateModel'
import type { Agent } from '../../../lib/model/agentModel'
import type { AgentId } from '../../../lib/model/modelIds'
import { getAgentUpkeep, getContractingIncome, getMoneyTurnDiff } from '../../../lib/ruleset/moneyRuleset'
import { AGENT_CONTRACTING_INCOME } from '../../../lib/data_tables/constants'
import { MAX_READY_URGENT_EXHAUSTION_PCT, TARGET_UPKEEP_CONTRACTING_COVERAGE_MULTIPLIER } from './constants'
import { selectNextBestReadyAgent } from './agentSelection'
import { estimateAgentContractingIncome, unassignAgentsFromTraining } from './utils'
import { log } from '../../../lib/primitives/logger'

export function assignToContractingWithPriority(api: PlayTurnAPI): void {
  const { gameState } = api
  let projectedIncome = getMoneyTurnDiff(gameState)

  // If projected income is already non-negative, no need to assign agents
  if (projectedIncome >= 0) {
    log.info(
      'agents',
      `projected income ${projectedIncome.toFixed(2)} is non-negative, no assignment needed`,
    )
    return
  }

  const selectedAgents: Agent[] = []

  // Assign agents until projected income becomes non-negative
  while (projectedIncome < 0) {
    const agent = selectNextBestReadyAgent(
      gameState,
      selectedAgents.map((a) => a.id),
      selectedAgents.length,
      {
        includeInTraining: true,
        maxExhaustionPct: MAX_READY_URGENT_EXHAUSTION_PCT,
      },
    )
    if (agent === undefined) {
      // No more agents available to assign
      break
    }

    selectedAgents.push(agent)
    // Estimate income increase from this agent
    const agentIncome = estimateAgentContractingIncome(agent)
    projectedIncome += agentIncome
  }

  if (selectedAgents.length > 0) {
    unassignAgentsFromTraining(api, selectedAgents)
    api.assignAgentsToContracting(selectedAgents.map((a) => a.id))
    const finalProjectedIncome = getMoneyTurnDiff(gameState)
    log.info(
      'agents',
      `assigned ${selectedAgents.length} agents to ensure non-negative income. Projected income: ${finalProjectedIncome.toFixed(2)}`,
    )
  } else {
    log.info(
      'agents',
      `projected income ${projectedIncome.toFixed(2)} is negative but no agents available to assign`,
    )
  }
}

export function assignToContracting(api: PlayTurnAPI): void {
  const { gameState } = api
  const upkeepCosts = getAgentUpkeep(gameState)
  const targetIncome = upkeepCosts * TARGET_UPKEEP_CONTRACTING_COVERAGE_MULTIPLIER
  let currentIncome = getContractingIncome(gameState)
  const incomeGap = targetIncome - currentIncome

  const selectedAgentIds: AgentId[] = []
  // Estimate desired agent count based on average agent income (using base income as approximation)
  const baseAgentIncome = AGENT_CONTRACTING_INCOME
  const desiredAgentCount = incomeGap > 0 ? Math.ceil(incomeGap / baseAgentIncome) : 0

  while (currentIncome < targetIncome) {
    const agent = selectNextBestReadyAgent(gameState, selectedAgentIds, selectedAgentIds.length, {
      includeInTraining: false,
    })
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

  log.info('agents', `desired ${desiredAgentCount} agents, assigned ${selectedAgentIds.length}`)
}

export function assignLeftoverToContracting(api: PlayTurnAPI): void {
  const { gameState } = api
  const selectedAgentIds: AgentId[] = []

  let agent = selectNextBestReadyAgent(gameState, selectedAgentIds, selectedAgentIds.length, {
    includeInTraining: false,
  })
  while (agent !== undefined) {
    selectedAgentIds.push(agent.id)
    agent = selectNextBestReadyAgent(gameState, selectedAgentIds, selectedAgentIds.length, {
      includeInTraining: false,
    })
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

  log.info(
    'agents',
    `assigned ${assignedCount} agents, ${totalAvailable} total Standby/InTraining (${standbyAgents} Standby, ${inTrainingAgents} InTraining)`,
  )
}
