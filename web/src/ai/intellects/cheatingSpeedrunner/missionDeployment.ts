import type { PlayTurnAPI } from '../../../lib/model_utils/playTurnApiTypes'
import type { GameState } from '../../../lib/model/gameStateModel'
import type { Mission } from '../../../lib/model/missionModel'
import { filterMissionsByState, getRemainingTransportCap } from '../../../lib/model_utils/missionUtils'
import { MAX_ENEMIES_PER_AGENT } from './constants'
import { countReadyAgents, selectReadyAgentIds } from './agentAllocation'

export function deployToAllMissions(api: PlayTurnAPI): void {
  let mission = selectNextDeployableMission(api.gameState)
  while (mission !== undefined) {
    const requiredAgentCount = getRequiredAgentCount(mission)
    const agentIds = selectReadyAgentIds(api.gameState, requiredAgentCount)
    api.deployAgentsToMission({ missionId: mission.id, agentIds })
    mission = selectNextDeployableMission(api.gameState)
  }
}

function selectNextDeployableMission(gameState: GameState): Mission | undefined {
  const readyAgentCount = countReadyAgents(gameState)
  const remainingTransportCap = getRemainingTransportCap(gameState.missions, gameState.transportCap)
  return filterMissionsByState(gameState.missions, ['Active'])
    .toSorted(compareMissionsByPriority)
    .find((mission) => {
      const requiredAgentCount = getRequiredAgentCount(mission)
      return requiredAgentCount <= readyAgentCount && requiredAgentCount <= remainingTransportCap
    })
}

function compareMissionsByPriority(missionA: Mission, missionB: Mission): number {
  const hqPriorityDiff = getHqPriority(missionB) - getHqPriority(missionA)
  if (hqPriorityDiff !== 0) {
    return hqPriorityDiff
  }
  return compareExpiresIn(missionA.expiresIn, missionB.expiresIn)
}

function getHqPriority(mission: Mission): number {
  return mission.operationLevel === 6 ? 1 : 0
}

function compareExpiresIn(expiresInA: number | 'never', expiresInB: number | 'never'): number {
  if (expiresInA === 'never' && expiresInB === 'never') return 0
  if (expiresInA === 'never') return 1
  if (expiresInB === 'never') return -1
  return expiresInA - expiresInB
}

function getRequiredAgentCount(mission: Mission): number {
  return Math.max(1, Math.ceil(mission.enemies.length / MAX_ENEMIES_PER_AGENT))
}
