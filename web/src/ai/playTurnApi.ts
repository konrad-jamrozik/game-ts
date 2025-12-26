import { store } from '../redux/store'
import {
  hireAgent,
  sackAgents,
  assignAgentsToContracting,
  assignAgentsToTraining,
  recallAgents,
  startLeadInvestigation,
  addAgentsToInvestigation,
  deployAgentsToMission,
  buyUpgrade,
} from '../redux/slices/gameStateSlice'
import type { UpgradeName } from '../lib/data_tables/upgrades'
import type { PlayTurnAPI } from './types'

export function getPlayTurnApi(): PlayTurnAPI {
  const api: PlayTurnAPI = {
    gameState: store.getState().undoable.present.gameState,

    hireAgent(): void {
      store.dispatch(hireAgent())
      api.gameState = store.getState().undoable.present.gameState
    },

    sackAgents(agentIds: string[]): void {
      store.dispatch(sackAgents(agentIds))
      api.gameState = store.getState().undoable.present.gameState
    },

    assignAgentsToContracting(agentIds: string[]): void {
      store.dispatch(assignAgentsToContracting(agentIds))
      api.gameState = store.getState().undoable.present.gameState
    },

    assignAgentsToTraining(agentIds: string[]): void {
      store.dispatch(assignAgentsToTraining(agentIds))
      api.gameState = store.getState().undoable.present.gameState
    },

    recallAgents(agentIds: string[]): void {
      store.dispatch(recallAgents(agentIds))
      api.gameState = store.getState().undoable.present.gameState
    },

    startLeadInvestigation(params: { leadId: string; agentIds: string[] }): void {
      store.dispatch(startLeadInvestigation(params))
      api.gameState = store.getState().undoable.present.gameState
    },

    addAgentsToInvestigation(params: { investigationId: string; agentIds: string[] }): void {
      store.dispatch(addAgentsToInvestigation(params))
      api.gameState = store.getState().undoable.present.gameState
    },

    deployAgentsToMission(params: { missionId: string; agentIds: string[] }): void {
      store.dispatch(deployAgentsToMission(params))
      api.gameState = store.getState().undoable.present.gameState
    },

    buyUpgrade(upgradeName: UpgradeName): void {
      store.dispatch(buyUpgrade(upgradeName))
      api.gameState = store.getState().undoable.present.gameState
    },
  }

  return api
}
