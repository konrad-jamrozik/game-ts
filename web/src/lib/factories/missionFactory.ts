import type { GameState } from '../model/gameStateModel'
import type { Mission, MissionId, MissionDataId } from '../model/missionModel'
import type { EnemyCounts } from '../data_tables/enemiesDataTable'
import { bldEnemies } from './enemyFactory'

/**
 * Creates a new mission and adds it to the game state.
 * Returns the created mission.
 */
export function bldMission(params: CreateMissionParams): Mission {
  const { state, missionDataId, expiresIn, enemyCounts, operationLevel } = params

  // Invariant: next mission numeric id is always the current number of missions
  const nextMissionNumericId = state.missions.length
  const missionId: MissionId = `mission-${nextMissionNumericId.toString().padStart(3, '0')}`

  const newMission: Mission = {
    id: missionId,
    missionDataId,
    agentIds: [],
    state: 'Active',
    expiresIn,
    enemies: bldEnemies(enemyCounts),
    ...(operationLevel !== undefined && { operationLevel }),
  }

  state.missions.push(newMission)

  return newMission
}

type CreateMissionParams = {
  state: GameState
  missionDataId: MissionDataId
  expiresIn: number | 'never'
  enemyCounts: Partial<EnemyCounts>
  operationLevel?: number
}
