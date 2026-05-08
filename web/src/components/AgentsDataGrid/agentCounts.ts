import { recovering } from '../../lib/model_utils/agentUtils'
import type { Agent } from '../../lib/model/agentModel'
import { f6ge, f6le, f6lt, toF6, type Fixed6 } from '../../lib/primitives/fixed6'

export type AgentCounts = {
  allActive: number
  ready: number
  exhausted: number
  recovering: number
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

    if (matchesLeadsGridTitleReady(agent)) {
      ready += 1
    }

    if (matchesLeadsGridTitleAway(agent)) {
      away += 1
    }

    if (matchesLeadsGridTitleExhausted(agent)) {
      exhausted += 1
    }
  }

  return { ready, away, exhausted, recovering, allActive }
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

const EXHAUSTION_THRESHOLD: Fixed6 = toF6(5)
const LEADS_AGENTS_GRID_EXHAUSTION_EXHAUSTED_AT: Fixed6 = toF6(30)

function matchesLeadsGridTitleAway(agent: Agent): boolean {
  return (
    agent.assignment !== 'Recovery' &&
    (agent.state === 'InTransit' ||
      agent.state === 'Contracting' ||
      agent.state === 'Investigating' ||
      agent.state === 'OnMission')
  )
}

function matchesLeadsGridTitleReady(agent: Agent): boolean {
  return (
    (agent.assignment === 'Standby' || agent.assignment === 'Training') &&
    agent.state !== 'InTransit' &&
    f6lt(agent.exhaustionPct, LEADS_AGENTS_GRID_EXHAUSTION_EXHAUSTED_AT)
  )
}

function matchesLeadsGridTitleExhausted(agent: Agent): boolean {
  return (
    (agent.assignment === 'Standby' || agent.assignment === 'Training') &&
    agent.state !== 'InTransit' &&
    f6ge(agent.exhaustionPct, LEADS_AGENTS_GRID_EXHAUSTION_EXHAUSTED_AT)
  )
}
