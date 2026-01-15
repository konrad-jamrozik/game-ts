import type { PlayTurnAPI } from '../../../lib/model_utils/playTurnApiTypes'
import { onTrainingAssignment } from '../../../lib/model_utils/agentUtils'
import { removeAgentsById, selectNextBestReadyAgents, type AgentWithStats } from './agentSelection'
import { log } from '../../../lib/primitives/logger'

export function assignToTraining(api: PlayTurnAPI, agents: AgentWithStats[]): AgentWithStats[] {
  const { gameState } = api
  const agentsInTraining = onTrainingAssignment(gameState.agents)
  const availableTrainingSlots = gameState.trainingCap - agentsInTraining.length

  const selectedAgents = selectNextBestReadyAgents(agents, availableTrainingSlots, [], 0, gameState.agents.length, {
    includeInTraining: false,
  })
  const selectedAgentIds = selectedAgents.map((agent) => agent.id)

  if (selectedAgentIds.length > 0) {
    api.assignAgentsToTraining(selectedAgentIds)
  }

  log.info('agents', `desired ${availableTrainingSlots} agents, assigned ${selectedAgentIds.length}`)

  return removeAgentsById(agents, selectedAgentIds)
}
