import type { PlayTurnAPI } from '../../../lib/model_utils/playTurnApiTypes'
import type { AgentId } from '../../../lib/model/modelIds'
import { onTrainingAssignment } from '../../../lib/model_utils/agentUtils'
import { selectNextBestReadyAgent } from './agentSelection'

export function assignToTraining(api: PlayTurnAPI): void {
  const { gameState } = api
  const agentsInTraining = onTrainingAssignment(gameState.agents)
  const availableTrainingSlots = gameState.trainingCap - agentsInTraining.length

  const selectedAgentIds: AgentId[] = []

  for (let i = 0; i < availableTrainingSlots; i += 1) {
    const agent = selectNextBestReadyAgent(gameState, selectedAgentIds, selectedAgentIds.length, {
      includeInTraining: false,
    })
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
