import type { GameState } from '../../lib/model/gameStateModel'
import { toF6 } from '../../lib/primitives/fixed6'
import { dataTables } from '../../lib/data_tables/dataTables'
import { asPlayerAction } from '../reducer_utils/asPlayerAction'
import { bldMission } from '../../lib/factories/missionFactory'
import { bldAgent } from '../../lib/factories/agentFactory'
import { bldWeapon } from '../../lib/factories/weaponFactory'

function addMoney(state: GameState): void {
  state.money += 10_000
}

function spawn10Agents(state: GameState): void {
  for (let index = 0; index < 10; index += 1) {
    // Skills: 120, 140, 160, 180, 200, 220, 240, 260, 280, 300 (incrementing by 20)
    const skill = toF6(120 + index * 20)

    const newAgent = bldAgent({
      agentCount: state.agents.length,
      turnHired: state.turn,
      weapon: bldWeapon({ damage: state.weaponDamage }),
      state: 'Available',
      assignment: 'Standby',
      skill,
    })
    state.agents.push(newAgent)
  }
}

function addCapabilities(state: GameState): void {
  state.agentCap += 100
  state.transportCap += 100
  state.trainingCap += 100
}

export function spawnMissions(state: GameState): void {
  // Filter to only offensive mission data (apprehend/raid missions)
  const filteredOffensiveMissionData = dataTables.offensiveMissions.filter(
    (missionData) =>
      missionData.id.startsWith('missiondata-apprehend') || missionData.id.startsWith('missiondata-raid'),
  )

  for (const missionData of filteredOffensiveMissionData) {
    const newMission = bldMission({
      missionCount: state.missions.length,
      missionDataId: missionData.id,
    })
    state.missions.push(newMission)
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

export const debugSpawnMissions = asPlayerAction((state: GameState) => {
  spawnMissions(state)
})

export const debugAddEverything = asPlayerAction((state: GameState) => {
  addMoney(state)
  addCapabilities(state)
  spawn10Agents(state)
  spawn10Agents(state)
  spawn10Agents(state)
  spawn10Agents(state)
  spawnMissions(state)
  markLeadAsInvestigated(state, 'lead-red-dawn-profile')
  markLeadAsInvestigated(state, 'lead-exalt-profile')
  markLeadAsInvestigated(state, 'lead-black-lotus-profile')
})

function markLeadAsInvestigated(state: GameState, leadId: string): void {
  const currentCount = state.leadInvestigationCounts[leadId] ?? 0
  state.leadInvestigationCounts[leadId] = currentCount + 1
}
