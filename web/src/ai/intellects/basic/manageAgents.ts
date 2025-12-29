import type { PlayTurnAPI } from '../../../lib/model_utils/playTurnApiTypes'
import type { GameState } from '../../../lib/model/gameStateModel'
import { notTerminated } from '../../../lib/model_utils/agentUtils'
import { toF } from '../../../lib/primitives/fixed6'
import { deployToMissions } from './missionDeployment'
import {
  assignToContractingWithPriority,
  assignToContracting,
  assignLeftoverToContracting,
} from './contractingAssignment'
import { assignToLeadInvestigation } from './leadInvestigation'
import { assignToTraining } from './trainingAssignment'
import { getInBaseAgents } from './utils'

export function manageAgents(api: PlayTurnAPI): void {
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
  const inBaseAgents = getInBaseAgents(gameState)
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
