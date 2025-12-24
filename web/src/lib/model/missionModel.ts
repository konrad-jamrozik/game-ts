import type { Fixed6 } from '../primitives/fixed6'
import type { MissionState } from './outcomeTypes'
import type { AgentId } from './agentModel'
import type { Enemy } from './enemyModel'
import type { FactionId } from './factionModel'

export type { MissionState } from './outcomeTypes'

export type MissionId = `mission-${string}`

export type MissionDataId = `missiondata-${string}`

export type FactionRewards = {
  factionId: FactionId
  /**
   * Suppression delays the next faction operation roll by a set number of turns.
   * E.g., suppression: 5 means delay by 5 turns.
   */
  suppression?: number
}

export type MissionRewards = {
  money?: number
  funding?: number
  panicReduction?: Fixed6
  factionRewards?: FactionRewards[]
}

export type Mission = {
  id: MissionId
  missionDataId: MissionDataId
  agentIds: AgentId[]
  state: MissionState
  expiresIn: number | 'never'
  enemies: Enemy[] // Enemies present at the mission
  /**
   * The operation level that spawned this mission.
   * - undefined = Offensive missions (apprehend/raid) - no penalties on expiration
   * - 1-6 = Defensive missions (faction operations) - penalties apply on expiration
   * Used to calculate penalties when mission expires.
   */
  operationLevel?: number | undefined
}
