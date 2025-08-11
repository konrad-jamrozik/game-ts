import type { Agent } from '../model'
import type { AgentsView } from './AgentsView'

export type ValidateOnAssignmentAgentsResult = Readonly<{
  isValid: boolean
  errorMessage?: string
  nonOnAssignmentAgents: readonly Agent[]
}>

export function validateOnAssignmentAgents(
  agentsView: AgentsView,
  selectedAgentIds: string[],
): ValidateOnAssignmentAgentsResult {
  const selectedViews = agentsView.withIds(selectedAgentIds)

  let isValid = true
  let errorMessage: string | undefined = undefined
  let nonOnAssignmentAgents: readonly Agent[] = []

  if (selectedViews.length === 0) {
    isValid = false
    errorMessage = 'No agents selected!'
  } else {
    const notOnAssignment = selectedViews.notOnAssignment().toAgentArray()
    if (notOnAssignment.length > 0) {
      isValid = false
      errorMessage = 'This action can be done only on OnAssignment agents!'
      nonOnAssignmentAgents = notOnAssignment
    }
  }

  return { isValid, ...(errorMessage !== undefined ? { errorMessage } : {}), nonOnAssignmentAgents }
}
