export type Actor = {
  id: string
  skill: number
  hitPoints: number
  maxHitPoints: number
  exhaustion: number
  weapon: Weapon
}

export type AgentState = 'Available' | 'InTransit' | 'Recovering' | 'OnAssignment' | 'OnMission' | 'Terminated'

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
  assignment: string
}

export type Lead = {
  id: string
  title: string
  intelCost: number
  description: string
  expiresIn: number | 'never'
  dependsOn: string[]
  repeatable: boolean
}

export type FactionId = 'faction-red-dawn' | 'faction-black-lotus' | 'faction-exalt' | 'faction-followers-of-dagon'

export type FactionRewards = {
  factionId: FactionId
  threatReduction?: number
  suppression?: number
}

export type MissionRewards = {
  money?: number
  intel?: number
  funding?: number
  panicReduction?: number
  factionRewards?: FactionRewards[]
}

export type EnemyType =
  | 'Initiate'
  | 'Operative'
  | 'Handler'
  | 'Soldier'
  | 'Lieutenant'
  | 'Elite'
  | 'Commander'
  | 'HighCommander'

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
  id: string
  missionId: string
  agentIds: string[]
  state: MissionSiteState
  expiresIn: number | 'never'
  enemies: Enemy[] // Enemies present at the mission site
}

export type Faction = {
  id: FactionId
  name: string
  threatLevel: number
  threatIncrease: number
  suppression: number
  discoveryPrerequisite: string[]
}

// KJA LATER hierarchize the game state per the comments and use more fine-grained selectors.
export type GameState = {
  // Session
  turn: number
  actionsCount: number
  // Situation
  panic: number
  factions: Faction[]
  // Assets
  money: number
  intel: number
  funding: number
  agents: Agent[]
  // Liabilities
  currentTurnTotalHireCost: number
  // Leads
  leadInvestigationCounts: Record<string, number>
  // Mission sites
  missionSites: MissionSite[]
}
