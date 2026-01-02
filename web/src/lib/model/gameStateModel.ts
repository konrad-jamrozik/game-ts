import type { Fixed6 } from '../primitives/fixed6'
import type { TurnReport } from './turnReportModel'
import type { Agent } from './agentModel'
import type { Faction } from './factionModel'
import type { LeadInvestigation } from './leadModel'
import type { Mission } from './missionModel'

export type GameState = {
  turn: number
  // Metadata
  actionsCount: number
  totalAgentsHired: number // Used to generate next agent ID.
  // Situation
  panic: Fixed6
  factions: Faction[]
  // Assets
  money: number
  funding: number
  agents: Agent[]
  terminatedAgents: Agent[]
  agentCap: number
  transportCap: number
  trainingCap: number
  trainingSkillGain: Fixed6
  exhaustionRecovery: Fixed6
  hitPointsRecoveryPct: Fixed6
  weaponDamage: number
  // Archive
  leadInvestigationCounts: Record<string, number>
  leadInvestigations: Record<string, LeadInvestigation> // track ongoing investigations
  missions: Mission[]
  // TurnReport of turn advancement from previous to current turn.
  turnStartReport?: TurnReport | undefined
}
