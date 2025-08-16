import { createSelector } from '@reduxjs/toolkit'
import type { RootState } from '../../app/store'
import { agsV, type AgentsView } from '../model/agents/AgentsView'
import type { Agent } from '../model/model'

// In https://chatgpt.com/c/68983db9-3fac-832d-ba85-3b9aaaa807d5
function selectAgentsArray(state: RootState): Agent[] {
  return state.undoable.present.gameState.agents
}

export const selectAgentsView: (state: RootState) => AgentsView = createSelector([selectAgentsArray], (agents) =>
  agsV(agents),
)
