import { recovering } from '../../lib/model_utils/agentUtils'
import {
  isAwayAgentForLeadsPanel,
  isExhaustedAgentForLeadsPanel,
  isReadyAgentForLeadsPanel,
} from '../../lib/model_utils/agentReadinessUtils'
import type { Agent } from '../../lib/model/agentModel'

export type AgentCounts = {
  allActive: number
  available: number
  ready: number
  exhausted: number
  recovering: number
  stats: number
  terminated: number
  kia: number
  sacked: number
}

export type AgentsForLeadsGridTitleCounts = {
  ready: number
  away: number
  exhausted: number
  recovering: number
  allActive: number
}

/** Counts for the Agents (leads screen) grid title; buckets match that grid's toolbar filters. */
export function calculateAgentsForLeadsGridTitleCounts(agents: readonly Agent[]): AgentsForLeadsGridTitleCounts {
  let ready = 0
  let away = 0
  let exhausted = 0
  let recovering = 0
  let allActive = 0

  for (const agent of agents) {
    if (agent.state === 'KIA' || agent.state === 'Sacked') {
      continue
    }

    allActive += 1

    if (agent.state === 'Recovering') {
      recovering += 1
    }

    if (isReadyAgentForLeadsPanel(agent)) {
      ready += 1
    }

    if (isAwayAgentForLeadsPanel(agent)) {
      away += 1
    }

    if (isExhaustedAgentForLeadsPanel(agent)) {
      exhausted += 1
    }
  }

  return { ready, away, exhausted, recovering, allActive }
}

export function calculateAgentCounts(agents: Agent[]): AgentCounts {
  let allActive = 0
  let availableCount = 0
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

    if (agent.state === 'Available' || agent.state === 'InTraining') {
      availableCount += 1
    }

    if (isReadyAgentForLeadsPanel(agent)) {
      ready += 1
    } else if (isExhaustedAgentForLeadsPanel(agent)) {
      exhausted += 1
    }
  }

  const recoveringCount = recovering(agents).length

  return {
    allActive,
    available: availableCount,
    ready,
    exhausted,
    recovering: recoveringCount,
    stats: allActive,
    terminated: kia + sacked,
    kia,
    sacked,
  }
}
