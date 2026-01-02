import type { Agent } from '../../lib/model/agentModel'
import { toF6, f6le, type Fixed6 } from '../../lib/primitives/fixed6'
import { recovering } from '../../lib/model_utils/agentUtils'

const EXHAUSTION_THRESHOLD: Fixed6 = toF6(5)

export type AgentCounts = {
  allActive: number
  ready: number
  exhausted: number
  recovering: number
  kia: number
  sacked: number
}

export function calculateAgentCounts(agents: Agent[]): AgentCounts {
  let allActive = 0
  let ready = 0
  let exhausted = 0
  let kia = 0
  let sacked = 0

  for (const agent of agents) {
    if (agent.state === 'KIA') {
      kia += 1
      continue
    }
    if (agent.state === 'Sacked') {
      sacked += 1
      continue
    }

    allActive += 1

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

  const recoveringCount = recovering(agents).length

  return {
    allActive,
    ready,
    exhausted,
    recovering: recoveringCount,
    kia,
    sacked,
  }
}
