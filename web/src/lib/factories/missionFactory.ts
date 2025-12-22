import type { Mission, MissionId } from '../model/missionModel'
import type { EnemyCounts } from '../data_tables/enemiesDataTable'
import { bldEnemies } from './enemyFactory'
import { formatMissionId } from '../model_utils/formatModelUtils'

/**
 * Prototype mission with all default values.
 * Used as a reference for initial mission properties.
 */
export const initialMission: Mission = {
  id: 'mission-ini' as MissionId,
  missionDataId: 'missiondata-ini' as Mission['missionDataId'],
  agentIds: [],
  state: 'Active',
  expiresIn: 'never',
  enemies: [],
  operationLevel: undefined,
}

// KJA1 why enemyCounts needed? Why omit id?
type CreateMissionParams = {
  missionCount: number
  enemyCounts?: Partial<EnemyCounts>
} & Partial<Omit<Mission, 'id' | 'enemies'>>

/**
 * Creates a new mission object.
 * Returns the created mission. The caller is responsible for adding it to state.
 */
export function bldMission(params: CreateMissionParams): Mission {
  const { missionCount, enemyCounts, ...missionOverrides } = params

  // Start with initialMission and override with provided values
  const mission: Mission = {
    ...initialMission,
    ...missionOverrides,
  }

  // Generate ID if not provided
  if (mission.id === initialMission.id) {
    mission.id = formatMissionId(missionCount)
  }

  // Build enemies from enemyCounts if provided, otherwise use enemies from overrides (or default empty array)
  if (enemyCounts !== undefined && !('enemies' in missionOverrides)) {
    mission.enemies = bldEnemies(enemyCounts)
  }

  return mission
}
