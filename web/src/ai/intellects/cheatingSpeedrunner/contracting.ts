import type { PlayTurnAPI } from '../../../lib/model_utils/playTurnApiTypes'
import type { Agent } from '../../../lib/model/agentModel'
import { AGENT_CONTRACTING_INCOME } from '../../../lib/data_tables/constants'
import { f6floorToInt } from '../../../lib/primitives/fixed6'
import { getMoneyTurnDiff } from '../../../lib/ruleset/moneyRuleset'
import { sumAgentSkillBasedValues } from '../../../lib/ruleset/skillRuleset'
import { selectReadyAgents } from './agentAllocation'

export function fillContractingForCashFlow(api: PlayTurnAPI): void {
  const moneyTurnDiff = getMoneyTurnDiff(api.gameState)
  if (moneyTurnDiff >= 0) {
    return
  }

  const selectedAgents = selectAgentsForCashFlow(api, Math.abs(moneyTurnDiff))
  if (selectedAgents.length > 0) {
    api.assignAgentsToContracting(selectedAgents.map((agent) => agent.id))
  }
}

function selectAgentsForCashFlow(api: PlayTurnAPI, requiredIncome: number): Agent[] {
  const agents: Agent[] = []
  const readyAgents = selectReadyAgents(api.gameState, Number.POSITIVE_INFINITY)
  for (const agent of readyAgents) {
    agents.push(agent)
    if (getProjectedContractingIncome(agents) >= requiredIncome) {
      break
    }
  }
  return agents
}

function getProjectedContractingIncome(agents: readonly Agent[]): number {
  return f6floorToInt(sumAgentSkillBasedValues(agents, AGENT_CONTRACTING_INCOME))
}
