import type { Agent } from '../model'
import type { AgentsView } from './AgentsView'

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
    'This action can be done only on OnAssignment agents!',
  )
}
