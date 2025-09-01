import type { GameState, MissionSite, MissionSiteId } from '../../model/model'
import { missions } from '../../collections/missions'
import { createEnemiesFromSpec } from '../../utils/enemyUtils'
import { asPlayerAction } from './asPlayerAction'

export const investigateLead = asPlayerAction<{ leadId: string; intelCost: number }>((state: GameState, action) => {
  const { leadId, intelCost } = action.payload

  // Track investigation count for all leads
  const currentCount = state.leadInvestigationCounts[leadId] ?? 0
  state.leadInvestigationCounts[leadId] = currentCount + 1

  // Find missions that depend on this lead and create mission sites for them
  const dependentMissions = missions.filter((mission) => mission.dependsOn.includes(leadId))
  for (const mission of dependentMissions) {
    // Invariant: next mission site numeric id is always the current number of mission sites
    const nextMissionNumericId = state.missionSites.length
    const missionSiteId: MissionSiteId = `mission-site-${nextMissionNumericId.toString().padStart(3, '0')}`
    const newMissionSite: MissionSite = {
      id: missionSiteId,
      missionId: mission.id,
      agentIds: [],
      state: 'Active',
      expiresIn: mission.expiresIn,
      enemies: createEnemiesFromSpec(mission.enemyUnitsSpec), // Create enemies from spec
    }
    state.missionSites.push(newMissionSite)
  }

  state.intel -= intelCost
})
