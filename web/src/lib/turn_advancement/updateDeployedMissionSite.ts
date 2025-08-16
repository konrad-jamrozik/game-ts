import { getMissionById, getObjectiveDifficulty } from '../collections/missions'
import { AGENT_EXHAUSTION_RECOVERY_PER_TURN, MISSION_SURVIVAL_SKILL_REWARD } from '../model/ruleset/constants'
import { newRoll } from './Roll'
import type { Agent, GameState, MissionRewards, MissionSite } from '../model/model'
import { getRecoveryTurns } from '../model/ruleset/ruleset'
import { agsV } from '../model/agents/AgentsView'
import type { AgentView } from '../model/agents/AgentView'

type AgentDamage = {
  damage: number
}

type AgentWithDamageInfo = {
  agent: Agent
  damage: number
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
  const sortedAgents = deployedAgents.sortedByEffectiveSkill()

  const damageInfo: AgentWithDamageInfo[] = []

  // Process each agent's rolls
  for (const agent of sortedAgents) {
    processObjectiveRoll(agent, missionSite)
    const { damage } = processDamageRoll(agent, mission.difficulty)

    damageInfo.push({
      agent: agent.agent(),
      damage,
    })
  }

  updateDeployedSurvivingAgents(damageInfo)

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
function processDamageRoll(agentView: AgentView, missionDifficulty: number): AgentDamage {
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
  const chanceOfKIA = Math.min(Math.max(roll.threshold - prevHitPoints, 0), 0)

  console.log(
    `💥 Agent '${agent.id}' ${kiaMsg} ${damageIcon}${damage} damage, amounting to ${damageHitPointsPctMsg} of their hit points. ` +
      `(${prevHitPoints} -> ${agent.hitPoints}). ` +
      `Rolled ${roll.roll} against "no damage" threshold of ${roll.threshold}. ` +
      `(had ${chanceOfNoDamage}% chance of no damage, ${chanceOfKIA}% chance of KIA)`,
  )

  return { damage }
}

function updateDeployedSurvivingAgents(damageInfo: AgentWithDamageInfo[]): void {
  const terminatedAgentCount = damageInfo.filter(({ agent }) => agent.state === 'Terminated').length

  for (const { agent, damage } of damageInfo) {
    if (agent.state !== 'Terminated') {
      // All surviving agents suffer exhaustion
      agent.exhaustion += AGENT_EXHAUSTION_RECOVERY_PER_TURN

      // Additional exhaustion for each terminated agent
      agent.exhaustion += terminatedAgentCount * AGENT_EXHAUSTION_RECOVERY_PER_TURN

      // Calculate recovery time if agent lost hit points
      if (damage > 0) {
        // KJA LATER the recovery logic should be rolled up into AgentsView
        agent.recoveryTurns = getRecoveryTurns(damage, agent.maxHitPoints)
        agent.hitPointsLostBeforeRecovery = damage
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
