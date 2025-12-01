import type { GameState } from '../../model/gameStateModel'
import type { MissionSite, MissionSiteId } from '../../model/model'
import { missions } from '../../collections/missions'
import { newEnemiesFromSpec } from '../../ruleset/enemyRuleset'
import { asPlayerAction } from './asPlayerAction'

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
          // Increment missionsTotal when agent is deployed to a mission
          agent.missionsTotal += 1
        }
      }
    }
  },
)

export const debugSpawnMissionSites = asPlayerAction((state: GameState) => {
  for (const mission of missions) {
    // Invariant: next mission site numeric id is always the current number of mission sites
    const nextMissionNumericId = state.missionSites.length
    const missionSiteId: MissionSiteId = `mission-site-${nextMissionNumericId.toString().padStart(3, '0')}`
    const newMissionSite: MissionSite = {
      id: missionSiteId,
      missionId: mission.id,
      agentIds: [],
      state: 'Active',
      expiresIn: mission.expiresIn,
      enemies: newEnemiesFromSpec(mission.enemyUnitsSpec),
    }
    state.missionSites.push(newMissionSite)
  }
})
