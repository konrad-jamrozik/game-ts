// import { createSelector } from '@reduxjs/toolkit'
import type { RootState } from '../types'
import type { Agent } from '../../lib/model/agentModel'

// In https://chatgpt.com/c/68983db9-3fac-832d-ba85-3b9aaaa807d5
export function selectAgentsArray(state: RootState): Agent[] {
  return state.undoable.present.gameState.agents
}

// To be deleted, kept here only for reference
// export const selectAgentsView: (state: RootState) => AgentsView = createSelector([selectAgentsArray], (agents) =>
//   agsV(agents),
// )
