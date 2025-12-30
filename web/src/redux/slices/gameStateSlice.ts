import { createSlice } from '@reduxjs/toolkit'
import { bldInitialState } from '../../lib/factories/gameStateFactory'
import {
  hireAgent as hireAgentReducer,
  sackAgents as sackAgentsReducer,
  assignAgentsToContracting as assignAgentsToContractingReducer,
  assignAgentsToTraining as assignAgentsToTrainingReducer,
  recallAgents as recallAgentsReducer,
} from '../reducers/agentReducers'
import {
  startLeadInvestigation as startLeadInvestigationReducer,
  addAgentsToInvestigation as addAgentsToInvestigationReducer,
} from '../reducers/leadReducers'
import { deployAgentsToMission as deployAgentsToMissionReducer } from '../reducers/missionReducers'
import { buyUpgrade as buyUpgradeReducer } from '../reducers/upgradeReducers'
import { advanceTurn as advanceTurnReducer, reset as resetReducer } from '../reducers/gameControlsReducers'
import {
  debugSetPanicToZero as debugSetPanicToZeroReducer,
  debugSetAllFactionsSuppression as debugSetAllFactionsSuppressionReducer,
  debugAddMoney as debugAddMoneyReducer,
  debugSpawn10Agents as debugSpawn10AgentsReducer,
  debugAddCapabilities as debugAddCapabilitiesReducer,
  debugSpawnMissions as debugSpawnMissionsReducer,
  debugAddEverything as debugAddEverythingReducer,
  debugTerminateRedDawn as debugTerminateRedDawnReducer,
} from '../reducers/debugReducers'

// Relevant docs on createSlice:
// https://redux.js.org/style-guide/#allow-many-reducers-to-respond-to-the-same-action
// See https://redux-toolkit.js.org/usage/usage-with-typescript#wrapping-createslice
// See https://redux.js.org/understanding/history-and-design/middleware
const gameStateSlice = createSlice({
  name: 'gameState',
  initialState: bldInitialState(),
  reducers: {
    advanceTurn: advanceTurnReducer,
    hireAgent: hireAgentReducer,
    sackAgents: sackAgentsReducer,
    assignAgentsToContracting: assignAgentsToContractingReducer,
    assignAgentsToTraining: assignAgentsToTrainingReducer,
    recallAgents: recallAgentsReducer,
    reset: resetReducer,
    startLeadInvestigation: startLeadInvestigationReducer,
    addAgentsToInvestigation: addAgentsToInvestigationReducer,
    deployAgentsToMission: deployAgentsToMissionReducer,
    debugSpawnMissions: debugSpawnMissionsReducer,
    buyUpgrade: buyUpgradeReducer,
    debugSetPanicToZero: debugSetPanicToZeroReducer,
    debugSetAllFactionsSuppression: debugSetAllFactionsSuppressionReducer,
    debugAddMoney: debugAddMoneyReducer,
    debugSpawn10Agents: debugSpawn10AgentsReducer,
    debugAddCapabilities: debugAddCapabilitiesReducer,
    debugAddEverything: debugAddEverythingReducer,
    debugTerminateRedDawn: debugTerminateRedDawnReducer,
  },
})

export const {
  advanceTurn,
  hireAgent,
  sackAgents,
  assignAgentsToContracting,
  assignAgentsToTraining,
  recallAgents,
  reset,
  startLeadInvestigation,
  addAgentsToInvestigation,
  deployAgentsToMission,
  debugSpawnMissions,
  buyUpgrade,
  debugSetPanicToZero,
  debugSetAllFactionsSuppression,
  debugAddMoney,
  debugSpawn10Agents,
  debugAddCapabilities,
  debugAddEverything,
  debugTerminateRedDawn,
} = gameStateSlice.actions
export default gameStateSlice.reducer
