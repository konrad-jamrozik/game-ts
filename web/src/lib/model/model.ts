import type { Fixed6 } from '../primitives/fixed6'

export type Actor = {
  id: string
  skill: Fixed6
  hitPoints: Fixed6
  maxHitPoints: number
  exhaustion: number
  weapon: Weapon
}

export type Weapon = {
  damage: number
  minDamage: number
  maxDamage: number
}

export type MissionSiteId = `mission-site-${string}`
export type LeadInvestigationId = `investigation-${string}`

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
  'CultLeader',
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
