export type AgentState = 'Available' | 'InTransit' | 'Recovering' | 'OnAssignment' | 'OnMission' | 'Terminated'

export type Weapon = {
  damage: number
  minDamage: number
  maxDamage: number
}

// KJA 2 see if "assignment" can be somehow typed to things like "typeof MissionSiteID | typeof ActivityId" where "ActivityId" is "Contracting" | "Espionage"
// and MissionSiteId is string of form mission-site-<some-id>
// and then in code we can check: "if assignment type is really typeof MissionSiteID", then dereference appropriate MissionSite value
export type Agent = {
  id: string
  turnHired: number
  skill: number
  exhaustion: number
  hitPoints: number
  maxHitPoints: number
  recoveryTurns: number
  hitPointsLostBeforeRecovery: number
  missionsSurvived: number
  state: AgentState
  assignment: string
  weapon: Weapon
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

export type EnemyUnitType =
  | 'Initiate'
  | 'Operative'
  | 'Handler'
  | 'Soldier'
  | 'Lieutenant'
  | 'Elite'
  | 'Commander'
  | 'HighCommander'

export type EnemyUnit = {
  id: string
  type: EnemyUnitType
  skill: number
  exhaustion: number
  hitPoints: number
  maxHitPoints: number
  weapon: Weapon
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
  enemyUnits: EnemyUnit[] // Enemy units present at the mission site
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
