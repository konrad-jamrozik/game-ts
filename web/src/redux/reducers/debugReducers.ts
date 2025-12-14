import type { Agent } from '../../lib/model/agentModel'
import type { GameState } from '../../lib/model/gameStateModel'
import { toF6 } from '../../lib/primitives/fixed6'
import { AGENT_INITIAL_EXHAUSTION, AGENT_INITIAL_HIT_POINTS } from '../../lib/ruleset/constants'
import { bldWeapon } from '../../lib/ruleset/weaponRuleset'
import { offensiveMissions } from '../../lib/collections/missions'
import { asPlayerAction } from '../reducer_utils/asPlayerAction'
import { formatAgentId } from '../reducer_utils/agentIdUtils'
import { bldMissionSite } from '../../lib/game_utils/missionSiteFactory'

function addMoney(state: GameState): void {
  state.money += 10_000
}

function spawn10Agents(state: GameState): void {
  const nextAgentNumericId = state.agents.length

  for (let index = 0; index < 10; index += 1) {
    const agentNumericId = nextAgentNumericId + index
    const agentId = formatAgentId(agentNumericId)
    // Skills: 120, 140, 160, 180, 200, 220, 240, 260, 280, 300 (incrementing by 20)
    const skill = toF6(120 + index * 20)

    const newAgent: Agent = {
      id: agentId,
      turnHired: state.turn,
      state: 'Available',
      assignment: 'Standby',
      skill,
      exhaustionPct: AGENT_INITIAL_EXHAUSTION,
      hitPoints: toF6(AGENT_INITIAL_HIT_POINTS),
      maxHitPoints: AGENT_INITIAL_HIT_POINTS,
      hitPointsLostBeforeRecovery: toF6(0),
      missionsTotal: 0,
      skillFromTraining: toF6(0),
      weapon: bldWeapon(state.weaponDamage),
    }

    state.agents.push(newAgent)
  }
}

function addCapabilities(state: GameState): void {
  state.agentCap += 100
  state.transportCap += 100
  state.trainingCap += 100
}

export function spawnMissionSites(state: GameState): void {
  // Filter to only offensive missions (apprehend/raid missions)
  const filteredOffensiveMissions = offensiveMissions.filter(
    (mission) => mission.id.startsWith('mission-apprehend') || mission.id.startsWith('mission-raid'),
  )

  for (const mission of filteredOffensiveMissions) {
    bldMissionSite({
      state,
      missionId: mission.id,
      expiresIn: mission.expiresIn,
      enemyUnitsSpec: mission.enemyUnitsSpec,
    })
  }
}

export const debugSetPanicToZero = asPlayerAction((state: GameState) => {
  state.panic = toF6(0)
})

export const debugSetAllFactionsSuppression = asPlayerAction((state: GameState) => {
  // Set suppression to 100 turns for all factions
  for (const faction of state.factions) {
    faction.suppressionTurns = 100
  }
})

export const debugAddMoney = asPlayerAction((state: GameState) => {
  addMoney(state)
})

export const debugSpawn10Agents = asPlayerAction((state: GameState) => {
  spawn10Agents(state)
})

export const debugAddCapabilities = asPlayerAction((state: GameState) => {
  addCapabilities(state)
})

export const debugSpawnMissionSites = asPlayerAction((state: GameState) => {
  spawnMissionSites(state)
})

export const debugAddEverything = asPlayerAction((state: GameState) => {
  addMoney(state)
  addCapabilities(state)
  spawn10Agents(state)
  spawn10Agents(state)
  spawn10Agents(state)
  spawn10Agents(state)
  spawnMissionSites(state)
  markLeadAsInvestigated(state, 'lead-red-dawn-profile')
  markLeadAsInvestigated(state, 'lead-exalt-profile')
  markLeadAsInvestigated(state, 'lead-black-lotus-profile')
})

function markLeadAsInvestigated(state: GameState, leadId: string): void {
  const currentCount = state.leadInvestigationCounts[leadId] ?? 0
  state.leadInvestigationCounts[leadId] = currentCount + 1
}
