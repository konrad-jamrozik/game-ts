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
import {
  incrementActualWeaponDamageUpgrades,
  incrementActualTrainingSkillGainUpgrades,
  incrementActualExhaustionRecoveryUpgrades,
  incrementActualHitPointsRecoveryUpgrades,
  increaseDesiredCounts,
  type BasicIntellectState,
} from './slices/aiStateSlice'
import type { UpgradeName } from '../lib/data_tables/upgrades'
import type { PlayerActionsAPI } from '../lib/model_utils/playerActionsApiTypes'
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
  type ValidationResult,
} from '../lib/model_utils/validatePlayerActions'
import { assertTrue } from '../lib/primitives/assertPrimitives'
import type { GameState } from '../lib/model/gameStateModel'

export function getPlayerActionsApi(options?: { strict?: boolean }): PlayerActionsAPI {
  const strict = options?.strict ?? false

  const api: PlayerActionsAPI = {
    hireAgent(): ActionResult {
      console.log('⚡ Player action: hire agent')
      const validation = validateHireAgent(getCurrentGameState())
      const errorResult = handleValidationError(strict, validation)
      if (errorResult) return errorResult
      store.dispatch(hireAgent())
      return { success: true }
    },

    sackAgents(agentIds: AgentId[]): ActionResult {
      console.log('⚡ Player action: sack agents. Agent IDs:', agentIds)
      const validation = validateSackAgents(getCurrentGameState(), agentIds)
      const errorResult = handleValidationError(strict, validation)
      if (errorResult) return errorResult
      store.dispatch(sackAgents(agentIds))
      return { success: true }
    },

    assignAgentsToContracting(agentIds: AgentId[]): ActionResult {
      console.log('⚡ Player action: assign agents to contracting. Agent IDs:', agentIds)
      const validation = validateAssignToContracting(getCurrentGameState(), agentIds)
      const errorResult = handleValidationError(strict, validation)
      if (errorResult) return errorResult
      store.dispatch(assignAgentsToContracting(agentIds))
      return { success: true }
    },

    assignAgentsToTraining(agentIds: AgentId[]): ActionResult {
      console.log('⚡ Player action: assign agents to training. Agent IDs:', agentIds)
      const validation = validateAssignToTraining(getCurrentGameState(), agentIds)
      const errorResult = handleValidationError(strict, validation)
      if (errorResult) return errorResult
      store.dispatch(assignAgentsToTraining(agentIds))
      return { success: true }
    },

    recallAgents(agentIds: AgentId[]): ActionResult {
      console.log('⚡ Player action: recall agents. Agent IDs:', agentIds)
      const validation = validateRecallAgents(getCurrentGameState(), agentIds)
      const errorResult = handleValidationError(strict, validation)
      if (errorResult) return errorResult
      store.dispatch(recallAgents(agentIds))
      return { success: true }
    },

    startLeadInvestigation(params: { leadId: LeadId; agentIds: AgentId[] }): ActionResult {
      console.log('⚡ Player action: start lead investigation. Lead ID:', params.leadId, 'Agent IDs:', params.agentIds)
      const validation = validateStartLeadInvestigation(getCurrentGameState(), params.agentIds)
      const errorResult = handleValidationError(strict, validation)
      if (errorResult) return errorResult
      store.dispatch(startLeadInvestigation(params))
      return { success: true }
    },

    addAgentsToInvestigation(params: { investigationId: LeadInvestigationId; agentIds: AgentId[] }): ActionResult {
      console.log(
        'Player action: add agents to investigation. Investigation ID:',
        params.investigationId,
        'Agent IDs:',
        params.agentIds,
      )
      const validation = validateAddAgentsToInvestigation(getCurrentGameState(), params.agentIds)
      const errorResult = handleValidationError(strict, validation)
      if (errorResult) return errorResult
      store.dispatch(addAgentsToInvestigation(params))
      return { success: true }
    },

    deployAgentsToMission(params: { missionId: MissionId; agentIds: AgentId[] }): ActionResult {
      console.log(
        'Player action: deploy agents to mission. Mission ID:',
        params.missionId,
        'Agent IDs:',
        params.agentIds,
      )
      const validation = validateDeployAgents(getCurrentGameState(), params.missionId, params.agentIds)
      const errorResult = handleValidationError(strict, validation)
      if (errorResult) return errorResult
      store.dispatch(deployAgentsToMission(params))
      return { success: true }
    },

    buyUpgrade(upgradeName: UpgradeName): ActionResult {
      console.log('⚡ Player action: buy upgrade. Upgrade:', upgradeName)
      const validation = validateBuyUpgrade(getCurrentGameState(), upgradeName)
      const errorResult = handleValidationError(strict, validation)
      if (errorResult) return errorResult
      store.dispatch(buyUpgrade(upgradeName))
      return { success: true }
    },
  }

  return api
}

