import type { AgentId } from '../../lib/model/agentModel'

/**
 * Formats a numeric agent ID into the standard agent ID format.
 * @param numericId - The numeric ID (e.g., 0, 1, 2, ...)
 * @returns The formatted agent ID (e.g., "agent-000", "agent-001", "agent-002")
 */
export function formatAgentId(numericId: number): AgentId {
  return `agent-${numericId.toString().padStart(3, '0')}`
}
