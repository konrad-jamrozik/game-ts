import type { Fixed6 } from '../primitives/fixed6Primitives'
import type { TurnReport } from './turnReportModel'

export type Actor = {
  id: string
  skill: Fixed6
  hitPoints: number
  maxHitPoints: number
  exhaustion: number
  weapon: Weapon
}

export type AgentState =
  | 'Available'
  | 'StartingTransit'
  | 'InTransit'
  | 'Recovering'
  | 'OnAssignment'
  | 'OnMission'
  | 'InTraining'
  | 'Terminated'

// Assignment types for agents
export type ActivityId = 'Contracting' | 'Espionage' | 'Training'
export type MissionSiteId = `mission-site-${string}`
export type LeadInvestigationId = `investigation-${string}`
export type AgentAssignmentState = 'Standby' | 'Recovery' | 'Sacked' | 'KIA'
export type AgentAssignment = ActivityId | MissionSiteId | LeadInvestigationId | AgentAssignmentState

// Type guard functions for agent assignments
export function isActivityAssignment(assignment: AgentAssignment): assignment is ActivityId {
  return assignment === 'Contracting' || assignment === 'Espionage' || assignment === 'Training'
}

export function isMissionSiteAssignment(assignment: AgentAssignment): assignment is MissionSiteId {
  return typeof assignment === 'string' && assignment.startsWith('mission-site-')
}

export function isLeadInvestigationAssignment(assignment: AgentAssignment): assignment is LeadInvestigationId {
  return typeof assignment === 'string' && assignment.startsWith('investigation-')
}

export function isAssignmentState(assignment: AgentAssignment): assignment is AgentAssignmentState {
  return assignment === 'Standby' || assignment === 'Recovery' || assignment === 'Sacked' || assignment === 'KIA'
}

export type Weapon = {
  damage: number
  minDamage: number
  maxDamage: number
}

export type Agent = Actor & {
  turnHired: number
  turnTerminated?: number
  terminatedOnMissionSiteId?: MissionSiteId
  terminatedBy?: string
  recoveryTurns: number
  hitPointsLostBeforeRecovery: number
  missionsTotal: number
  skillFromTraining: Fixed6
  state: AgentState
  assignment: AgentAssignment
}

export type Lead = {
  id: string
  title: string
  difficulty: number
  description: string
  dependsOn: string[]
  repeatable: boolean
  enemyEstimate?: string // For observability, e.g., "Expect safehouse to have a dozen low-ranked cult members"
}

export type FactionId = 'faction-red-dawn' | 'faction-black-lotus' | 'faction-exalt' | 'faction-followers-of-dagon'

export type FactionRewards = {
  factionId: FactionId
  threatReduction?: Fixed6
  suppression?: Fixed6
}

export type MissionRewards = {
  money?: number
  intel?: number
  funding?: number
  panicReduction?: Fixed6
  factionRewards?: FactionRewards[]
}

export const ENEMY_TYPES = [
  'Initiate',
  'Operative',
  'Handler',
  'Soldier',
  'Lieutenant',
  'Elite',
  'Commander',
  'HighCommander',
] as const

export type EnemyType = (typeof ENEMY_TYPES)[number]

export type Enemy = Actor & {
  type: EnemyType
  isOfficer: boolean
}

export type Mission = {
  id: string
  title: string
  description: string
  expiresIn: number | 'never'
  dependsOn: string[]
  enemyUnitsSpec: string
  rewards: MissionRewards
}

export type MissionSiteState = 'Active' | 'Deployed' | 'Successful' | 'Failed' | 'Expired'

export type MissionSite = {
  id: MissionSiteId
  missionId: string
  agentIds: string[]
  state: MissionSiteState
  expiresIn: number | 'never'
  enemies: Enemy[] // Enemies present at the mission site
}

export type Faction = {
  id: FactionId
  name: string
  threatLevel: Fixed6
  threatIncrease: Fixed6
  suppression: Fixed6
  discoveryPrerequisite: string[]
}

export type LeadInvestigationState = 'Active' | 'Abandoned' | 'Successful'

export type LeadInvestigation = {
  id: LeadInvestigationId // unique investigation ID
  leadId: string
  accumulatedIntel: number
  agentIds: string[] // agents currently investigating this lead
  startTurn: number // turn when investigation started
  state: LeadInvestigationState
}

export type GameState = {
  // Session
  turn: number
  actionsCount: number
  // Situation
  panic: Fixed6
  factions: Faction[]
  // Assets
  money: number
  intel: number // global intel (unused for leads, kept for backward compatibility)
  funding: number
  agents: Agent[]
  agentCap: number
  transportCap: number
  trainingCap: number
  trainingSkillGain: Fixed6
  exhaustionRecovery: number
  hitPointsRecoveryPct: number
  // Liabilities // KJA3 to remove, should be unused
  currentTurnTotalHireCost: number
  // Archive
  leadInvestigationCounts: Record<string, number>
  leadInvestigations: Record<string, LeadInvestigation> // track ongoing investigations
  missionSites: MissionSite[]
  // TurnReport of turn advancement from previous to current turn.
  turnStartReport?: TurnReport | undefined
}
