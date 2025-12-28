import type { GameState } from '../model/gameStateModel'
import type { BasicIntellectState } from '../../redux/slices/aiStateSlice'
import type { UpgradeName } from '../data_tables/upgrades'
import type { AgentId, LeadId, LeadInvestigationId, MissionId } from '../model/modelIds'
import type { ActionResult } from './playerActionsApiTypes'

export type { ActionResult }

export type PlayTurnAPI = {
  gameState: GameState
  aiState: BasicIntellectState
  hireAgent(): ActionResult
  sackAgents(agentIds: AgentId[]): ActionResult
  assignAgentsToContracting(agentIds: AgentId[]): ActionResult
  assignAgentsToTraining(agentIds: AgentId[]): ActionResult
  recallAgents(agentIds: AgentId[]): ActionResult
  startLeadInvestigation(params: { leadId: LeadId; agentIds: AgentId[] }): ActionResult
  addAgentsToInvestigation(params: { investigationId: LeadInvestigationId; agentIds: AgentId[] }): ActionResult
  deployAgentsToMission(params: { missionId: MissionId; agentIds: AgentId[] }): ActionResult
  buyUpgrade(upgradeName: UpgradeName): ActionResult
  incrementActualWeaponDamageUpgrades(): void
  incrementActualTrainingSkillGainUpgrades(): void
  incrementActualExhaustionRecoveryUpgrades(): void
  incrementActualHitPointsRecoveryUpgrades(): void
  increaseDesiredCounts(): void
}
