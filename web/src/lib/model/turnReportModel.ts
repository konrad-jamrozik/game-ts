import { isF6, type Fixed6, f6sub } from '../primitives/fixed6'
import type { MissionRewards } from './model'
import type { AttackOutcome, BattleOutcome, BattleStatus } from './outcomeTypes'

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
  agentsReport: AgentsReport
  moneyBreakdown: MoneyBreakdown
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
      delta: f6sub(current, previous),
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
  /**
   * Panic increases from faction operations that succeeded (expired mission sites)
   */
  factionOperationPenalties: {
    factionId: string
    factionName: string
    operationLevel: number
    panicIncrease: number
  }[]
  /**
   * Panic reductions from completed missions
   */
  missionReductions: {
    missionSiteId: string
    missionTitle: string
    reduction: Fixed6
  }[]
}

export type FactionReport = {
  factionId: string
  factionName: string
  isDiscovered: boolean
  /**
   * Activity level change (0-7)
   */
  activityLevel: ValueChange
  /**
   * Turns spent at current activity level
   */
  turnsAtCurrentLevel: ValueChange
  /**
   * Turns until next faction operation
   */
  turnsUntilNextOperation: ValueChange
  /**
   * Suppression turns remaining
   */
  suppressionTurns: ValueChange
  /**
   * Mission impacts on this faction
   */
  missionImpacts: {
    missionSiteId: string
    missionTitle: string
    suppressionAdded?: number
  }[]
  /**
   * If a faction operation occurred this turn
   */
  operationOccurred?: {
    operationLevel: number
    missionSiteId: string
  }
  /**
   * If activity level increased this turn
   */
  activityLevelIncreased?: boolean
}

export type MissionReport = {
  missionSiteId: string
  missionTitle: string
  faction: string
  outcome: BattleOutcome
  rounds: number
  rewards?: MissionRewards
  battleStats: BattleStats
}

export type RoundLog = {
  roundNumber: number
  status: BattleStatus
  agentCount: number
  agentCountTotal: number
  agentSkill: Fixed6
  agentSkillTotal: Fixed6
  agentHp: number
  agentHpTotal: number
  enemyCount: number
  enemyCountTotal: number
  enemySkill: Fixed6
  enemySkillTotal: Fixed6
  enemyHp: number
  enemyHpTotal: number
  skillRatio: Fixed6
}

export type AttackLog = {
  roundNumber: number
  agentId: string
  enemyId: string
  attackerType: 'Agent' | 'Enemy'
  attackerSkill: Fixed6
  attackerSkillAtStart: Fixed6
  defenderSkill: Fixed6
  defenderSkillAtStart: Fixed6
  defenderSkillAfterAttack: Fixed6
  roll: number
  threshold: number
  outcome: AttackOutcome
  damage: number | undefined
  baseDamage: number
  damageMin: number
  damageMax: number
  defenderHpAfterDamage: number
  defenderHpMax: number
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
  roundLogs: RoundLog[]
  attackLogs: AttackLog[]
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
  factionId: string
  factionName: string
  /**
   * The operation level that spawned this mission site.
   * Used to calculate panic/funding penalties when mission expires.
   */
  operationLevel?: number
  /**
   * Panic increase penalty from this expired mission
   */
  panicPenalty?: number
  /**
   * Funding decrease penalty from this expired mission
   */
  fundingPenalty?: number
}
