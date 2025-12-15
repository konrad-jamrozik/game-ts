import type { GameState } from '../model/gameStateModel'
import type { MissionSite, MissionSiteId, MissionSiteDefinitionId } from '../model/missionSiteModel'
import type { EnemyCounts } from '../collections/missionStatsTables'
import { bldEnemies } from '../ruleset/enemyRuleset'

type CreateMissionSiteParams = {
  state: GameState
  missionSiteDefinitionId: MissionSiteDefinitionId
  expiresIn: number | 'never'
  enemyCounts: Partial<EnemyCounts>
  operationLevel?: number
}

/**
 * Creates a new mission site and adds it to the game state.
 * Returns the created mission site.
 */
export function bldMissionSite(params: CreateMissionSiteParams): MissionSite {
  const { state, missionSiteDefinitionId, expiresIn, enemyCounts, operationLevel } = params

  // Invariant: next mission site numeric id is always the current number of mission sites
  const nextMissionNumericId = state.missionSites.length
  const missionSiteId: MissionSiteId = `mission-site-${nextMissionNumericId.toString().padStart(3, '0')}`

  const newMissionSite: MissionSite = {
    id: missionSiteId,
    missionSiteDefinitionId,
    agentIds: [],
    state: 'Active',
    expiresIn,
    enemies: bldEnemies(enemyCounts),
    ...(operationLevel !== undefined && { operationLevel }),
  }

  state.missionSites.push(newMissionSite)

  return newMissionSite
}
