import type { PlayTurnAPI } from '../../../lib/model_utils/playTurnApiTypes'
import type { GameState } from '../../../lib/model/gameStateModel'
import type { Mission } from '../../../lib/model/missionModel'
import type { Agent } from '../../../lib/model/agentModel'
import { getRemainingTransportCap, filterMissionsByState } from '../../../lib/model_utils/missionUtils'
import { selectNextBestReadyAgents } from './agentSelection'
import { MAX_ENEMIES_PER_AGENT, TARGET_COMBAT_RATING_MULTIPLIER } from './constants'
import { calculateAgentCombatRating, pickAtRandom, unassignAgentsFromTraining } from './utils'
import { ceil } from '../../../lib/primitives/mathPrimitives'
import { log } from '../../../lib/primitives/logger'

export type DeploymentFeasibilityResult =
  | {
      canDeploy: true
      selectedAgents: Agent[]
    }
  | {
      canDeploy: false
      reason: 'insufficientAgentCount' | 'insufficientCombatRating' | 'insufficientTransport'
      details: string
    }

/**
 * Checks if a mission can be deployed with current resources without actually deploying.
 * Returns detailed information including selected agents if deployable, or the reason and details if not.
 */
export function canDeployMissionWithCurrentResources(
  gameState: GameState,
  mission: Mission,
): DeploymentFeasibilityResult {
  const minimumRequiredAgents = ceil(mission.enemies.length / MAX_ENEMIES_PER_AGENT)
  const enemyCombatRating = mission.combatRating
  const targetCombatRating = enemyCombatRating * TARGET_COMBAT_RATING_MULTIPLIER

  const selectedAgents: Agent[] = []

  // Phase 1: Select agents until meeting minimum count requirement
  const initialAgents = selectNextBestReadyAgents(gameState, minimumRequiredAgents, [], 0, {
    includeInTraining: true,
    keepReserve: false,
  })
  selectedAgents.push(...initialAgents)
  let currentCombatRating = initialAgents.reduce((sum, a) => sum + calculateAgentCombatRating(a), 0)

  // Check if we have enough agents
  if (selectedAgents.length < minimumRequiredAgents) {
    const details = `Mission has ${mission.enemies.length} enemies, requiring at least ${minimumRequiredAgents} agents. Only ${selectedAgents.length} agents available.`
    return { canDeploy: false, reason: 'insufficientAgentCount', details }
  }

  // Phase 2: Continue selecting if combat rating requirement not yet met
  while (currentCombatRating < targetCombatRating) {
    const agents = selectNextBestReadyAgents(
      gameState,
      1,
      selectedAgents.map((a) => a.id),
      selectedAgents.length,
      { includeInTraining: true, keepReserve: false },
    )
    const agent = agents[0]
    if (agent === undefined) {
      break // No more agents available
    }

    selectedAgents.push(agent)
    currentCombatRating += calculateAgentCombatRating(agent)
  }

  // Check if we have enough combat rating
  if (currentCombatRating < targetCombatRating) {
    const details = `Gathered ${selectedAgents.length} agents with total combat rating of ${currentCombatRating.toFixed(2)} against required ${targetCombatRating.toFixed(2)}`
    return { canDeploy: false, reason: 'insufficientCombatRating', details }
  }

  // Check transport capacity
  const remainingTransportCap = getRemainingTransportCap(gameState.missions, gameState.transportCap)
  if (selectedAgents.length > remainingTransportCap) {
    const details = `Needed ${selectedAgents.length} transport capacity, had ${remainingTransportCap} available out of ${gameState.transportCap} total capacity`
    return { canDeploy: false, reason: 'insufficientTransport', details }
  }

  return { canDeploy: true, selectedAgents }
}

export function deployToMissions(api: PlayTurnAPI): void {
  const { gameState } = api
  const activeMissions = filterMissionsByState(gameState.missions, ['Active'])

  let deploymentsAttempted = 0
  let deploymentsSuccessful = 0
  const cancelledDeployments: {
    missionId: string
    reason: 'insufficientAgentCount' | 'insufficientCombatRating' | 'insufficientTransport'
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
    reason: 'insufficientAgentCount' | 'insufficientCombatRating' | 'insufficientTransport'
    details?: string
  }[],
): void {
  const cancelledByAgentCount = cancelledDeployments.filter((f) => f.reason === 'insufficientAgentCount')
  const cancelledByCombatRating = cancelledDeployments.filter((f) => f.reason === 'insufficientCombatRating')
  const cancelledByTransportCap = cancelledDeployments.filter((f) => f.reason === 'insufficientTransport')

  let logMessage =
    `deployToMissions: attempted ${deploymentsAttempted} missions, deployed ${deploymentsSuccessful}. ` +
    `Cancelled: ${cancelledByAgentCount.length} insufficient agent count, ${cancelledByCombatRating.length} insufficient combat rating, ${cancelledByTransportCap.length} insufficient transport cap`

  // Add details for insufficient agent count cancellations
  for (const cancelled of cancelledByAgentCount) {
    if (cancelled.details !== undefined) {
      logMessage += `\n  - ${cancelled.details}`
    }
  }

  // Add details for insufficient combat rating cancellations
  for (const cancelled of cancelledByCombatRating) {
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

  log.info('missions', logMessage)
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
    reason: 'insufficientAgentCount' | 'insufficientCombatRating' | 'insufficientTransport'
    details?: string
  }[],
): boolean {
  const { gameState } = api
  const feasibility = canDeployMissionWithCurrentResources(gameState, mission)

  if (!feasibility.canDeploy) {
    cancelledDeployments.push({
      missionId: mission.id,
      reason: feasibility.reason,
      details: feasibility.details,
    })
    return false
  }

  // Unassign agents from training if needed
  unassignAgentsFromTraining(api, feasibility.selectedAgents)
  // Deploy agents
  api.deployAgentsToMission({
    missionId: mission.id,
    agentIds: feasibility.selectedAgents.map((agent) => agent.id),
  })
  return true
}
