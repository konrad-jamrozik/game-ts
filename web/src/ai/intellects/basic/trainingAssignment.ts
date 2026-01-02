import type { PlayTurnAPI } from '../../../lib/model_utils/playTurnApiTypes'
import { onTrainingAssignment } from '../../../lib/model_utils/agentUtils'
import { selectNextBestReadyAgents } from './agentSelection'
import { log } from '../../../lib/primitives/logger'

export function assignToTraining(api: PlayTurnAPI): void {
  const { gameState } = api
  const agentsInTraining = onTrainingAssignment(gameState.agents)
  const availableTrainingSlots = gameState.trainingCap - agentsInTraining.length

  const agents = selectNextBestReadyAgents(gameState, availableTrainingSlots, [], 0, {
    includeInTraining: false,
  })
  const selectedAgentIds = agents.map((a) => a.id)

  if (selectedAgentIds.length > 0) {
    api.assignAgentsToTraining(selectedAgentIds)
  }

  log.info('agents', `desired ${availableTrainingSlots} agents, assigned ${selectedAgentIds.length}`)
}
