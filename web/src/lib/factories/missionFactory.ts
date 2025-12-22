import type { Mission, MissionDataId, MissionId } from '../model/missionModel'
import type { EnemyCounts } from '../model/enemyModel'
import { bldEnemies } from './enemyFactory'
import { formatMissionId } from '../model_utils/formatModelUtils'
import { assertDefined } from '../primitives/assertPrimitives'
import { getMissionDataById } from '../data_tables/dataTables'

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
 * Note: enemyCounts are normally taken from mission data, deduced from missionDataId.
 * However, enemyCounts can be optionally provided (primarily for testing purposes).
 * The caller is not responsible for creating the Enemy objects.
 * Instead, the bldMission function will look up mission data and invoke bldEnemies(enemyCounts).
 */
type CreateMissionParams =
  | (BaseCreateMissionParams & { missionCount: number; id?: never })
  | (BaseCreateMissionParams & { id: Mission['id']; missionCount?: never })

type BaseCreateMissionParams = {
  missionDataId: Mission['missionDataId']
  enemyCounts?: Partial<EnemyCounts>
} & Partial<Omit<Mission, 'enemies' | 'id' | 'missionDataId'>>

/**
 * Creates a new mission object.
 * Returns the created mission. The caller is responsible for adding it to state.
 * Enemy counts are automatically retrieved from mission data based on missionDataId,
 * unless explicitly provided (primarily for testing purposes).
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
    assertDefined(missionCount, 'Mission count must be provided if ID is not provided')
    mission.id = formatMissionId(missionCount)
  }

  // Use provided enemyCounts if available (for tests), otherwise look up from mission data
  const finalEnemyCounts = enemyCounts ?? getMissionDataById(mission.missionDataId).enemyCounts
  mission.enemies = bldEnemies(finalEnemyCounts)

  return mission
}
