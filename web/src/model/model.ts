export type AgentState = 'Available' | 'Training' | 'InTransit' | 'Recovering' | 'Contracting' | 'Away'

export type Agent = {
  id: string
  turnHired: number
  state: AgentState
  assignment: string
}

export type GameState = {
  actionsCount: number
  turn: number
  agents: Agent[]
  money: number
  funding: number
  hireCost: number
  nextAgentId: number
}
