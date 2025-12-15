import type { GameState } from '../model/gameStateModel'
import type { MissionSite, MissionSiteId } from '../model/missionSiteModel'
import type { EnemyCounts } from '../collections/missionStatsTables'
import { bldEnemies } from '../ruleset/enemyRuleset'

type CreateMissionSiteParams = {
  state: GameState
  missionId: string
  expiresIn: number | 'never'
  enemyList: Partial<EnemyCounts> // KJA rename to enemyCounts
  operationLevel?: number
}

/**
 * Creates a new mission site and adds it to the game state.
 * Returns the created mission site.
 */
export function bldMissionSite(params: CreateMissionSiteParams): MissionSite {
  const { state, missionId, expiresIn, enemyList, operationLevel } = params

  // Invariant: next mission site numeric id is always the current number of mission sites
  const nextMissionNumericId = state.missionSites.length
  const missionSiteId: MissionSiteId = `mission-site-${nextMissionNumericId.toString().padStart(3, '0')}`

  const newMissionSite: MissionSite = {
    id: missionSiteId,
    missionId,
    agentIds: [],
    state: 'Active',
    expiresIn,
    enemies: bldEnemies(enemyList),
    ...(operationLevel !== undefined && { operationLevel }),
  }

  state.missionSites.push(newMissionSite)

  return newMissionSite
}
