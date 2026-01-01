import type { GameState } from '../model/gameStateModel'
import type { AgentId, MissionId } from '../model/modelIds'
import { AGENT_HIRE_COST } from '../data_tables/constants'
import { getUpgradePrice, type UpgradeName } from '../data_tables/upgrades'
import { notTerminated, onTrainingAssignment } from './agentUtils'
import { validateAvailableAgents, validateNotExhaustedAgents, validateOnAssignmentAgents } from './validateAgents'
import { getRemainingTransportCap, validateMissionDeployment, getMissionById } from './missionUtils'
import { profiler } from '../primitives/profiler'

export type ValidationResult =
  | Readonly<{ isValid: true; errorMessage?: never }>
  | Readonly<{ isValid: false; errorMessage: string }>

export function validateHireAgent(gameState: GameState): ValidationResult {
  // Check if player has enough money to hire an agent
  if (gameState.money < AGENT_HIRE_COST) {
    return { isValid: false, errorMessage: 'Insufficient funds' }
  }

  // Validate agent cap (only count non-terminated agents)
  if (notTerminated(gameState.agents).length >= gameState.agentCap) {
    return {
      isValid: false,
      errorMessage: `Cannot hire more than ${gameState.agentCap} agents (agent cap reached)`,
    }
  }

  return { isValid: true }
}

export function validateSackAgents(gameState: GameState, agentIds: AgentId[]): ValidationResult {
  const validationResult = validateAvailableAgents(gameState.agents, agentIds)
  if (!validationResult.isValid) {
    return { isValid: false, errorMessage: validationResult.errorMessage }
  }
  return { isValid: true }
}

export function validateAssignToContracting(gameState: GameState, agentIds: AgentId[]): ValidationResult {
  // Validate that all selected agents are available
  const availabilityValidation = validateAvailableAgents(gameState.agents, agentIds)
  if (!availabilityValidation.isValid) {
    return { isValid: false, errorMessage: availabilityValidation.errorMessage }
  }

  // Validate that agents are not exhausted
  const exhaustionValidation = validateNotExhaustedAgents(gameState.agents, agentIds)
  if (!exhaustionValidation.isValid) {
    return { isValid: false, errorMessage: exhaustionValidation.errorMessage }
  }

  return { isValid: true }
}

export function validateAssignToTraining(gameState: GameState, agentIds: AgentId[]): ValidationResult {
  // Validate that all selected agents are available
  const availabilityValidation = validateAvailableAgents(gameState.agents, agentIds)
  if (!availabilityValidation.isValid) {
    return { isValid: false, errorMessage: availabilityValidation.errorMessage }
  }

  // Validate that agents are not exhausted
  const exhaustionValidation = validateNotExhaustedAgents(gameState.agents, agentIds)
  if (!exhaustionValidation.isValid) {
    return { isValid: false, errorMessage: exhaustionValidation.errorMessage }
  }

  // Count how many agents are already in training
  const agentsInTraining = onTrainingAssignment(gameState.agents).length
  const availableTrainingCap = gameState.trainingCap - agentsInTraining

  if (agentIds.length > availableTrainingCap) {
    return {
      isValid: false,
      errorMessage: `Cannot assign ${agentIds.length} agents to training. Only ${availableTrainingCap} training slots available.`,
    }
  }

  return { isValid: true }
}

export function validateRecallAgents(gameState: GameState, agentIds: AgentId[]): ValidationResult {
  // Check if all selected agents are in "OnAssignment" state
  const validationResult = validateOnAssignmentAgents(gameState.agents, agentIds)
  if (!validationResult.isValid) {
    return { isValid: false, errorMessage: validationResult.errorMessage }
  }
  return { isValid: true }
}

export function validateDeployAgents(
  gameState: GameState,
  missionId: MissionId,
  agentIds: AgentId[],
): ValidationResult {
  // Validate agents are available
  const availabilityValidation = validateAvailableAgents(gameState.agents, agentIds)
  if (!availabilityValidation.isValid) {
    return { isValid: false, errorMessage: availabilityValidation.errorMessage }
  }

  // Validate that agents are not exhausted
  const exhaustionValidation = validateNotExhaustedAgents(gameState.agents, agentIds)
  if (!exhaustionValidation.isValid) {
    return { isValid: false, errorMessage: exhaustionValidation.errorMessage }
  }

  // Validate transport cap
  const remainingTransportCap = getRemainingTransportCap(gameState.missions, gameState.transportCap)
  if (agentIds.length > remainingTransportCap) {
    return {
      isValid: false,
      errorMessage: `Cannot deploy ${agentIds.length} agents. Only ${remainingTransportCap} transport slots available.`,
    }
  }

  // Validate mission is available for deployment
  const mission = getMissionById(missionId, gameState)
  const missionValidation = validateMissionDeployment(mission)
  if (!missionValidation.isValid) {
    return { isValid: false, errorMessage: missionValidation.errorMessage }
  }

  return { isValid: true }
}

export function validateStartLeadInvestigation(gameState: GameState, agentIds: AgentId[]): ValidationResult {
  // Validate that all selected agents are available
  const availabilityValidation = validateAvailableAgents(gameState.agents, agentIds)
  if (!availabilityValidation.isValid) {
    return { isValid: false, errorMessage: availabilityValidation.errorMessage }
  }

  // Validate that agents are not exhausted
  const exhaustionValidation = validateNotExhaustedAgents(gameState.agents, agentIds)
  if (!exhaustionValidation.isValid) {
    return { isValid: false, errorMessage: exhaustionValidation.errorMessage }
  }

  return { isValid: true }
}

export const validateAddAgentsToInvestigation = profiler.wrap('A2.1_val', validateAddAgentsToInvestigationImpl)

function validateAddAgentsToInvestigationImpl(gameState: GameState, agentIds: AgentId[]): ValidationResult {
  // Validate that all selected agents are available
  const availabilityValidation = validateAvailableAgents(gameState.agents, agentIds)
  if (!availabilityValidation.isValid) {
    return { isValid: false, errorMessage: availabilityValidation.errorMessage }
  }

  // Validate that agents are not exhausted
  const exhaustionValidation = validateNotExhaustedAgents(gameState.agents, agentIds)
  if (!exhaustionValidation.isValid) {
    return { isValid: false, errorMessage: exhaustionValidation.errorMessage }
  }

  return { isValid: true }
}

export function validateBuyUpgrade(gameState: GameState, upgradeName: UpgradeName): ValidationResult {
  const upgradePrice = getUpgradePrice(upgradeName)
  if (gameState.money < upgradePrice) {
    return { isValid: false, errorMessage: 'Insufficient funds' }
  }
  return { isValid: true }
}
