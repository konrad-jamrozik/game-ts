import type { GameState } from '../model/gameStateModel'
import type { MissionSite, MissionSiteId } from '../model/model'
import { newEnemiesFromSpec } from '../ruleset/enemyRuleset'

type CreateMissionSiteParams = {
  state: GameState
  missionId: string
  expiresIn: number | 'never'
  enemyUnitsSpec: string
  operationLevel?: number
}

/**
 * Creates a new mission site and adds it to the game state.
 * Returns the created mission site.
 */
export function createMissionSite(params: CreateMissionSiteParams): MissionSite {
  const { state, missionId, expiresIn, enemyUnitsSpec, operationLevel } = params

  // Invariant: next mission site numeric id is always the current number of mission sites
  const nextMissionNumericId = state.missionSites.length
  const missionSiteId: MissionSiteId = `mission-site-${nextMissionNumericId.toString().padStart(3, '0')}`

  const newMissionSite: MissionSite = {
    id: missionSiteId,
    missionId,
    agentIds: [],
    state: 'Active',
    expiresIn,
    enemies: newEnemiesFromSpec(enemyUnitsSpec),
    ...(operationLevel !== undefined && { operationLevel }),
  }

  state.missionSites.push(newMissionSite)

  return newMissionSite
}
