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
import type { AgentId, LeadId, LeadInvestigationId, MissionId } from '../lib/model/modelIds'

export function getPlayTurnApi(): PlayTurnAPI {
  const api: PlayTurnAPI = {
    gameState: store.getState().undoable.present.gameState,

    hireAgent(): void {
      store.dispatch(hireAgent())
      updateGameState()
    },

    sackAgents(agentIds: string[]): void {
      store.dispatch(sackAgents(agentIds))
      updateGameState()
    },

    assignAgentsToContracting(agentIds: string[]): void {
      store.dispatch(assignAgentsToContracting(agentIds))
      updateGameState()
    },

    assignAgentsToTraining(agentIds: string[]): void {
      store.dispatch(assignAgentsToTraining(agentIds))
      updateGameState()
    },

    recallAgents(agentIds: string[]): void {
      store.dispatch(recallAgents(agentIds))
      updateGameState()
    },

    startLeadInvestigation(params: { leadId: LeadId; agentIds: AgentId[] }): void {
      store.dispatch(startLeadInvestigation(params))
      updateGameState()
    },

    addAgentsToInvestigation(params: { investigationId: LeadInvestigationId; agentIds: AgentId[] }): void {
      store.dispatch(addAgentsToInvestigation(params))
      updateGameState()
    },

    deployAgentsToMission(params: { missionId: MissionId; agentIds: AgentId[] }): void {
      store.dispatch(deployAgentsToMission(params))
      updateGameState()
    },

    buyUpgrade(upgradeName: UpgradeName): void {
      store.dispatch(buyUpgrade(upgradeName))
      updateGameState()
    },
  }

  function updateGameState(): void {
    api.gameState = store.getState().undoable.present.gameState
  }

  return api
}
