import type { GameState } from '../../lib/model/gameStateModel'
import type { MissionId } from '../../lib/model/missionModel'
import { asPlayerAction } from '../reducer_utils/asPlayerAction'

export const deployAgentsToMission = asPlayerAction<{ missionId: MissionId; agentIds: string[] }>(
  (state: GameState, action) => {
    const { missionId, agentIds } = action.payload

    // Find the mission and update it
    const mission = state.missions.find((m) => m.id === missionId)
    if (mission) {
      mission.agentIds = [...agentIds]
      mission.state = 'Deployed'

      // Assign agents to the mission
      for (const agent of state.agents) {
        if (agentIds.includes(agent.id)) {
          agent.assignment = missionId
          agent.state = 'OnMission'
          // Increment missionsTotal when agent is deployed to a mission
          agent.missionsTotal += 1
        }
      }
    }
  },
)
