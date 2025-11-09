import type { Bps } from './bps'
import type { TurnReport } from './reportModel'

export type Actor = {
  id: string
  skill: number
  hitPoints: number
  maxHitPoints: number
  exhaustion: number
  weapon: Weapon
}

export type AgentState = 'Available' | 'InTransit' | 'Recovering' | 'OnAssignment' | 'OnMission' | 'Terminated'

// Assignment types for agents
export type ActivityId = 'Contracting' | 'Espionage'
export type MissionSiteId = `mission-site-${string}`
export type AgentAssignmentState = 'Standby' | 'Recovery' | 'Sacked' | 'KIA'
export type AgentAssignment = ActivityId | MissionSiteId | AgentAssignmentState

// Type guard functions for agent assignments
export function isActivityAssignment(assignment: AgentAssignment): assignment is ActivityId {
  return assignment === 'Contracting' || assignment === 'Espionage'
}

export function isMissionSiteAssignment(assignment: AgentAssignment): assignment is MissionSiteId {
  return typeof assignment === 'string' && assignment.startsWith('mission-site-')
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
  recoveryTurns: number
  hitPointsLostBeforeRecovery: number
  missionsSurvived: number
  state: AgentState
  assignment: AgentAssignment
}

export type Lead = {
  id: string
  title: string
  intelCost: number
  description: string
  dependsOn: string[]
  repeatable: boolean
}

export type FactionId = 'faction-red-dawn' | 'faction-black-lotus' | 'faction-exalt' | 'faction-followers-of-dagon'

export type FactionRewards = {
  factionId: FactionId
  threatReduction?: Bps
  suppression?: Bps
}

export type MissionRewards = {
  money?: number
  intel?: number
  funding?: number
  panicReduction?: Bps
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
  threatLevel: Bps
  threatIncrease: Bps
  suppression: Bps
  discoveryPrerequisite: string[]
}

export type GameState = {
  // Session
  turn: number
  actionsCount: number
  // Situation
  panic: Bps
  factions: Faction[]
  // Assets
  money: number
  intel: number
  funding: number
  agents: Agent[]
  // Liabilities
  currentTurnTotalHireCost: number
  // Archive
  leadInvestigationCounts: Record<string, number>
  missionSites: MissionSite[]
  // TurnReport of turn advancement from previous to current turn.
  turnStartReport?: TurnReport | undefined
}
