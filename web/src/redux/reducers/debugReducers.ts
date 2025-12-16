import type { GameState } from '../../lib/model/gameStateModel'
import { toF6 } from '../../lib/primitives/fixed6'
import { offensiveMissionDefs } from '../../lib/collections/missions'
import { asPlayerAction } from '../reducer_utils/asPlayerAction'
import { bldMission } from '../../lib/game_utils/missionFactory'
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

export function spawnMissions(state: GameState): void {
  // Filter to only offensive mission definitions (apprehend/raid missions)
  const filteredOffensiveMissionDefs = offensiveMissionDefs.filter(
    (missionDef) => missionDef.id.startsWith('missiondef-apprehend') || missionDef.id.startsWith('missiondef-raid'),
  )

  for (const missionDef of filteredOffensiveMissionDefs) {
    bldMission({
      state,
      missionDefId: missionDef.id,
      expiresIn: missionDef.expiresIn,
      enemyCounts: missionDef.enemyCounts,
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
