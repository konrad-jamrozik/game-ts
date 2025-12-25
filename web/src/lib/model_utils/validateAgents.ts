import type { Agent } from '../model/agentModel'
import { withIds, notAvailable, notOnAssignment } from './agentUtils'
import { f6c100, f6ge } from '../primitives/fixed6'

export type ValidateAgentsResult = Readonly<{
  isValid: boolean
  errorMessage?: string
  invalidAgents: readonly Agent[]
}>

export function validateAgents(
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

export function validateAvailableAgents(agents: Agent[], selectedAgentIds: string[]): ValidateAgentsResult {
  return validateAgents(
    agents,
    selectedAgentIds,
    (selectedAgents) => notAvailable(selectedAgents),
    'This action can be done only on available agents!',
  )
}

export function validateOnAssignmentAgents(agents: Agent[], selectedAgentIds: string[]): ValidateAgentsResult {
  return validateAgents(
    agents,
    selectedAgentIds,
    (selectedAgents) => notOnAssignment(selectedAgents),
    'This action can be done only on OnAssignment or InTraining agents!',
  )
}

export function exhaustedAgents(agents: Agent[]): Agent[] {
  return agents.filter((agent) => f6ge(agent.exhaustionPct, f6c100))
}

export function validateNotExhaustedAgents(agents: Agent[], selectedAgentIds: string[]): ValidateAgentsResult {
  return validateAgents(
    agents,
    selectedAgentIds,
    (selectedAgents) => exhaustedAgents(selectedAgents),
    'Agents with exhaustion of 100 or more cannot be assigned!',
  )
}
