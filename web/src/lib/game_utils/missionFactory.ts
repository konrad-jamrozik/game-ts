import type { GameState } from '../model/gameStateModel'
import type { Mission, MissionId, MissionDefId } from '../model/missionModel'
import type { EnemyCounts } from '../collections/enemyStatsTables'
import { bldEnemies } from '../ruleset/enemyRuleset'

type CreateMissionParams = {
  state: GameState
  missionDefId: MissionDefId
  expiresIn: number | 'never'
  enemyCounts: Partial<EnemyCounts>
  operationLevel?: number
}

/**
 * Creates a new mission and adds it to the game state.
 * Returns the created mission.
 */
export function bldMission(params: CreateMissionParams): Mission {
  const { state, missionDefId, expiresIn, enemyCounts, operationLevel } = params

  // Invariant: next mission numeric id is always the current number of missions
  const nextMissionNumericId = state.missions.length
  const missionId: MissionId = `mission-${nextMissionNumericId.toString().padStart(3, '0')}`

  const newMission: Mission = {
    id: missionId,
    missionDefId,
    agentIds: [],
    state: 'Active',
    expiresIn,
    enemies: bldEnemies(enemyCounts),
    ...(operationLevel !== undefined && { operationLevel }),
  }

  state.missions.push(newMission)

  return newMission
}
