export type AgentState = 'Available' | 'Training' | 'InTransit' | 'Recovering' | 'Contracting' | 'OnAssignment'

export type Agent = {
  id: string
  turnHired: number
  state: AgentState
  assignment: string
  skill: number
  exhaustion: number
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
}
