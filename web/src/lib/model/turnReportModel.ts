import { bps, isBps, type Bps } from './bps'
import type { Fixed2 } from './fixed2'
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

export type ValueChange<TNumber extends number | Bps = number> = {
  previous: TNumber
  current: TNumber
  readonly delta: TNumber
}

// --- Overloads ---
export function newValueChange(previous: Bps, current: Bps): ValueChange<Bps>
export function newValueChange(previous: number, current: number): ValueChange

// --- Implementation ---
export function newValueChange(previous: Bps | number, current: Bps | number): ValueChange<Bps> | ValueChange {
  if (isBps(previous) && isBps(current)) {
    return {
      previous,
      current,
      delta: bps(current.value - previous.value),
    }
  }

  if (typeof previous === 'number' && typeof current === 'number') {
    return {
      previous,
      current,
      delta: current - previous,
    }
  }

  // Exhaustive guard: disallow mixing number with Bps
  throw new TypeError('newValueChange: mixed types (number vs Bps) are not allowed.')
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
  change: ValueChange<Bps>
  breakdown: PanicBreakdown
}

export type PanicBreakdown = {
  factionPanicIncreases: {
    factionId: string
    factionName: string
    factionPanicIncrease: Bps
  }[]
  missionReductions: {
    missionSiteId: string
    missionTitle: string
    reduction: Bps
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
  threatLevel: ValueChange<Bps>
  threatIncrease: ValueChange<Bps>
  suppression: ValueChange<Bps>
  baseThreatIncrease: Bps
  missionImpacts: {
    missionSiteId: string
    missionTitle: string
    threatReduction?: Bps
    suppressionAdded?: Bps
  }[]
  suppressionDecay: Bps
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
  totalAgentSkillAtBattleStart: number
  totalEnemySkillAtBattleStart: number
  initialAgentHitPoints: number
  initialEnemyHitPoints: number
  totalDamageInflicted: number
  totalDamageTaken: number
  totalAgentSkillGain: Fixed2
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
