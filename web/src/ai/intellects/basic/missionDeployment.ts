import type { PlayTurnAPI } from '../../../lib/model_utils/playTurnApiTypes'
import type { Mission } from '../../../lib/model/missionModel'
import type { Agent } from '../../../lib/model/agentModel'
import { calculateMissionThreatAssessment } from '../../../lib/game_utils/missionThreatAssessment'
import { getRemainingTransportCap, filterMissionsByState } from '../../../lib/model_utils/missionUtils'
import { selectNextBestReadyAgent } from './agentSelection'
import { MAX_ENEMIES_PER_AGENT, TARGET_AGENT_THREAT_MULTIPLIER } from './types'
import { calculateAgentThreatAssessment, pickAtRandom, unassignAgentsFromTraining } from './utils'
import { floor } from '../../../lib/primitives/mathPrimitives'

export function deployToMissions(api: PlayTurnAPI): void {
  const { gameState } = api
  const activeMissions = filterMissionsByState(gameState.missions, ['Active'])

  let deploymentsAttempted = 0
  let deploymentsSuccessful = 0
  const cancelledDeployments: {
    missionId: string
    reason: 'insufficientAgentCount' | 'insufficientThreat' | 'insufficientTransport'
    details?: string
  }[] = []

  let mission = selectNextMissionToDeploy(activeMissions)
  while (mission !== undefined) {
    deploymentsAttempted += 1
    const missionId = mission.id
    const deployed = deployToMission(api, mission, cancelledDeployments)
    // Remove the evaluated mission from the list
    const missionIndex = activeMissions.findIndex((m) => m.id === missionId)
    if (missionIndex !== -1) {
      activeMissions.splice(missionIndex, 1)
    }
    if (deployed) {
      deploymentsSuccessful += 1
      mission = selectNextMissionToDeploy(activeMissions)
    } else {
      break
    }
  }

  logDeploymentStatistics(deploymentsAttempted, deploymentsSuccessful, cancelledDeployments)
}

function logDeploymentStatistics(
  deploymentsAttempted: number,
  deploymentsSuccessful: number,
  cancelledDeployments: {
    missionId: string
    reason: 'insufficientAgentCount' | 'insufficientThreat' | 'insufficientTransport'
    details?: string
  }[],
): void {
  const cancelledByAgentCount = cancelledDeployments.filter((f) => f.reason === 'insufficientAgentCount')
  const cancelledByThreat = cancelledDeployments.filter((f) => f.reason === 'insufficientThreat')
  const cancelledByTransportCap = cancelledDeployments.filter((f) => f.reason === 'insufficientTransport')

  let logMessage =
    `deployToMissions: attempted ${deploymentsAttempted} missions, deployed ${deploymentsSuccessful}. ` +
    `Cancelled: ${cancelledByAgentCount.length} insufficient agent count, ${cancelledByThreat.length} insufficient threat, ${cancelledByTransportCap.length} insufficient transport cap`

  // Add details for insufficient agent count cancellations
  for (const cancelled of cancelledByAgentCount) {
    if (cancelled.details !== undefined) {
      logMessage += `\n  - ${cancelled.details}`
    }
  }

  // Add details for insufficient threat cancellations
  for (const cancelled of cancelledByThreat) {
    if (cancelled.details !== undefined) {
      logMessage += `\n  - ${cancelled.details}`
    }
  }

  // Add details for insufficient transport cancellations
  for (const cancelled of cancelledByTransportCap) {
    if (cancelled.details !== undefined) {
      logMessage += `\n  - ${cancelled.details}`
    }
  }

  console.log(logMessage)
}