export function getPlayTurnApi(options?: { strict?: boolean }): PlayTurnAPI {
  const strict = options?.strict ?? false

  const baseApi = getPlayerActionsApi({ strict })

  const api: PlayTurnAPI = {
    ...baseApi,

    gameState: getCurrentGameState(),
    aiState: getCurrentAiState(),

    hireAgent(): ActionResult {
      const result = baseApi.hireAgent()
      if (result.success) {
        updateGameState()
      }
      return result
    },

    sackAgents(agentIds: AgentId[]): ActionResult {
      const result = baseApi.sackAgents(agentIds)
      if (result.success) {
        updateGameState()
      }
      return result
    },

    assignAgentsToContracting(agentIds: AgentId[]): ActionResult {
      const result = baseApi.assignAgentsToContracting(agentIds)
      if (result.success) {
        updateGameState()
      }
      return result
    },

    assignAgentsToTraining(agentIds: AgentId[]): ActionResult {
      const result = baseApi.assignAgentsToTraining(agentIds)
      if (result.success) {
        updateGameState()
      }
      return result
    },

    recallAgents(agentIds: AgentId[]): ActionResult {
      const result = baseApi.recallAgents(agentIds)
      if (result.success) {
        updateGameState()
      }
      return result
    },

    startLeadInvestigation(params: { leadId: LeadId; agentIds: AgentId[] }): ActionResult {
      const result = baseApi.startLeadInvestigation(params)
      if (result.success) {
        updateGameState()
      }
      return result
    },

    addAgentsToInvestigation(params: { investigationId: LeadInvestigationId; agentIds: AgentId[] }): ActionResult {
      const result = baseApi.addAgentsToInvestigation(params)
      if (result.success) {
        updateGameState()
      }
      return result
    },

    deployAgentsToMission(params: { missionId: MissionId; agentIds: AgentId[] }): ActionResult {
      const result = baseApi.deployAgentsToMission(params)
      if (result.success) {
        updateGameState()
      }
      return result
    },

    buyUpgrade(upgradeName: UpgradeName): ActionResult {
      const result = baseApi.buyUpgrade(upgradeName)
      if (result.success) {
        updateGameState()
      }
      return result
    },

    incrementActualWeaponDamageUpgrades(): void {
      store.dispatch(incrementActualWeaponDamageUpgrades())
      updateAiState()
    },

    incrementActualTrainingSkillGainUpgrades(): void {
      store.dispatch(incrementActualTrainingSkillGainUpgrades())
      updateAiState()
    },

    incrementActualExhaustionRecoveryUpgrades(): void {
      store.dispatch(incrementActualExhaustionRecoveryUpgrades())
      updateAiState()
    },

    incrementActualHitPointsRecoveryUpgrades(): void {
      store.dispatch(incrementActualHitPointsRecoveryUpgrades())
      updateAiState()
    },

    increaseDesiredCounts(): void {
      store.dispatch(increaseDesiredCounts())
      updateAiState()
    },
  }

  function updateGameState(): void {
    api.gameState = getCurrentGameState()
  }

  function updateAiState(): void {
    api.aiState = getCurrentAiState()
  }

  return api
}

function handleValidationError(strict: boolean, validation: ValidationResult): ActionResult | undefined {
  if (!validation.isValid) {
    if (strict) {
      assertTrue(false, `AI player validation failed: ${validation.errorMessage}`)
    }
    return { success: false, errorMessage: validation.errorMessage }
  }
  return undefined
}

function getCurrentGameState(): GameState {
  return store.getState().undoable.present.gameState
}

function getCurrentAiState(): BasicIntellectState {
  const rootState = store.getState()
  const present = rootState.undoable.present
  if (!('aiState' in present)) {
    throw new Error('aiState not found in undoable.present - this should never happen')
  }
  return present.aiState
}
