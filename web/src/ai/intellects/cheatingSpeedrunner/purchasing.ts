import type { PlayTurnAPI } from '../../../lib/model_utils/playTurnApiTypes'
import { AGENT_HIRE_COST } from '../../../lib/data_tables/constants'
import { getUpgradePrice, type UpgradeName } from '../../../lib/data_tables/upgrades'
import { getAgentUpkeep } from '../../../lib/ruleset/moneyRuleset'
import { MONEY_SAFETY_FLOOR_TURNS, TARGET_AGENT_COUNT, TARGET_TRANSPORT_CAP } from './constants'

export function spendMoney(api: PlayTurnAPI): void {
  buyCapToTarget(api, 'Agent cap', TARGET_AGENT_COUNT, () => api.gameState.agentCap)
  buyCapToTarget(api, 'Transport cap', TARGET_TRANSPORT_CAP, () => api.gameState.transportCap)
  hireAgentsToTarget(api)
}

function buyCapToTarget(
  api: PlayTurnAPI,
  upgradeName: UpgradeName,
  targetValue: number,
  readCurrentValue: () => number,
): void {
  const price = getUpgradePrice(upgradeName)
  while (readCurrentValue() < targetValue && canSpend(api, price)) {
    api.buyUpgrade(upgradeName)
  }
}

function hireAgentsToTarget(api: PlayTurnAPI): void {
  while (
    api.gameState.agents.length < TARGET_AGENT_COUNT &&
    api.gameState.agents.length < api.gameState.agentCap &&
    canSpend(api, AGENT_HIRE_COST)
  ) {
    api.hireAgent()
  }
}

function canSpend(api: PlayTurnAPI, price: number): boolean {
  return api.gameState.money - price >= getMoneySafetyFloor(api)
}

function getMoneySafetyFloor(api: PlayTurnAPI): number {
  return getAgentUpkeep(api.gameState) * MONEY_SAFETY_FLOOR_TURNS
}
