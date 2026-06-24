import type { GameState } from '../../lib/model/gameStateModel'
import type { Lead } from '../../lib/model/leadModel'
import type { Mission } from '../../lib/model/missionModel'
import { getAvailableLeadsForInvestigation, getLeadById } from '../../lib/model_utils/leadUtils'
import { getMissionDataById } from '../../lib/model_utils/missionUtils'
import type { EventNavigationTarget } from './eventsSlice'

export type WorldEventLogMessage = {
  message: string
  navigationTarget: EventNavigationTarget
}

export function getWorldEventLogMessages(previousGameState: GameState, gameState: GameState): WorldEventLogMessage[] {
  return [
    ...getNewMissionEvents(previousGameState, gameState),
    ...getExpiringMissionEvents(previousGameState, gameState),
    ...getMissionResolutionEvents(previousGameState, gameState),
    ...getInvestigationResolutionEvents(previousGameState, gameState),
    ...getNewLeadEvents(previousGameState, gameState),
  ]
}

function getNewMissionEvents(previousGameState: GameState, gameState: GameState): WorldEventLogMessage[] {
  const previousMissionIds = new Set(previousGameState.missions.map((mission) => mission.id))
  return gameState.missions
    .filter((mission) => mission.state === 'Active' && !previousMissionIds.has(mission.id))
    .map((mission) => ({
      message: `New mission site available: ${getMissionName(mission)}. ${formatMissionExpiration(mission)}`,
      navigationTarget: { type: 'MissionsDrilldown', filter: 'all' },
    }))
}

function getExpiringMissionEvents(previousGameState: GameState, gameState: GameState): WorldEventLogMessage[] {
  return gameState.missions.flatMap((mission) => {
    const previousMission = previousGameState.missions.find((candidate) => candidate.id === mission.id)
    if (
      previousMission?.state !== 'Active' ||
      mission.state !== 'Active' ||
      typeof previousMission.expiresIn !== 'number' ||
      typeof mission.expiresIn !== 'number' ||
      previousMission.expiresIn === mission.expiresIn ||
      mission.expiresIn > 3
    ) {
      return []
    }
    return [
      {
        message: `Expires in ${mission.expiresIn} turns: ${getMissionName(mission)}`,
        navigationTarget: { type: 'MissionsDrilldown', filter: 'expiringSoon' },
      },
    ]
  })
}

function getMissionResolutionEvents(previousGameState: GameState, gameState: GameState): WorldEventLogMessage[] {
  return gameState.missions.flatMap((mission) => {
    const previousMission = previousGameState.missions.find((candidate) => candidate.id === mission.id)
    if (previousMission?.state !== 'Deployed') {
      return []
    }
    if (mission.state === 'Won') {
      return [
        {
          message: `Mission successful: ${getMissionName(mission)}`,
          navigationTarget: { type: 'MissionsDrilldown', filter: 'archived' },
        },
      ]
    }
    if (mission.state === 'Retreated' || mission.state === 'Wiped') {
      return [
        {
          message: `Mission failed: ${getMissionName(mission)}`,
          navigationTarget: { type: 'MissionsDrilldown', filter: 'archived' },
        },
      ]
    }
    return []
  })
}

function getInvestigationResolutionEvents(previousGameState: GameState, gameState: GameState): WorldEventLogMessage[] {
  return Object.values(gameState.leadInvestigations).flatMap((investigation) => {
    const previousInvestigation = previousGameState.leadInvestigations[investigation.id]
    if (previousInvestigation?.state !== 'Active') {
      return []
    }
    const leadName = getLeadById(investigation.leadId).name
    if (investigation.state === 'Done') {
      return [
        {
          message: `Investigation completed: ${leadName}`,
          navigationTarget: { type: 'LeadsDrilldown', filter: 'available' },
        },
      ]
    }
    if (investigation.state === 'Abandoned') {
      return [
        {
          message: `Investigation abandoned: ${leadName}`,
          navigationTarget: { type: 'LeadsDrilldown', filter: 'available' },
        },
      ]
    }
    return []
  })
}

function getNewLeadEvents(previousGameState: GameState, gameState: GameState): WorldEventLogMessage[] {
  const previousAvailableLeadIds = new Set(getAvailableLeadsForInvestigation(previousGameState).map((lead) => lead.id))
  return getAvailableLeadsForInvestigation(gameState)
    .filter((lead) => !previousAvailableLeadIds.has(lead.id))
    .map((lead) => ({
      message: `New ${getLeadAvailabilityType(lead)} lead available: ${lead.name}`,
      navigationTarget: { type: 'LeadsDrilldown', filter: 'available' },
    }))
}

function getMissionName(mission: Mission): string {
  return getMissionDataById(mission.missionDataId).name
}

function formatMissionExpiration(mission: Mission): string {
  if (mission.expiresIn === 'never') {
    return 'Does not expire.'
  }
  return `Expires in ${mission.expiresIn} turns.`
}

function getLeadAvailabilityType(lead: Lead): 'one-time' | 'repeatable' {
  return lead.repeatable ? 'repeatable' : 'one-time'
}
