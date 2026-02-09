import type { UpgradeName } from '../../../lib/data_tables/upgrades'

export type BuyPriority = UpgradeName | 'newAgent'

export type SelectNextBestReadyAgentsOptions = {
  includeInTraining?: boolean
  keepReserve?: boolean
  maxExhaustionPct?: number
}
