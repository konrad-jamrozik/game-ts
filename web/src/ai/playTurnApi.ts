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
      console.log('⚡ Player action: hire agent')
      store.dispatch(hireAgent())
      updateGameState()
    },

    sackAgents(agentIds: string[]): void {
      console.log('⚡ Player action: sack agents. Agent IDs:', agentIds)
      store.dispatch(sackAgents(agentIds))
      updateGameState()
    },

    assignAgentsToContracting(agentIds: string[]): void {
      console.log('⚡ Player action: assign agents to contracting. Agent IDs:', agentIds)
      store.dispatch(assignAgentsToContracting(agentIds))
      updateGameState()
    },

    assignAgentsToTraining(agentIds: string[]): void {
      console.log('⚡ Player action: assign agents to training. Agent IDs:', agentIds)
      store.dispatch(assignAgentsToTraining(agentIds))
      updateGameState()
    },

    recallAgents(agentIds: string[]): void {
      console.log('⚡ Player action: recall agents. Agent IDs:', agentIds)
      store.dispatch(recallAgents(agentIds))
      updateGameState()
    },

    startLeadInvestigation(params: { leadId: LeadId; agentIds: AgentId[] }): void {
      console.log('⚡ Player action: start lead investigation. Lead ID:', params.leadId, 'Agent IDs:', params.agentIds)
      store.dispatch(startLeadInvestigation(params))
      updateGameState()
    },

    addAgentsToInvestigation(params: { investigationId: LeadInvestigationId; agentIds: AgentId[] }): void {
      console.log(
        'Player action: add agents to investigation. Investigation ID:',
        params.investigationId,
        'Agent IDs:',
        params.agentIds,
      )
      store.dispatch(addAgentsToInvestigation(params))
      updateGameState()
    },

    deployAgentsToMission(params: { missionId: MissionId; agentIds: AgentId[] }): void {
      console.log(
        'Player action: deploy agents to mission. Mission ID:',
        params.missionId,
        'Agent IDs:',
        params.agentIds,
      )
      store.dispatch(deployAgentsToMission(params))
      updateGameState()
    },

    buyUpgrade(upgradeName: UpgradeName): void {
      console.log('⚡ Player action: buy upgrade. Upgrade:', upgradeName)
      store.dispatch(buyUpgrade(upgradeName))
      updateGameState()
    },
  }

  function updateGameState(): void {
    api.gameState = store.getState().undoable.present.gameState
  }

  return api
}
