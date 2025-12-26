import type { GameState } from '../lib/model/gameStateModel'
import type { UpgradeName } from '../lib/data_tables/upgrades'

export type AIPlayerIntellect = {
  name: string
  playTurn(api: PlayTurnAPI): void
}

export type PlayTurnAPI = {
  gameState: GameState
  hireAgent(): void
  sackAgents(agentIds: string[]): void
  assignAgentsToContracting(agentIds: string[]): void
  assignAgentsToTraining(agentIds: string[]): void
  recallAgents(agentIds: string[]): void
  startLeadInvestigation(params: { leadId: string; agentIds: string[] }): void
  addAgentsToInvestigation(params: { investigationId: string; agentIds: string[] }): void
  deployAgentsToMission(params: { missionId: string; agentIds: string[] }): void
  buyUpgrade(upgradeName: UpgradeName): void
}
