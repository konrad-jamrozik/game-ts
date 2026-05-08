import type { GameState } from '../model/gameStateModel'
import type { AgentId, MissionId } from '../model/modelIds'
import { AGENT_HIRE_COST } from '../data_tables/constants'
import { getUpgradePrice, type UpgradeName } from '../data_tables/upgrades'
import { onTrainingAssignment } from './agentUtils'
import {
  validateAgents,
  validateAvailableAgents,
  validateNotExhaustedAgents,
  validateOnAssignmentAgents,
} from './validateAgents'
import { getRemainingTransportCap, validateMissionDeployment, getMissionById } from './missionUtils'
import { f6ge, toF6 } from '../primitives/fixed6'

export type ValidationResult =
  | Readonly<{ isValid: true; errorMessage?: never }>
  | Readonly<{ isValid: false; errorMessage: string }>

export function validateHireAgent(gameState: GameState): ValidationResult {
  // Check if player has enough money to hire an agent
  if (gameState.money < AGENT_HIRE_COST) {
    return { isValid: false, errorMessage: 'Insufficient funds' }
  }

  // Validate agent cap
  if (gameState.agents.length >= gameState.agentCap) {
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
  // Check if all selected agents are in Contracting, Investigating, or InTraining state
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
  return validateLeadInvestigationAgents(gameState, agentIds)
}

export function validateAddAgentsToInvestigation(gameState: GameState, agentIds: AgentId[]): ValidationResult {
  return validateLeadInvestigationAgents(gameState, agentIds)
}

export function validateBuyUpgrade(gameState: GameState, upgradeName: UpgradeName): ValidationResult {
  const upgradePrice = getUpgradePrice(upgradeName)
  if (gameState.money < upgradePrice) {
    return { isValid: false, errorMessage: 'Insufficient funds' }
  }
  return { isValid: true }
}

function validateLeadInvestigationAgents(gameState: GameState, agentIds: AgentId[]): ValidationResult {
  const validation = validateAgents(
    gameState.agents,
    agentIds,
    (selectedAgents) =>
      selectedAgents.filter(
        (agent) =>
          (agent.assignment !== 'Standby' && agent.assignment !== 'Training') ||
          agent.state === 'InTransit' ||
          f6ge(agent.exhaustionPct, toF6(30)),
      ),
    'Lead investigations require non-transiting Standby or Training agents with exhaustion below 30.',
  )

  if (!validation.isValid) {
    return { isValid: false, errorMessage: validation.errorMessage }
  }

  return { isValid: true }
}
