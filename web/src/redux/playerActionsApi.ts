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
import type { ActionResult, PlayerActionsAPI } from '../lib/model_utils/playerActionsApiTypes'
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
import { log } from '../lib/primitives/logger'
import { profiler } from '../lib/primitives/profiler'
import type { GameState } from '../lib/model/gameStateModel'
import type { AppDispatch } from './store'

export function getPlayerActionsApi(dispatch: AppDispatch, options?: { strict?: boolean }): PlayerActionsAPI {
  const strict = options?.strict ?? false

  const wrappedAddAgentsToInvestigation = profiler.wrap('A2_add', addAgentsToInvestigationImpl)

  function addAgentsToInvestigationImpl(
    gameState: GameState,
    params: { investigationId: LeadInvestigationId; agentIds: AgentId[] },
  ): ActionResult {
    log.info(
      'player',
      'add agents to investigation. Investigation ID:',
      params.investigationId,
      'Agent IDs:',
      params.agentIds,
    )
    const validation = validateAddAgentsToInvestigation(gameState, params.agentIds)
    const errorResult = handleValidationError(strict, validation)
    if (errorResult) return errorResult
    dispatch(addAgentsToInvestigation(params))
    return { success: true }
  }

  const api: PlayerActionsAPI = {
    hireAgent(gameState: GameState): ActionResult {
      log.info('player', 'hire agent')
      const validation = validateHireAgent(gameState)
      const errorResult = handleValidationError(strict, validation)
      if (errorResult) return errorResult
      dispatch(hireAgent())
      return { success: true }
    },

    sackAgents(gameState: GameState, agentIds: AgentId[]): ActionResult {
      log.info('player', 'sack agents. Agent IDs:', agentIds)
      const validation = validateSackAgents(gameState, agentIds)
      const errorResult = handleValidationError(strict, validation)
      if (errorResult) return errorResult
      dispatch(sackAgents(agentIds))
      return { success: true }
    },

    assignAgentsToContracting(gameState: GameState, agentIds: AgentId[]): ActionResult {
      log.info('player', 'assign agents to contracting. Agent IDs:', agentIds)
      const validation = validateAssignToContracting(gameState, agentIds)
      const errorResult = handleValidationError(strict, validation)
      if (errorResult) return errorResult
      dispatch(assignAgentsToContracting(agentIds))
      return { success: true }
    },

    assignAgentsToTraining(gameState: GameState, agentIds: AgentId[]): ActionResult {
      log.info('player', 'assign agents to training. Agent IDs:', agentIds)
      const validation = validateAssignToTraining(gameState, agentIds)
      const errorResult = handleValidationError(strict, validation)
      if (errorResult) return errorResult
      dispatch(assignAgentsToTraining(agentIds))
      return { success: true }
    },

    recallAgents(gameState: GameState, agentIds: AgentId[]): ActionResult {
      log.info('player', 'recall agents. Agent IDs:', agentIds)
      const validation = validateRecallAgents(gameState, agentIds)
      const errorResult = handleValidationError(strict, validation)
      if (errorResult) return errorResult
      dispatch(recallAgents(agentIds))
      return { success: true }
    },

    startLeadInvestigation(gameState: GameState, params: { leadId: LeadId; agentIds: AgentId[] }): ActionResult {
      log.info('player', 'start lead investigation. Lead ID:', params.leadId, 'Agent IDs:', params.agentIds)
      const validation = validateStartLeadInvestigation(gameState, params.agentIds)
      const errorResult = handleValidationError(strict, validation)
      if (errorResult) return errorResult
      dispatch(startLeadInvestigation(params))
      return { success: true }
    },

    addAgentsToInvestigationPlayerActionsApi: wrappedAddAgentsToInvestigation,

    deployAgentsToMission(gameState: GameState, params: { missionId: MissionId; agentIds: AgentId[] }): ActionResult {
      log.info('player', 'deploy agents to mission. Mission ID:', params.missionId, 'Agent IDs:', params.agentIds)
      const validation = validateDeployAgents(gameState, params.missionId, params.agentIds)
      const errorResult = handleValidationError(strict, validation)
      if (errorResult) return errorResult
      dispatch(deployAgentsToMission(params))
      return { success: true }
    },

    buyUpgrade(gameState: GameState, upgradeName: UpgradeName): ActionResult {
      log.info('player', 'buy upgrade. Upgrade:', upgradeName)
      const validation = validateBuyUpgrade(gameState, upgradeName)
      const errorResult = handleValidationError(strict, validation)
      if (errorResult) return errorResult
      dispatch(buyUpgrade(upgradeName))
      return { success: true }
    },
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