function selectNextMissionToDeploy(availableMissions: Mission[]): Mission | undefined {
  if (availableMissions.length === 0) {
    return undefined
  }

  // Special case: HQ raids (defensive level 6) are chosen first
  const hqRaidMissions = availableMissions.filter((mission) => mission.operationLevel === 6)
  if (hqRaidMissions.length > 0) {
    return pickAtRandom(hqRaidMissions)
  }

  // Otherwise, prioritize by expiry time (earliest first)
  const sortedMissions = availableMissions.toSorted((a, b) => {
    if (a.expiresIn === 'never' && b.expiresIn === 'never') return 0
    if (a.expiresIn === 'never') return 1
    if (b.expiresIn === 'never') return -1
    return a.expiresIn - b.expiresIn
  })

  const firstMission = sortedMissions[0]
  if (firstMission === undefined) {
    return undefined
  }

  const earliestExpiry = firstMission.expiresIn
  if (earliestExpiry === 'never') {
    return pickAtRandom(sortedMissions)
  }

  const missionsWithEarliestExpiry = sortedMissions.filter((mission) => mission.expiresIn === earliestExpiry)
  return pickAtRandom(missionsWithEarliestExpiry)
}

function deployToMission(
  api: PlayTurnAPI,
  mission: Mission,
  cancelledDeployments: {
    missionId: string
    reason: 'insufficientAgentCount' | 'insufficientThreat' | 'insufficientTransport'
    details?: string
  }[],
): boolean {
  const { gameState } = api
  const minimumRequiredAgents = floor(mission.enemies.length / MAX_ENEMIES_PER_AGENT)
  const enemyThreat = calculateMissionThreatAssessment(mission)
  const targetThreat = enemyThreat * TARGET_AGENT_THREAT_MULTIPLIER

  const selectedAgents: Agent[] = []
  let currentThreat = 0

  // Phase 1: Select agents until meeting minimum count requirement
  while (selectedAgents.length < minimumRequiredAgents) {
    const agent = selectNextBestReadyAgent(
      gameState,
      selectedAgents.map((a) => a.id),
      selectedAgents.length,
      { includeInTraining: true, keepReserve: false },
    )
    if (agent === undefined) {
      break // No more agents available
    }

    selectedAgents.push(agent)
    currentThreat += calculateAgentThreatAssessment(agent)
  }

  // Check if we have enough agents
  if (selectedAgents.length < minimumRequiredAgents) {
    const details = `Mission has ${mission.enemies.length} enemies, requiring at least ${minimumRequiredAgents} agents. Only ${selectedAgents.length} agents available.`
    cancelledDeployments.push({ missionId: mission.id, reason: 'insufficientAgentCount', details })
    return false
  }

  // Phase 2: Continue selecting if threat requirement not yet met
  while (currentThreat < targetThreat) {
    const agent = selectNextBestReadyAgent(
      gameState,
      selectedAgents.map((a) => a.id),
      selectedAgents.length,
      { includeInTraining: true, keepReserve: false },
    )
    if (agent === undefined) {
      break // No more agents available
    }

    selectedAgents.push(agent)
    currentThreat += calculateAgentThreatAssessment(agent)
  }

  // Check if we have enough threat
  if (currentThreat < targetThreat) {
    const details = `Gathered ${selectedAgents.length} agents with total threat of ${currentThreat.toFixed(2)} against required ${targetThreat.toFixed(2)}`
    cancelledDeployments.push({ missionId: mission.id, reason: 'insufficientThreat', details })
    return false
  }

  // Check transport capacity
  const remainingTransportCap = getRemainingTransportCap(gameState.missions, gameState.transportCap)
  if (selectedAgents.length > remainingTransportCap) {
    const details = `Needed ${selectedAgents.length} transport capacity, had ${remainingTransportCap} available out of ${gameState.transportCap} total capacity`
    cancelledDeployments.push({ missionId: mission.id, reason: 'insufficientTransport', details })
    return false
  }

  // Unassign agents from training if needed
  unassignAgentsFromTraining(api, selectedAgents)
  // Deploy agents
  api.deployAgentsToMission({
    missionId: mission.id,
    agentIds: selectedAgents.map((agent) => agent.id),
  })
  return true
}
