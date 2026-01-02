import type { UpgradeName } from '../data_tables/upgrades'
import type { AgentId, LeadId, LeadInvestigationId, MissionId } from '../model/modelIds'
import type { GameState } from '../model/gameStateModel'

export type ActionResult = Readonly<{ success: true }> | Readonly<{ success: false; errorMessage: string }>

export type PlayerActionsAPI = {
  hireAgent(gameState: GameState): ActionResult
  sackAgents(gameState: GameState, agentIds: AgentId[]): ActionResult
  assignAgentsToContracting(gameState: GameState, agentIds: AgentId[]): ActionResult
  assignAgentsToTraining(gameState: GameState, agentIds: AgentId[]): ActionResult
  recallAgents(gameState: GameState, agentIds: AgentId[]): ActionResult
  startLeadInvestigation(gameState: GameState, params: { leadId: LeadId; agentIds: AgentId[] }): ActionResult
  // KJA temp addAgentsToInvestigationPlayerActionsApi
  addAgentsToInvestigationPlayerActionsApi(
    gameState: GameState,
    params: { investigationId: LeadInvestigationId; agentIds: AgentId[] },
  ): ActionResult
  deployAgentsToMission(gameState: GameState, params: { missionId: MissionId; agentIds: AgentId[] }): ActionResult
  buyUpgrade(gameState: GameState, upgradeName: UpgradeName): ActionResult
}
