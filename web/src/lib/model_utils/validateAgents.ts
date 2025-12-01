import type { Agent } from '../model/agentModel'
import type { AgentsView } from './AgentsView'
import { agentsWithIds, agentsNotAvailableFromArray, agentsNotOnAssignmentFromArray } from './gameStateUtils'

export type ValidateAgentsResult = Readonly<{
  isValid: boolean
  errorMessage?: string
  invalidAgents: readonly Agent[]
}>

export function validateAgents(
  agentsView: AgentsView,
  selectedAgentIds: string[],
  getInvalidSubset: (view: AgentsView) => AgentsView,
  invalidSelectionMessage: string,
): ValidateAgentsResult {
  const selectedView = agentsView.withIds(selectedAgentIds)

  let isValid = true
  let errorMessage: string | undefined = undefined
  let invalidAgents: readonly Agent[] = []

  if (selectedView.length === 0) {
    isValid = false
    errorMessage = 'No agents selected!'
  } else {
    const invalid = getInvalidSubset(selectedView).toAgentArray()
    if (invalid.length > 0) {
      isValid = false
      errorMessage = invalidSelectionMessage
      invalidAgents = invalid
    }
  }

  return { isValid, ...(errorMessage !== undefined ? { errorMessage } : {}), invalidAgents }
}

export function validateAvailableAgents(agentsView: AgentsView, selectedAgentIds: string[]): ValidateAgentsResult {
  return validateAgents(
    agentsView,
    selectedAgentIds,
    (view) => view.notAvailable(),
    'This action can be done only on available agents!',
  )
}

export function validateOnAssignmentAgents(agentsView: AgentsView, selectedAgentIds: string[]): ValidateAgentsResult {
  return validateAgents(
    agentsView,
    selectedAgentIds,
    (view) => view.notOnAssignment(),
    'This action can be done only on OnAssignment or InTraining agents!',
  )
}

// V2 versions that work with Agent[] directly
// KJA dedup / remove V1

export function validateAgentsV2(
  agents: Agent[],
  selectedAgentIds: string[],
  getInvalidSubset: (agents: Agent[]) => Agent[],
  invalidSelectionMessage: string,
): ValidateAgentsResult {
  const selectedAgents = agentsWithIds(agents, selectedAgentIds)

  let isValid = true
  let errorMessage: string | undefined = undefined
  let invalidAgents: readonly Agent[] = []

  if (selectedAgents.length === 0) {
    isValid = false
    errorMessage = 'No agents selected!'
  } else {
    const invalid = getInvalidSubset(selectedAgents)
    if (invalid.length > 0) {
      isValid = false
      errorMessage = invalidSelectionMessage
      invalidAgents = invalid
    }
  }

  return { isValid, ...(errorMessage !== undefined ? { errorMessage } : {}), invalidAgents }
}

export function validateAvailableAgentsV2(agents: Agent[], selectedAgentIds: string[]): ValidateAgentsResult {
  return validateAgentsV2(
    agents,
    selectedAgentIds,
    (selectedAgents) => agentsNotAvailableFromArray(selectedAgents),
    'This action can be done only on available agents!',
  )
}

export function validateOnAssignmentAgentsV2(agents: Agent[], selectedAgentIds: string[]): ValidateAgentsResult {
  return validateAgentsV2(
    agents,
    selectedAgentIds,
    (selectedAgents) => agentsNotOnAssignmentFromArray(selectedAgents),
    'This action can be done only on OnAssignment or InTraining agents!',
  )
}
