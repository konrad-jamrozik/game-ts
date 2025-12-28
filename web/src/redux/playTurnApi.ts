import type { Store } from '@reduxjs/toolkit'
import {
  incrementActualWeaponDamageUpgrades,
  incrementActualTrainingSkillGainUpgrades,
  incrementActualExhaustionRecoveryUpgrades,
  incrementActualHitPointsRecoveryUpgrades,
  increaseDesiredCounts,
  type BasicIntellectState,
} from './slices/aiStateSlice'
import type { PlayTurnAPI, ActionResult } from '../lib/model_utils/playTurnApiTypes'
import type { UpgradeName } from '../lib/data_tables/upgrades'
import type { AgentId, LeadId, LeadInvestigationId, MissionId } from '../lib/model/modelIds'
import type { GameState } from '../lib/model/gameStateModel'
import { getPlayerActionsApi } from './playerActionsApi'
import type { RootState } from './rootReducer'

export function getPlayTurnApi(store: Store<RootState>, options?: { strict?: boolean }): PlayTurnAPI {
  const strict = options?.strict ?? false

  const initialGameState = getCurrentGameState(store)
  const baseApi = getPlayerActionsApi(store.dispatch, { strict })

  const api: PlayTurnAPI = {
    gameState: initialGameState,
    aiState: getCurrentAiState(store),

    hireAgent(): ActionResult {
      const result = baseApi.hireAgent(api.gameState)
      if (result.success) {
        updateGameState()
      }
      return result
    },

    sackAgents(agentIds: AgentId[]): ActionResult {
      const result = baseApi.sackAgents(api.gameState, agentIds)
      if (result.success) {
        updateGameState()
      }
      return result
    },

    assignAgentsToContracting(agentIds: AgentId[]): ActionResult {
      const result = baseApi.assignAgentsToContracting(api.gameState, agentIds)
      if (result.success) {
        updateGameState()
      }
      return result
    },

    assignAgentsToTraining(agentIds: AgentId[]): ActionResult {
      const result = baseApi.assignAgentsToTraining(api.gameState, agentIds)
      if (result.success) {
        updateGameState()
      }
      return result
    },

    recallAgents(agentIds: AgentId[]): ActionResult {
      const result = baseApi.recallAgents(api.gameState, agentIds)
      if (result.success) {
        updateGameState()
      }
      return result
    },

    startLeadInvestigation(params: { leadId: LeadId; agentIds: AgentId[] }): ActionResult {
      const result = baseApi.startLeadInvestigation(api.gameState, params)
      if (result.success) {
        updateGameState()
      }
      return result
    },

    addAgentsToInvestigation(params: { investigationId: LeadInvestigationId; agentIds: AgentId[] }): ActionResult {
      const result = baseApi.addAgentsToInvestigation(api.gameState, params)
      if (result.success) {
        updateGameState()
      }
      return result
    },

    deployAgentsToMission(params: { missionId: MissionId; agentIds: AgentId[] }): ActionResult {
      const result = baseApi.deployAgentsToMission(api.gameState, params)
      if (result.success) {
        updateGameState()
      }
      return result
    },

    buyUpgrade(upgradeName: UpgradeName): ActionResult {
      const result = baseApi.buyUpgrade(api.gameState, upgradeName)
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
    api.gameState = getCurrentGameState(store)
  }

  function updateAiState(): void {
    api.aiState = getCurrentAiState(store)
  }

  return api
}

function getCurrentAiState(store: Store<RootState>): BasicIntellectState {
  const rootState = store.getState()
  const present = rootState.undoable.present
  if (!('aiState' in present)) {
    throw new Error('aiState not found in undoable.present - this should never happen')
  }
  return present.aiState
}

function getCurrentGameState(store: Store<RootState>): GameState {
  return store.getState().undoable.present.gameState
}
