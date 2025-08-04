import { getMissionById } from '../collections/missions'
import { AGENT_EXHAUSTION_RECOVERY_PER_TURN, MISSION_SURVIVAL_SKILL_REWARD } from '../ruleset/constants'
import { applyMissionRewards } from './applyMissionRewards'
import type { Agent, GameState, MissionSite } from './model'

/**
 * Calculates the roll threshold: 100 - skill + difficulty
 */
function calculateRollThreshold(skill: number, difficulty: number): number {
  return 100 - skill + difficulty
}

/**
 * Rolls a die (1-100 inclusive)
 */
function rollDie(): number {
  return Math.floor(Math.random() * 100) + 1
}

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
      const objectiveThreshold = calculateRollThreshold(agent.skill, targetObjective.difficulty)

      if (objectiveRoll > objectiveThreshold) {
        // Mark objective as fulfilled
        const objectiveInSite = missionSite.objectives.find((objective) => objective.id === targetObjective.id)
        if (objectiveInSite) {
          objectiveInSite.fulfilled = true
        }
      }
    }
  }

  // Hit points lost roll
  const hitPointsLostRoll = rollDie()
  const hitPointsThreshold = calculateRollThreshold(agent.skill, missionDifficulty)

  if (hitPointsLostRoll < hitPointsThreshold) {
    hitPointsLost = hitPointsThreshold - hitPointsLostRoll
    agent.hitPoints = Math.max(0, agent.hitPoints - hitPointsLost)

    // Check if agent is terminated
    // KJA mission-site this happen in applyAgentResults, but the exhaustion based on terminated agents should still be computed correctly
    if (agent.hitPoints <= 0) {
      agent.state = 'Terminated'
      agent.assignment = 'Terminated'
      terminated = true
    }
  }

  return { hitPointsLost, terminated }
}

/**
 * Applies the results to agents after deployed mission site update.
 */
function applyAgentResults(agents: Agent[], terminatedAgentCount: number): void {
  for (const agent of agents) {
    // Skip terminated agents for most effects
    if (agent.state === 'Terminated') {
      // eslint-disable-next-line no-continue
      continue
    }

    // All surviving agents suffer exhaustion
    agent.exhaustion += AGENT_EXHAUSTION_RECOVERY_PER_TURN

    // Additional exhaustion for each terminated agent
    agent.exhaustion += terminatedAgentCount * AGENT_EXHAUSTION_RECOVERY_PER_TURN

    // Calculate recovery time if agent lost hit points
    const hitPointsLost = agent.maxHitPoints - agent.hitPoints
    if (hitPointsLost > 0) {
      const hitPointsLostPercentage = (hitPointsLost / agent.maxHitPoints) * 100
      const recoveryTurns = Math.ceil(hitPointsLostPercentage / 2)
      agent.recoveryTurns = Math.max(agent.recoveryTurns, recoveryTurns)
      agent.state = 'Recovering'
      agent.assignment = 'Recovery'
    }

    // Award skill points for mission survival
    agent.missionsSurvived += 1
    const survivalIndex = Math.min(agent.missionsSurvived - 1, MISSION_SURVIVAL_SKILL_REWARD.length - 1)
    const skillReward = MISSION_SURVIVAL_SKILL_REWARD[survivalIndex]
    // KJA mission-site, this check should not be necessary
    if (skillReward !== undefined) {
      agent.skill += skillReward
    }

    // KJA mission-site, no, agent first must be in transit, always, and then recover
    // Set agent state if not recovering
    if (agent.state !== 'Recovering') {
      agent.state = 'InTransit'
      agent.assignment = 'Standby'
    }
  }
}

/**
 * Updates a deployed mission site according to about_deployed_mission_site.md.
 * This includes agent rolls, objective completion, damage calculation, and rewards.
 */
export function updateDeployedMissionSite(state: GameState, missionSite: MissionSite): void {
  // Get the mission to access its difficulty
  const mission = getMissionById(missionSite.missionId)

  // Get agents deployed to this mission site
  const deployedAgents = missionSite.agentIds
    .map((agentId) => state.agents.find((agent) => agent.id === agentId))
    .filter((agent): agent is Agent => agent !== undefined)

  // Sort agents by skill (lowest to highest) for rolling order
  const sortedAgents = [...deployedAgents].sort((agentA, agentB) => agentA.skill - agentB.skill)

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

  // Apply mission rewards if successful
  if (missionSite.state === 'Successful') {
    applyMissionRewards(state, mission.rewards)
  }
}
