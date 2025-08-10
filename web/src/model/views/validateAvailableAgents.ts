import type { Agent } from '../model'
import type { AgentsView } from './AgentsView'

export type ValidateAvailableAgentsResult = Readonly<{
  isValid: boolean
  errorMessage?: string
  nonAvailableAgents: readonly Agent[]
}>

export function validateAvailableAgents(
  agentsView: AgentsView,
  selectedAgentIds: string[],
): ValidateAvailableAgentsResult {
  const selectedViews = agentsView.withIds(selectedAgentIds)

  let isValid = true
  let errorMessage: string | undefined = undefined
  let nonAvailableAgents: readonly Agent[] = []

  if (selectedViews.length === 0) {
    isValid = false
    errorMessage = 'No agents selected!'
  } else {
    const unavailable = selectedViews.notAvailable().toAgentArray()
    if (unavailable.length > 0) {
      isValid = false
      errorMessage = 'This action can be done only on available agents!'
      nonAvailableAgents = unavailable
    }
  }

  return { isValid, ...(errorMessage !== undefined ? { errorMessage } : {}), nonAvailableAgents }
}
