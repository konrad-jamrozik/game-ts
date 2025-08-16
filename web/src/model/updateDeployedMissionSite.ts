import { getMissionById, getObjectiveDifficulty } from '../collections/missions'
import { AGENT_EXHAUSTION_RECOVERY_PER_TURN, MISSION_SURVIVAL_SKILL_REWARD } from '../ruleset/constants'
import { newRoll } from './CombatService'
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
 * Updates a deployed mission site according to about_deployed_mission_sites.md.
 * This includes agent rolls, objective completion, damage calculation, and rewards.
 * Returns the mission rewards to be applied later in the turn advancement process.
 */
export function updateDeployedMissionSite(state: GameState, missionSite: MissionSite): MissionRewards | undefined {
  // Get the mission to access its difficulty
  const mission = getMissionById(missionSite.missionId)

  // Get agents deployed to this mission site
  const deployedAgents = agsV(state.agents).withIds(missionSite.agentIds)

  // KJA sorting should be AgentsView function
  // Sort agents by effective skill (lowest to highest) for rolling order
  const sortedAgents = [...deployedAgents].sort((agentA, agentB) => agentA.effectiveSkill() - agentB.effectiveSkill())

  const agentsWithHitPointsLost: AgentWithHitPointsLostInfo[] = []

  // Process each agent's rolls
  for (const agent of sortedAgents) {
    processObjectiveRoll(agent, missionSite)
    const { hitPointsLost } = processHitPointsLostRoll(agent, mission.difficulty)

    agentsWithHitPointsLost.push({
      agent: agent.agent(),
      hitPointsLost,
    })
  }

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

/**
 * Processes objective rolls for a single agent. Mutates the mission site to mark objectives as fulfilled.
 */
function processObjectiveRoll(agentView: AgentView, missionSite: MissionSite): void {
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
      const effectiveSkill = agentView.effectiveSkill()
      const objectiveDifficulty = getObjectiveDifficulty(missionSite.missionId, targetObjective.id)
      const roll = newRoll(effectiveSkill, objectiveDifficulty)

      if (roll.isAboveThreshold) {
        // Mark objective as fulfilled
        const objectiveInSite = missionSite.objectives.find((objective) => objective.id === targetObjective.id)
        if (objectiveInSite) {
          objectiveInSite.fulfilled = true
        }
      }

      console.log(
        `🎯 Agent '${agent.id}' roll on objective '${targetObjective.id}': ${roll.isAboveThresholdMsg}. ` +
          `Rolled ${roll.roll} against threshold of ${roll.threshold} ` +
          `(had ${roll.aboveThresholdChancePct}% chance of success)`,
      )
    }
  }
}

/**
 * Processes hit points lost roll for a single agent. Mutates the agent's state and hit points.
 */
function processHitPointsLostRoll(agentView: AgentView, missionDifficulty: number): AgentHitPointsLostRollResult {
  const agent = agentView.agent()

  // Hit points lost roll
  const effectiveSkill = agentView.effectiveSkill()
  const roll = newRoll(effectiveSkill, missionDifficulty)

  const prevHitPoints = agent.hitPoints
  const damage = roll.belowThreshold
  agent.hitPoints = Math.max(0, agent.hitPoints - damage)

  if (agent.hitPoints <= 0) {
    agent.state = 'Terminated'
    agent.assignment = 'KIA'
  }

  const damageHitPointsPctMsg = `${((damage / prevHitPoints) * 100).toFixed(2)}%`
  const damageIcon = damage > 0 ? '🩸 ' : ''
  const kiaMsg = agent.state === 'Terminated' ? ' KIA 💀. Sustained' : 'sustained'

  const chanceOfNoDamage = roll.atOrAboveThresholdChancePct
  const chanceOfKIA = roll.threshold - prevHitPoints

  console.log(
    `💥 Agent '${agent.id}' ${kiaMsg} ${damageIcon}${damage} damage, amounting to ${damageHitPointsPctMsg} of their hit points. ` +
      `(${prevHitPoints} -> ${agent.hitPoints}). ` +
      `Rolled ${roll.roll} against "no damage" threshold of ${roll.threshold}. ` +
      `(had ${chanceOfNoDamage}% chance of no damage, ${chanceOfKIA}% chance of KIA)`,
  )

  return { hitPointsLost: damage }
}

function updateDeployedSurvivingAgents(agentsWithHitPointsLost: AgentWithHitPointsLostInfo[]): void {
  const terminatedAgentCount = agentsWithHitPointsLost.filter(({ agent }) => agent.state === 'Terminated').length

  for (const { agent, hitPointsLost } of agentsWithHitPointsLost) {
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

