import { createSlice } from '@reduxjs/toolkit'
import initialState from '../model/ruleset/initialState'
import {
  hireAgent as hireAgentReducer,
  sackAgents as sackAgentsReducer,
  assignAgentsToContracting as assignAgentsToContractingReducer,
  assignAgentsToEspionage as assignAgentsToEspionageReducer,
  recallAgents as recallAgentsReducer,
} from './reducers/agentReducers'
import {
  createLeadInvestigation as createLeadInvestigationReducer,
  addAgentsToInvestigation as addAgentsToInvestigationReducer,
} from './reducers/leadReducers'
import {
  deployAgentsToMission as deployAgentsToMissionReducer,
  debugSpawnMissionSites as debugSpawnMissionSitesReducer,
} from './reducers/missionReducers'
import { advanceTurn as advanceTurnReducer, reset as resetReducer } from './reducers/gameControlsReducers'
import {
  debugSetPanicToZero as debugSetPanicToZeroReducer,
  debugSetAllFactionsSuppressionTo1000Percent as debugSetAllFactionsSuppressionTo1000PercentReducer,
  debugAddMoney as debugAddMoneyReducer,
  debugSpawn10Agents as debugSpawn10AgentsReducer,
} from './reducers/debugReducers'

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
    createLeadInvestigation: createLeadInvestigationReducer,
    addAgentsToInvestigation: addAgentsToInvestigationReducer,
    deployAgentsToMission: deployAgentsToMissionReducer,
    debugSpawnMissionSites: debugSpawnMissionSitesReducer,
    debugSetPanicToZero: debugSetPanicToZeroReducer,
    debugSetAllFactionsSuppressionTo1000Percent: debugSetAllFactionsSuppressionTo1000PercentReducer,
    debugAddMoney: debugAddMoneyReducer,
    debugSpawn10Agents: debugSpawn10AgentsReducer,
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
  createLeadInvestigation,
  addAgentsToInvestigation,
  deployAgentsToMission,
  debugSpawnMissionSites,
  debugSetPanicToZero,
  debugSetAllFactionsSuppressionTo1000Percent,
  debugAddMoney,
  debugSpawn10Agents,
} = gameStateSlice.actions
export default gameStateSlice.reducer
