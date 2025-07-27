export type AgentState =
  | 'Available'
  | 'Training'
  | 'InTransit'
  | 'Recovering'
  | 'Contracting'
  | 'OnAssignment'
  | 'OnMission'

export type Agent = {
  id: string
  turnHired: number
  state: AgentState
  assignment: string
  skill: number
  exhaustion: number
}

export type Lead = {
  id: string
  title: string
  intelCost: number
  description: string
  expiresIn: number | 'never'
  dependsOn: string[]
}

export type Mission = {
  id: string
  title: string
  description: string
  expiresIn: number | 'never'
  dependsOn: string[]
}

export type MissionSiteState = 'Active' | 'Successful' | 'Failed'

export type MissionSite = {
  id: string
  missionId: string
  agentIds: string[]
  state: MissionSiteState
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
  missionSites: MissionSite[]
}
