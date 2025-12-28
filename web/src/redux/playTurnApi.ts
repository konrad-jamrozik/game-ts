import { store } from './store'
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
} from './slices/gameStateSlice'
import type { UpgradeName } from '../lib/data_tables/upgrades'
import type { PlayTurnAPI, ActionResult } from '../lib/model_utils/playTurnApiTypes'
import type { AgentId, LeadId, LeadInvestigationId, MissionId } from '../lib/model/modelIds'
import {
  validateHireAgent,
  validateSackAgents,
  validateAssignToContracting,
  validateAssignToTraining,
  validateRecallAgents,
  validateDeployAgents,
  validateStartLeadInvestigation,
  validateAddAgentsToInvestigation,
  validateBuyUpgrade,
} from '../lib/model_utils/validatePlayerActions'

export function getPlayTurnApi(): PlayTurnAPI {
  const api: PlayTurnAPI = {
    gameState: store.getState().undoable.present.gameState,

    hireAgent(): ActionResult {
      console.log('⚡ Player action: hire agent')
      const validation = validateHireAgent(api.gameState)
      if (!validation.isValid) {
        return { success: false, errorMessage: validation.errorMessage }
      }
      store.dispatch(hireAgent())
      updateGameState()
      return { success: true }
    },

    sackAgents(agentIds: AgentId[]): ActionResult {
      console.log('⚡ Player action: sack agents. Agent IDs:', agentIds)
      const validation = validateSackAgents(api.gameState, agentIds)
      if (!validation.isValid) {
        return { success: false, errorMessage: validation.errorMessage }
      }
      store.dispatch(sackAgents(agentIds))
      updateGameState()
      return { success: true }
    },

    assignAgentsToContracting(agentIds: AgentId[]): ActionResult {
      console.log('⚡ Player action: assign agents to contracting. Agent IDs:', agentIds)
      const validation = validateAssignToContracting(api.gameState, agentIds)
      if (!validation.isValid) {
        return { success: false, errorMessage: validation.errorMessage }
      }
      store.dispatch(assignAgentsToContracting(agentIds))
      updateGameState()
      return { success: true }
    },

    assignAgentsToTraining(agentIds: AgentId[]): ActionResult {
      console.log('⚡ Player action: assign agents to training. Agent IDs:', agentIds)
      const validation = validateAssignToTraining(api.gameState, agentIds)
      if (!validation.isValid) {
        return { success: false, errorMessage: validation.errorMessage }
      }
      store.dispatch(assignAgentsToTraining(agentIds))
      updateGameState()
      return { success: true }
    },

    recallAgents(agentIds: AgentId[]): ActionResult {
      console.log('⚡ Player action: recall agents. Agent IDs:', agentIds)
      const validation = validateRecallAgents(api.gameState, agentIds)
      if (!validation.isValid) {
        return { success: false, errorMessage: validation.errorMessage }
      }
      store.dispatch(recallAgents(agentIds))
      updateGameState()
      return { success: true }
    },

    startLeadInvestigation(params: { leadId: LeadId; agentIds: AgentId[] }): ActionResult {
      console.log('⚡ Player action: start lead investigation. Lead ID:', params.leadId, 'Agent IDs:', params.agentIds)
      const validation = validateStartLeadInvestigation(api.gameState, params.agentIds)
      if (!validation.isValid) {
        return { success: false, errorMessage: validation.errorMessage }
      }
      store.dispatch(startLeadInvestigation(params))
      updateGameState()
      return { success: true }
    },

    addAgentsToInvestigation(params: { investigationId: LeadInvestigationId; agentIds: AgentId[] }): ActionResult {
      console.log(
        'Player action: add agents to investigation. Investigation ID:',
        params.investigationId,
        'Agent IDs:',
        params.agentIds,
      )
      const validation = validateAddAgentsToInvestigation(api.gameState, params.agentIds)
      if (!validation.isValid) {
        return { success: false, errorMessage: validation.errorMessage }
      }
      store.dispatch(addAgentsToInvestigation(params))
      updateGameState()
      return { success: true }
    },

    deployAgentsToMission(params: { missionId: MissionId; agentIds: AgentId[] }): ActionResult {
      console.log(
        'Player action: deploy agents to mission. Mission ID:',
        params.missionId,
        'Agent IDs:',
        params.agentIds,
      )
      const validation = validateDeployAgents(api.gameState, params.missionId, params.agentIds)
      if (!validation.isValid) {
        return { success: false, errorMessage: validation.errorMessage }
      }
      store.dispatch(deployAgentsToMission(params))
      updateGameState()
      return { success: true }
    },

    buyUpgrade(upgradeName: UpgradeName): ActionResult {
      console.log('⚡ Player action: buy upgrade. Upgrade:', upgradeName)
      const validation = validateBuyUpgrade(api.gameState, upgradeName)
      if (!validation.isValid) {
        return { success: false, errorMessage: validation.errorMessage }
      }
      store.dispatch(buyUpgrade(upgradeName))
      updateGameState()
      return { success: true }
    },
  }

  function updateGameState(): void {
    api.gameState = store.getState().undoable.present.gameState
  }

  return api
}
