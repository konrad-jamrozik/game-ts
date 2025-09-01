import type { GameState } from '../../model/model'
import { AGENT_HIRE_COST } from '../../model/ruleset/constants'
import asPlayerAction from '../asPlayerAction'
import { newHiredAgent } from '../reducerUtils'

export const hireAgent = asPlayerAction((state: GameState) => {
  const nextAgentNumericId = state.agents.length
  const newAgentId = `agent-${nextAgentNumericId.toString().padStart(3, '0')}`

  const newAgent = newHiredAgent(newAgentId, state.turn)
  state.agents.push(newAgent)
  state.currentTurnTotalHireCost += AGENT_HIRE_COST
})

export const sackAgents = asPlayerAction<string[]>((state: GameState, action) => {
  const agentIdsToSack = action.payload
  for (const agent of state.agents) {
    if (agentIdsToSack.includes(agent.id)) {
      agent.state = 'Terminated'
      agent.assignment = 'Sacked'
    }
  }
})

export const assignAgentsToContracting = asPlayerAction<string[]>((state: GameState, action) => {
  const agentIdsToAssign = action.payload
  for (const agent of state.agents) {
    if (agentIdsToAssign.includes(agent.id)) {
      agent.assignment = 'Contracting'
      agent.state = 'InTransit'
    }
  }
})

export const assignAgentsToEspionage = asPlayerAction<string[]>((state: GameState, action) => {
  const agentIdsToAssign = action.payload
  for (const agent of state.agents) {
    if (agentIdsToAssign.includes(agent.id)) {
      agent.assignment = 'Espionage'
      agent.state = 'InTransit'
    }
  }
})

export const recallAgents = asPlayerAction<string[]>((state: GameState, action) => {
  const agentIdsToRecall = action.payload
  for (const agent of state.agents) {
    if (agentIdsToRecall.includes(agent.id)) {
      agent.assignment = 'Standby'
      agent.state = 'InTransit'
    }
  }
})
