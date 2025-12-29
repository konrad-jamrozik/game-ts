import type { UpgradeName } from '../../../lib/data_tables/upgrades'

export type UpgradeNameOrNewAgent = UpgradeName | 'newAgent'

export type SelectNextBestReadyAgentOptions = {
  includeInTraining?: boolean
  keepReserve?: boolean
}

export type SelectNextAgentForPriorityContractingOptions = {
  includeInTraining?: boolean
}

export const REQUIRED_TURNS_OF_SAVINGS = 5
