import type { PlayTurnAPI } from '../../../lib/model_utils/playTurnApiTypes'
import type { GameState } from '../../../lib/model/gameStateModel'
import { available } from '../../../lib/model_utils/agentUtils'
import { toF } from '../../../lib/primitives/fixed6'
import { MAX_EXHAUSTION_ALLOWED_ON_ASSIGNMENT, MAX_READY_EXHAUSTION_PCT } from './constants'
import { deployToMissions } from './missionDeployment'
import {
  assignToContractingWithPriority,
  assignToContracting,
  assignLeftoverToContracting,
} from './contractingAssignment'
import { assignToLeadInvestigation } from './leadInvestigation'
import { assignToTraining } from './trainingAssignment'
import { getAssignableAgentsWithStats } from './agentSelection'
import { log } from '../../../lib/primitives/logger'

export function manageAgents(api: PlayTurnAPI): void {
  unassignExhaustedAgents(api)
  let remainingAgents = getAssignableAgentsWithStats(api.gameState)
  remainingAgents = assignToContractingWithPriority(api, remainingAgents)
  remainingAgents = deployToMissions(api, remainingAgents)
  remainingAgents = assignToContracting(api, remainingAgents)
  remainingAgents = assignToLeadInvestigation(api, remainingAgents)
  remainingAgents = assignToTraining(api, remainingAgents)
  assignLeftoverToContracting(api, remainingAgents)
}

// KJA3_2 need to use some util here?
function unassignExhaustedAgents(api: PlayTurnAPI): void {
  const { gameState } = api
  const assignedAgents = gameState.agents.filter(
    (agent) =>
      agent.state === 'Contracting' ||
      agent.state === 'Investigating' ||
      (agent.state === 'InTraining' && agent.assignment === 'Training'),
  )

  const exhaustedAgents = assignedAgents.filter((agent) => {
    const exhaustionPct = toF(agent.exhaustionPct)
    return exhaustionPct > MAX_EXHAUSTION_ALLOWED_ON_ASSIGNMENT
  })

  if (exhaustedAgents.length > 0) {
    api.recallAgents(exhaustedAgents.map((agent) => agent.id))
  }

  logAgentStatistics(gameState)
}

function logAgentStatistics(gameState: GameState): void {
  const standbyAgents = gameState.agents.filter((agent) => agent.assignment === 'Standby')
  const inTrainingAgents = gameState.agents.filter((agent) => agent.assignment === 'Training')
  const availableAgents = available(gameState.agents)
  const readyAgents = availableAgents.filter((agent) => {
    const exhaustionPct = toF(agent.exhaustionPct)
    return exhaustionPct <= MAX_READY_EXHAUSTION_PCT
  })
  const totalAgents = gameState.agents.length
  const readyAgentsPct = totalAgents > 0 ? ((readyAgents.length / totalAgents) * 100).toFixed(1) : '0.0'

  log.info(
    'agents',
    `${standbyAgents.length} standby, ${inTrainingAgents.length} in training, ${readyAgents.length} ready (${readyAgentsPct}% of ${totalAgents} total agents)`,
  )
}
