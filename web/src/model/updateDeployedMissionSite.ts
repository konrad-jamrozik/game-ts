import { getMissionById } from '../collections/missions'
import { AGENT_EXHAUSTION_RECOVERY_PER_TURN, MISSION_SURVIVAL_SKILL_REWARD } from '../ruleset/constants'
import { getEffectiveSkill } from './AgentService'
import { calculateRollThreshold, rollDie } from './CombatService'
import type { Agent, GameState, MissionRewards, MissionSite } from './model'

// KJA should be named AgentHitPointsLostRollResult
type AgentRollResult = {
  hitPointsLost: number
  terminated: boolean
}

/**
 * Processes both rolls for a single agent: mission objective roll and hit points lost roll.
 */
function processAgentRolls(agent: Agent, missionSite: MissionSite, missionDifficulty: number): AgentRollResult {
  let hitPointsLost = 0
  let terminated = false

  // Mission objective roll - only if there are unfulfilled objectives
  const unfulfilledObjectives = missionSite.objectives
    .filter((objective) => !objective.fulfilled)
    .sort((objectiveA, objectiveB) => objectiveA.difficulty - objectiveB.difficulty) // Sort by difficulty (lowest first)

  if (unfulfilledObjectives.length > 0) {
    const [targetObjective] = unfulfilledObjectives
    if (targetObjective) {
      const objectiveRoll = rollDie()
      const effectiveSkill = getEffectiveSkill(agent)
      const [objectiveThreshold, objectiveThresholdFormula] = calculateRollThreshold(
        effectiveSkill,
        targetObjective.difficulty,
      )

      // eslint-disable-next-line @typescript-eslint/init-declarations
      let objectiveRollResultMsg: string
      if (objectiveRoll > objectiveThreshold) {
        objectiveRollResultMsg = 'fulfilled (> threshold)'
        // Mark objective as fulfilled
        const objectiveInSite = missionSite.objectives.find((objective) => objective.id === targetObjective.id)
        if (objectiveInSite) {
          objectiveInSite.fulfilled = true
        }
      } else {
        objectiveRollResultMsg = 'failed (<= threshold)'
      }

      console.log(
        `Agent '${agent.id}' ${objectiveRollResultMsg} objective '${targetObjective.id}': ` +
          `rolled ${objectiveRoll} against threshold of ${objectiveThresholdFormula}.`,
      )
    }
  }

  // Hit points lost roll
  const hitPointsLostRoll = rollDie()
  const effectiveSkill = getEffectiveSkill(agent)
  const [hitPointsThreshold, hitPointsThresholdFormula] = calculateRollThreshold(effectiveSkill, missionDifficulty)

  const prevHitPoints = agent.hitPoints
  if (hitPointsLostRoll < hitPointsThreshold) {
    hitPointsLost = hitPointsThreshold - hitPointsLostRoll
    agent.hitPoints = Math.max(0, agent.hitPoints - hitPointsLost)

    // KJA get rid of this terminated nonsense here
    // Check if agent should be terminated (moved to applyAgentResults)
    if (agent.hitPoints <= 0) {
      terminated = true
    }
  }

  console.log(
    `Agent '${agent.id}' lost ${hitPointsLost} hit points. (${prevHitPoints} -> ${agent.hitPoints}). ` +
      `rolled ${hitPointsLostRoll} against "no damage" threshold of ${hitPointsThresholdFormula}.`,
  )

  return { hitPointsLost, terminated }
}

/**
 * Applies the results to agents after deployed mission site update.
 */
function applyAgentResults(agents: Agent[], terminatedAgentCount: number): void {
  for (const agent of agents) {
    // Handle agent termination first
    if (agent.hitPoints <= 0) {
      agent.state = 'Terminated'
      agent.assignment = 'N/A'
    } else {
      // All surviving agents suffer exhaustion
      agent.exhaustion += AGENT_EXHAUSTION_RECOVERY_PER_TURN

      // Additional exhaustion for each terminated agent
      agent.exhaustion += terminatedAgentCount * AGENT_EXHAUSTION_RECOVERY_PER_TURN

      // Calculate recovery time if agent lost hit points
      // KJA hitPointsLost was already available in AgentRollResult
      const hitPointsLost = agent.maxHitPoints - agent.hitPoints
      if (hitPointsLost > 0) {
        const hitPointsLostPercentage = (hitPointsLost / agent.maxHitPoints) * 100
        const recoveryTurns = Math.ceil(hitPointsLostPercentage / 2)
        agent.recoveryTurns = Math.max(agent.recoveryTurns, recoveryTurns)
        agent.hitPointsLostBeforeRecovery = hitPointsLost
        agent.state = 'InTransit'
        agent.assignment = 'Recovery'
      } else {
        agent.state = 'InTransit'
        agent.assignment = 'Standby'
      }

      // Award skill points for mission survival
      agent.missionsSurvived += 1
      const survivalIndex = Math.min(agent.missionsSurvived - 1, MISSION_SURVIVAL_SKILL_REWARD.length - 1)
      const skillReward = MISSION_SURVIVAL_SKILL_REWARD[survivalIndex]
      if (skillReward !== undefined) {
        agent.skill += skillReward
      }
    }
  }
}

/**
 * Updates a deployed mission site according to about_deployed_mission_sites.md.
 * This includes agent rolls, objective completion, damage calculation, and rewards.
 * Returns the mission rewards to be applied later in the turn advancement process.
 */
export function updateDeployedMissionSite(state: GameState, missionSite: MissionSite): MissionRewards | undefined {
  // Get the mission to access its difficulty
  const mission = getMissionById(missionSite.missionId)

  // Get agents deployed to this mission site
  const deployedAgents = missionSite.agentIds
    .map((agentId) => state.agents.find((agent) => agent.id === agentId))
    .filter((agent): agent is Agent => agent !== undefined)

  // Sort agents by effective skill (lowest to highest) for rolling order
  const sortedAgents = [...deployedAgents].sort(
    (agentA, agentB) => getEffectiveSkill(agentA) - getEffectiveSkill(agentB),
  )

  // Track terminated agents for exhaustion penalty
  let terminatedAgentCount = 0

  // Process each agent's rolls
  for (const agent of sortedAgents) {
    const agentRollResult = processAgentRolls(agent, missionSite, mission.difficulty)

    if (agentRollResult.terminated) {
      terminatedAgentCount += 1
    }
  }

  // Apply agent results for all surviving agents
  applyAgentResults(deployedAgents, terminatedAgentCount)

  // Determine mission site outcome
  const allObjectivesFulfilled = missionSite.objectives.every((objective) => objective.fulfilled)
  missionSite.state = allObjectivesFulfilled ? 'Successful' : 'Failed'

  // Return mission rewards to be applied later, don't apply them immediately
  if (missionSite.state === 'Successful') {
    return mission.rewards
  }

  return undefined
}
