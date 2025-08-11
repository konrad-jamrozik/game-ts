import { AGENT_CONTRACTING_INCOME, AGENT_ESPIONAGE_INTEL, AGENT_UPKEEP_COST } from '../ruleset/constants'
import { floor } from '../utils/mathUtils'
import type { AgentsView } from './views/AgentsView'

export function getAgentUpkeep(agents: AgentsView): number {
  return agents.notTerminated().length * AGENT_UPKEEP_COST
}

export function getContractingIncome(agents: AgentsView): number {
  const contractingAgents = agents.onContractingAssignment()
  let total = 0
  for (const agent of contractingAgents) {
    const effectiveSkill = agent.effectiveSkill()
    total += floor((AGENT_CONTRACTING_INCOME * effectiveSkill) / 100)
  }
  return total
}

export function getEspionageIntel(agents: AgentsView): number {
  const espionageAgents = agents.onEspionageAssignment()
  let total = 0
  for (const agent of espionageAgents) {
    const effectiveSkill = agent.effectiveSkill()
    total += floor((AGENT_ESPIONAGE_INTEL * effectiveSkill) / 100)
  }
  return total
}
