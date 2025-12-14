import type { Fixed6 } from '../primitives/fixed6'
import type { TurnReport } from './turnReportModel'
import type { Agent } from './agentModel'
import type { Faction } from './model'
import type { LeadInvestigation } from './leadModel'
import type { MissionSite } from './missionSiteModel'

export type GameState = {
  // Session
  turn: number
  actionsCount: number
  // Situation
  panic: Fixed6
  factions: Faction[]
  // Assets
  money: number
  funding: number
  agents: Agent[]
  agentCap: number
  transportCap: number
  trainingCap: number
  trainingSkillGain: Fixed6
  exhaustionRecovery: number
  hitPointsRecoveryPct: Fixed6
  weaponDamage: number
  // Archive
  leadInvestigationCounts: Record<string, number>
  leadInvestigations: Record<string, LeadInvestigation> // track ongoing investigations
  missionSites: MissionSite[]
  // TurnReport of turn advancement from previous to current turn.
  turnStartReport?: TurnReport | undefined
}
