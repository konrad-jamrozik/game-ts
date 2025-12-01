import type { Agent } from '../model/agentModel'
import { withIds, notAvailable, notOnAssignment } from './agentUtils'

export type ValidateAgentsResult = Readonly<{
  isValid: boolean
  errorMessage?: string
  invalidAgents: readonly Agent[]
}>

// V2 versions that work with Agent[] directly

export function validateAgentsV2(
  agents: Agent[],
  selectedAgentIds: string[],
  getInvalidSubset: (agents: Agent[]) => Agent[],
  invalidSelectionMessage: string,
): ValidateAgentsResult {
  const selectedAgents = withIds(agents, selectedAgentIds)

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
    (selectedAgents) => notAvailable(selectedAgents),
    'This action can be done only on available agents!',
  )
}

export function validateOnAssignmentAgentsV2(agents: Agent[], selectedAgentIds: string[]): ValidateAgentsResult {
  return validateAgentsV2(
    agents,
    selectedAgentIds,
    (selectedAgents) => notOnAssignment(selectedAgents),
    'This action can be done only on OnAssignment or InTraining agents!',
  )
}
