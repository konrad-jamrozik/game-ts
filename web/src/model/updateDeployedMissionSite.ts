import { getMissionById, getObjectiveDifficulty } from '../collections/missions'
import { AGENT_EXHAUSTION_RECOVERY_PER_TURN, MISSION_SURVIVAL_SKILL_REWARD } from '../ruleset/constants'
import { calculateRollThreshold, rollDie } from './CombatService'
import type { Agent, GameState, MissionRewards, MissionSite } from './model'
import { agsV } from './views/AgentsView'
import type { AgentView } from './views/AgentView'

type AgentHitPointsLostRollResult = {
  hitPointsLost: number
}

type AgentWithHitPointsLostInfo = {
  agent: Agent
  hitPointsLost: number
}

/**
 * Processes both rolls for a single agent: mission objective roll and hit points lost roll.
 */
function processAgentRolls(
  agentView: AgentView,
  missionSite: MissionSite,
  missionDifficulty: number,
): AgentHitPointsLostRollResult {
  // Mission objective roll - only if there are unfulfilled objectives
  const unfulfilledObjectives = missionSite.objectives
    .filter((objective) => !objective.fulfilled)
    .sort((objectiveA, objectiveB) => {
      const difficultyA = getObjectiveDifficulty(missionSite.missionId, objectiveA.id)
      const difficultyB = getObjectiveDifficulty(missionSite.missionId, objectiveB.id)
      return difficultyA - difficultyB // Sort by difficulty (lowest first)
    })

  const agent = agentView.agent()

  if (unfulfilledObjectives.length > 0) {
    const [targetObjective] = unfulfilledObjectives
    if (targetObjective) {
      const objectiveRoll = rollDie()
      const effectiveSkill = agentView.effectiveSkill()
      const objectiveDifficulty = getObjectiveDifficulty(missionSite.missionId, targetObjective.id)
      const [objectiveThreshold, objectiveThresholdFormula] = calculateRollThreshold(
        effectiveSkill,
        objectiveDifficulty,
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
  const effectiveSkill = agentView.effectiveSkill()
  const [hitPointsThreshold, hitPointsThresholdFormula] = calculateRollThreshold(effectiveSkill, missionDifficulty)

  // eslint-disable-next-line @typescript-eslint/init-declarations
  let hitPointsLost: number
  const prevHitPoints = agent.hitPoints
  if (hitPointsLostRoll < hitPointsThreshold) {
    hitPointsLost = hitPointsThreshold - hitPointsLostRoll
    agent.hitPoints = Math.max(0, agent.hitPoints - hitPointsLost)

    if (agent.hitPoints <= 0) {
      agent.state = 'Terminated'
      agent.assignment = 'KIA'
    }
  } else {
    hitPointsLost = 0
  }

  console.log(
    `Agent '${agent.id}' lost ${hitPointsLost} hit points. (${prevHitPoints} -> ${agent.hitPoints}). ` +
      `rolled ${hitPointsLostRoll} against "no damage" threshold of ${hitPointsThresholdFormula}.`,
  )

  return { hitPointsLost }
}

function updateDeployedSurvivingAgents(agentsWithResults: AgentWithHitPointsLostInfo[]): void {
  const terminatedAgentCount = agentsWithResults.filter(({ agent }) => agent.state === 'Terminated').length

  for (const { agent, hitPointsLost } of agentsWithResults) {
    if (agent.state !== 'Terminated') {
      // All surviving agents suffer exhaustion
      agent.exhaustion += AGENT_EXHAUSTION_RECOVERY_PER_TURN

      // Additional exhaustion for each terminated agent
      agent.exhaustion += terminatedAgentCount * AGENT_EXHAUSTION_RECOVERY_PER_TURN

      // Calculate recovery time if agent lost hit points
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
  const deployedAgents = agsV(state.agents).withIds(missionSite.agentIds)

  // Sort agents by effective skill (lowest to highest) for rolling order
  const sortedAgents = [...deployedAgents].sort((agentA, agentB) => agentA.effectiveSkill() - agentB.effectiveSkill())

  const agentsWithHitPointsLost: AgentWithHitPointsLostInfo[] = []

  // Process each agent's rolls
  for (const agent of sortedAgents) {
    const { hitPointsLost } = processAgentRolls(agent, missionSite, mission.difficulty)

    agentsWithHitPointsLost.push({
      agent: agent.agent(),
      hitPointsLost,
    })
  }

  // Apply agent results for all agents
  updateDeployedSurvivingAgents(agentsWithHitPointsLost)

  // Determine mission site outcome
  const allObjectivesFulfilled = missionSite.objectives.every((objective) => objective.fulfilled)
  missionSite.state = allObjectivesFulfilled ? 'Successful' : 'Failed'

  // Return mission rewards to be applied later, don't apply them immediately
  if (missionSite.state === 'Successful') {
    return mission.rewards
  }

  return undefined
}
