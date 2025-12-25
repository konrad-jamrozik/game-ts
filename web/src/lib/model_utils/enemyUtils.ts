import { assertDefined } from '../primitives/assertPrimitives'
import { dataTables } from '../data_tables/dataTables'
import type { EnemyType } from '../model/enemyModel'
import type { EnemyData } from '../data_tables/enemiesDataTable'

export function getEnemyByType(type: EnemyType): EnemyData {
  const found = dataTables.enemies.find((enemy) => enemy.name === type)
  assertDefined(found, `Enemy with type ${type} not found`)
  return found
}
