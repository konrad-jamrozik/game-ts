import type { Agent } from '../../lib/model/agentModel'
import { toF6, f6le, type Fixed6 } from '../../lib/primitives/fixed6'
import { notTerminated } from '../../lib/model_utils/agentUtils'

const EXHAUSTION_THRESHOLD: Fixed6 = toF6(5)

export type AgentCounts = {
  allActive: number
  ready: number
  exhausted: number
  kia: number
  sacked: number
}

export function calculateAgentCounts(agents: Agent[]): AgentCounts {
  const allActive = notTerminated(agents).length

  let ready = 0
  let exhausted = 0

  for (const agent of agents) {
    const isAvailableOrTraining =
      agent.state === 'Available' || (agent.state === 'InTraining' && agent.assignment === 'Training')

    if (isAvailableOrTraining) {
      if (f6le(agent.exhaustionPct, EXHAUSTION_THRESHOLD)) {
        ready += 1
      } else {
        exhausted += 1
      }
    }
  }

  const kia = agents.filter((agent) => agent.state === 'KIA').length
  const sacked = agents.filter((agent) => agent.state === 'Sacked').length

  return {
    allActive,
    ready,
    exhausted,
    kia,
    sacked,
  }
}
