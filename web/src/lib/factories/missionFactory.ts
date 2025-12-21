import type { Mission, MissionId, MissionDataId } from '../model/missionModel'
import type { EnemyCounts } from '../data_tables/enemiesDataTable'
import { bldEnemies } from './enemyFactory'

/**
 * Creates a new mission object.
 * Returns the created mission. The caller is responsible for adding it to state.
 */
export function bldMission(params: CreateMissionParams): Mission {
  const { missionCount, missionDataId, expiresIn, enemyCounts, operationLevel } = params

  // Invariant: next mission numeric id is always the current number of missions
  const missionId: MissionId = `mission-${missionCount.toString().padStart(3, '0')}`

  const newMission: Mission = {
    id: missionId,
    missionDataId,
    agentIds: [],
    state: 'Active',
    expiresIn,
    enemies: bldEnemies(enemyCounts),
    ...(operationLevel !== undefined && { operationLevel }),
  }

  return newMission
}

type CreateMissionParams = {
  missionCount: number
  missionDataId: MissionDataId
  expiresIn: number | 'never'
  enemyCounts: Partial<EnemyCounts>
  operationLevel?: number
}
