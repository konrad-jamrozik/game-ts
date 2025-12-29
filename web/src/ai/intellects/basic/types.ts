import type { UpgradeName } from '../../../lib/data_tables/upgrades'

export type UpgradeNameOrNewAgent = UpgradeName | 'newAgent'

export type SelectNextBestReadyAgentOptions = {
  includeInTraining?: boolean
  keepReserve?: boolean
  maxExhaustionPct?: number
}

export const REQUIRED_TURNS_OF_SAVINGS = 5

export const REQUIRED_AGENTS_PER_ENEMY = 5

export const TARGET_AGENT_THREAT_MULTIPLIER = 1.2

export const TARGET_UPKEEP_CONTRACTING_COVERAGE_MULTIPLIER = 1.2

export const MAX_READY_EXHAUSTION_PCT = 5

export const MAX_READY_URGENT_EXHAUSTION_PCT = 25

export const MAX_EXHAUSTION_ALLOWED_ON_ASSIGNMENT = 30

export const AGENT_RESERVE_PCT = 0.2
