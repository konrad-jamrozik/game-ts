import type { PlayTurnAPI } from '../../../lib/model_utils/playTurnApiTypes'
import type { AgentId } from '../../../lib/model/modelIds'
import { onTrainingAssignment } from '../../../lib/model_utils/agentUtils'
import { selectNextBestReadyAgents } from './agentSelection'
import { log } from '../../../lib/primitives/logger'

export function assignToTraining(api: PlayTurnAPI): void {
  const { gameState } = api
  const agentsInTraining = onTrainingAssignment(gameState.agents)
  const availableTrainingSlots = gameState.trainingCap - agentsInTraining.length

  const selectedAgentIds: AgentId[] = []

  for (let i = 0; i < availableTrainingSlots; i += 1) {
    const agents = selectNextBestReadyAgents(gameState, 1, selectedAgentIds, selectedAgentIds.length, {
      includeInTraining: false,
    })
    const agent = agents[0]
    if (agent === undefined) {
      break
    }

    selectedAgentIds.push(agent.id)
  }

  if (selectedAgentIds.length > 0) {
    api.assignAgentsToTraining(selectedAgentIds)
  }

  log.info('agents', `desired ${availableTrainingSlots} agents, assigned ${selectedAgentIds.length}`)
}
