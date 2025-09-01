import type { GameState, MissionSiteId } from '../../model/model'
import asPlayerAction from '../asPlayerAction'

export const deployAgentsToMission = asPlayerAction<{ missionSiteId: MissionSiteId; agentIds: string[] }>(
  (state: GameState, action) => {
    const { missionSiteId, agentIds } = action.payload

    // Find the mission site and update it
    const missionSite = state.missionSites.find((site) => site.id === missionSiteId)
    if (missionSite) {
      missionSite.agentIds = [...agentIds]
      missionSite.state = 'Deployed'

      // Assign agents to the mission site
      for (const agent of state.agents) {
        if (agentIds.includes(agent.id)) {
          agent.assignment = missionSiteId
          agent.state = 'OnMission'
        }
      }
    }
  },
)
