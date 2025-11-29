import { toF6, asFloat, isF6, type Fixed6 } from './fixed6'
import type { MissionRewards } from './model'

export type TurnReport = BaseReport & {
  assets: AssetsReport
  panic: PanicReport
  factions: FactionReport[]
  missions: MissionReport[]
  leadInvestigations?: LeadInvestigationReport[]
  expiredMissionSites: ExpiredMissionSiteReport[]
}

export type BaseReport = {
  timestamp: number
  turn: number
}

export type AssetsReport = {
  moneyChange: ValueChange
  intelChange: ValueChange
  agentsReport: AgentsReport
  moneyBreakdown: MoneyBreakdown
  intelBreakdown: IntelBreakdown
}

export type ValueChange<TNumber extends number | Fixed6 = number> = {
  previous: TNumber
  current: TNumber
  readonly delta: TNumber
}

// --- Overloads ---
export function newValueChange(previous: Fixed6, current: Fixed6): ValueChange<Fixed6>
export function newValueChange(previous: number, current: number): ValueChange

// --- Implementation ---
export function newValueChange(previous: Fixed6 | number, current: Fixed6 | number): ValueChange<Fixed6> | ValueChange {
  if (isF6(previous) && isF6(current)) {
    return {
      previous,
      current,
      delta: toF6(asFloat(current) - asFloat(previous)),
    }
  }

  if (typeof previous === 'number' && typeof current === 'number') {
    return {
      previous,
      current,
      delta: current - previous,
    }
  }

  // Exhaustive guard: disallow mixing number with Fixed6
  throw new TypeError('newValueChange: mixed types (number vs Fixed6) are not allowed.')
}

export type MoneyBreakdown = {
  agentUpkeep: number
  contractingEarnings: number
  fundingIncome: number
  missionRewards: number
}

export type IntelBreakdown = {
  espionageGathered: number
  missionRewards: number
}

export type AgentsReport = {
  total: ValueChange
  available: ValueChange
  inTransit: ValueChange
  standby: ValueChange
  recovering: ValueChange
  wounded: ValueChange
  unscathed: ValueChange
  terminated: ValueChange
  terminatedAgentIds: string[] // IDs of agents terminated during this turn advancement
}

export type PanicReport = {
  change: ValueChange<Fixed6>
  breakdown: PanicBreakdown
}

export type PanicBreakdown = {
  factionPanicIncreases: {
    factionId: string
    factionName: string
    factionPanicIncrease: Fixed6
  }[]
  missionReductions: {
    missionSiteId: string
    missionTitle: string
    reduction: Fixed6
  }[]
}

// export type Faction = {
//   id: FactionId
//   name: string
//   threatLevel: number
//   threatIncrease: number
//   suppression: number
//   discoveryPrerequisite: string[]
// }

export type FactionReport = {
  factionId: string
  factionName: string
  isDiscovered: boolean
  threatLevel: ValueChange<Fixed6>
  threatIncrease: ValueChange<Fixed6>
  suppression: ValueChange<Fixed6>
  baseThreatIncrease: Fixed6
  missionImpacts: {
    missionSiteId: string
    missionTitle: string
    threatReduction?: Fixed6
    suppressionAdded?: Fixed6
  }[]
  suppressionDecay: Fixed6
}

export type MissionReport = {
  missionSiteId: string
  missionTitle: string
  faction: string
  outcome: 'Successful' | 'Retreated' | 'All agents lost'
  rounds: number
  rewards?: MissionRewards
  battleStats: BattleStats
}

export type BattleStats = {
  agentsDeployed: number
  agentsUnscathed: number
  agentsWounded: number
  agentsTerminated: number
  enemiesTotal: number
  enemiesUnscathed: number
  enemiesWounded: number
  enemiesTerminated: number
  totalAgentSkillAtBattleStart: Fixed6
  totalEnemySkillAtBattleStart: Fixed6
  initialAgentHitPoints: number
  initialEnemyHitPoints: number
  totalDamageInflicted: number
  totalDamageTaken: number
  totalAgentSkillGain: Fixed6
  averageAgentExhaustionGain: number
}

export type LeadInvestigationReport = {
  investigationId: string
  leadId: string
  completed: boolean
  accumulatedIntel: number
  successChance: number
  intelDecay?: number
  createdMissionSites?: string[]
}

export type ExpiredMissionSiteReport = {
  missionSiteId: string
  missionTitle: string
}
