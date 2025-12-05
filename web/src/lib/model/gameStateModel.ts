import type { Fixed6 } from '../primitives/fixed6'
import type { TurnReport } from './turnReportModel'
import type { Agent } from './agentModel'
import type { Faction, LeadInvestigation, MissionSite } from './model'

export type GameState = {
  // Session
  turn: number
  actionsCount: number
  // Situation
  panic: Fixed6
  factions: Faction[]
  // Assets
  money: number
  intel: number // global intel (unused for leads, kept for backward compatibility)
  funding: number
  agents: Agent[]
  agentCap: number
  transportCap: number
  trainingCap: number
  trainingSkillGain: Fixed6
  exhaustionRecovery: number
  hitPointsRecoveryPct: Fixed6
  // Liabilities // KJA3 to remove, should be unused
  currentTurnTotalHireCost: number
  // Archive
  leadInvestigationCounts: Record<string, number>
  leadInvestigations: Record<string, LeadInvestigation> // track ongoing investigations
  missionSites: MissionSite[]
  // TurnReport of turn advancement from previous to current turn.
  turnStartReport?: TurnReport | undefined
}
