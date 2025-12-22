import type { Mission, MissionDataId, MissionId } from '../model/missionModel'
import type { EnemyCounts } from '../data_tables/enemiesDataTable'
import { bldEnemies } from './enemyFactory'
import { formatMissionId } from '../model_utils/formatModelUtils'

/**
 * Prototype mission with all default values.
 * Used as a reference for initial mission properties.
 */
export const initialMission: Mission = {
  id: 'mission-ini' as MissionId,
  missionDataId: 'missiondata-ini' as MissionDataId,
  agentIds: [],
  state: 'Active',
  expiresIn: 'never',
  enemies: [],
  operationLevel: undefined,
}

/**
 * Note: passing enemyCounts, instead of enemies, because by design the caller
 * is not responsible for creating the Enemy objects.
 * Instead, the bldMission function will invoke bldEnemies(enemyCounts).
 */
type CreateMissionParams = {
  missionCount: number
  enemyCounts: Partial<EnemyCounts>
} & Partial<Omit<Mission, 'enemies'>>

// KJA1 need to verify that either ID or count is passed, but not both. In all bld functions.
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

  // Build enemies from enemyCounts
  mission.enemies = bldEnemies(enemyCounts)

  return mission
}
