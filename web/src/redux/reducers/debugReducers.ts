import type { GameState } from '../../lib/model/gameStateModel'
import { toF6 } from '../../lib/primitives/fixed6'
import { offensiveMissions } from '../../lib/collections/missions'
import { asPlayerAction } from '../reducer_utils/asPlayerAction'
import { bldMissionSite } from '../../lib/game_utils/missionSiteFactory'
import { bldAgent } from '../../lib/game_utils/agentFactory'

function addMoney(state: GameState): void {
  state.money += 10_000
}

function spawn10Agents(state: GameState): void {
  for (let index = 0; index < 10; index += 1) {
    // Skills: 120, 140, 160, 180, 200, 220, 240, 260, 280, 300 (incrementing by 20)
    const skill = toF6(120 + index * 20)

    bldAgent({
      state,
      turnHired: state.turn,
      weaponDamage: state.weaponDamage,
      agentState: 'Available',
      assignment: 'Standby',
      skill,
    })
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
