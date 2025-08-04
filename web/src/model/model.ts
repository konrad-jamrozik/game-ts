export type AgentState = 'Available' | 'InTransit' | 'Recovering' | 'OnAssignment' | 'OnMission' | 'Terminated'

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
  factionRewards?: Set<FactionRewards>
}

export type MissionObjective = {
  id: string
  difficulty: number
}

export type Mission = {
  id: string
  title: string
  description: string
  expiresIn: number | 'never'
  dependsOn: string[]
  objectives: MissionObjective[]
  difficulty: number
  rewards: MissionRewards
}

export type MissionSiteState = 'Active' | 'Deployed' | 'Successful' | 'Failed' | 'Expired'

export type MissionSiteObjective = {
  id: string
  difficulty: number
  fulfilled: boolean
}

export type MissionSite = {
  id: string
  missionId: string
  agentIds: string[]
  state: MissionSiteState
  expiresIn: number | 'never'
  objectives: MissionSiteObjective[]
}

export type Faction = {
  id: FactionId
  name: string
  threatLevel: number
  threatIncrease: number
  suppression: number
  discoveryPrerequisite: string[]
}

export type GameState = {
  actionsCount: number
  turn: number
  agents: Agent[]
  money: number
  intel: number
  funding: number
  hireCost: number
  nextAgentId: number
  nextMissionSiteId: number
  investigatedLeadIds: string[]
  leadInvestigationCounts: Record<string, number>
  missionSites: MissionSite[]
  panic: number
  factions: Faction[]
}
