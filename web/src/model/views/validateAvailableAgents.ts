import type { Agent } from '../model'
import type { AgentsView } from './AgentsView'

export type ValidateAvailableAgentsResult = Readonly<{
  isValid: boolean
  errorMessage?: string
  nonAvailableAgents: readonly Agent[]
}>
function newValidateAvailableAgentsResult(result: {
  isValid: boolean
  errorMessage?: string
  nonAvailableAgents: readonly Agent[]
}): ValidateAvailableAgentsResult {
  return Object.freeze(result) as ValidateAvailableAgentsResult
}
export function validateAvailableAgents(
  agentsView: AgentsView,
  selectedAgentIds: string[],
): Readonly<{
  isValid: boolean
  errorMessage?: string
  nonAvailableAgents: readonly Agent[]
}> {
  const selectedViews = agentsView.withIds(selectedAgentIds)

  if (selectedViews.length === 0) {
    return newValidateAvailableAgentsResult({
      isValid: false,
      errorMessage: 'No agents selected!',
      nonAvailableAgents: [] as readonly Agent[],
    })
  }

  const nonAvailableAgents = selectedViews.notAvailable().toArray()

  if (nonAvailableAgents.length > 0) {
    return newValidateAvailableAgentsResult({
      isValid: false,
      errorMessage: 'This action can be done only on available agents!',
      nonAvailableAgents,
    })
  }

  return newValidateAvailableAgentsResult({
    isValid: true,
    nonAvailableAgents: [] as readonly Agent[],
  })
}
