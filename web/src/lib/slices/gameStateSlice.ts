import { createSlice } from '@reduxjs/toolkit'
import initialState from '../model/ruleset/initialState'
import {
  hireAgent as hireAgentReducer,
  sackAgents as sackAgentsReducer,
  assignAgentsToContracting as assignAgentsToContractingReducer,
  assignAgentsToEspionage as assignAgentsToEspionageReducer,
  recallAgents as recallAgentsReducer,
} from './reducers/agentReducers'
import { investigateLead as investigateLeadReducer } from './reducers/leadReducers'
import { deployAgentsToMission as deployAgentsToMissionReducer } from './reducers/missionReducers'
import { advanceTurn as advanceTurnReducer, reset as resetReducer } from './reducers/gameControlsReducers'

// Relevant docs on createSlice:
// https://redux.js.org/style-guide/#allow-many-reducers-to-respond-to-the-same-action
// See https://redux-toolkit.js.org/usage/usage-with-typescript#wrapping-createslice
// See https://redux.js.org/understanding/history-and-design/middleware
const gameStateSlice = createSlice({
  name: 'gameState',
  initialState,
  reducers: {
    advanceTurn: advanceTurnReducer,
    hireAgent: hireAgentReducer,
    sackAgents: sackAgentsReducer,
    assignAgentsToContracting: assignAgentsToContractingReducer,
    assignAgentsToEspionage: assignAgentsToEspionageReducer,
    recallAgents: recallAgentsReducer,
    reset: resetReducer,
    investigateLead: investigateLeadReducer,
    deployAgentsToMission: deployAgentsToMissionReducer,
  },
})

export const {
  advanceTurn,
  hireAgent,
  sackAgents,
  assignAgentsToContracting,
  assignAgentsToEspionage,
  recallAgents,
  reset,
  investigateLead,
  deployAgentsToMission,
} = gameStateSlice.actions
export default gameStateSlice.reducer
