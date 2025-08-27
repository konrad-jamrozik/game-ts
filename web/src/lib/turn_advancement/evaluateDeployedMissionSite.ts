import { getMissionById } from '../collections/missions'
import { AGENT_EXHAUSTION_RECOVERY_PER_TURN, MISSION_SURVIVAL_SKILL_REWARD } from '../model/ruleset/constants'
import type { GameState, MissionRewards, MissionSite, Agent } from '../model/model'
import { getRecoveryTurns } from '../model/ruleset/ruleset'
import { agsV, type AgentsView } from '../model/agents/AgentsView'
import { evaluateBattle, type AgentCombatStats, type CombatReport } from './evaluateBattle'

/**
 * Evaluates a deployed mission site according to about_deployed_mission_sites.md.
 * This includes the mission site battle, agent updates, and rewards.
 * Returns the mission rewards to be applied later in the turn advancement process.
 */
export function evaluateDeployedMissionSite(state: GameState, missionSite: MissionSite): MissionRewards | undefined {
  // Get the mission to access enemy units
  const mission = getMissionById(missionSite.missionId)

  // Get agents deployed to this mission site
  const deployedAgentViews = agsV(state.agents).withIds(missionSite.agentIds)
  const deployedAgents = deployedAgentViews.map((agentView) => agentView.agent())

  const agentStats = prepareAgentCombatStats(deployedAgentViews)

  const combatReport = evaluateBattle(deployedAgents, agentStats, missionSite.enemies)

  updateAgentsAfterCombat(state, deployedAgents, agentStats, combatReport)

  // Determine mission site outcome
  const allEnemiesNeutralized = missionSite.enemies.every((enemy) => enemy.hitPoints <= 0)

  missionSite.state = allEnemiesNeutralized ? 'Successful' : 'Failed'

  // Return mission rewards to be applied later, don't apply them immediately
  if (missionSite.state === 'Successful') {
    return mission.rewards
  }

  return undefined
}

function prepareAgentCombatStats(agentViews: AgentsView): AgentCombatStats[] {
  return agentViews.map((agentView) => ({
    id: agentView.agent().id,
    initialEffectiveSkill: agentView.effectiveSkill(),
    skillGained: 0,
  }))
}

function updateAgentsAfterCombat(
  state: GameState,
  deployedAgents: Agent[],
  agentStats: AgentCombatStats[],
  combatReport: CombatReport,
): void {
  deployedAgents.forEach((deployedAgent) => {
    const stateAgent = state.agents.find((agent) => agent.id === deployedAgent.id)
    if (!stateAgent) return

    const stats = agentStats.find((stat) => stat.id === deployedAgent.id)
    if (!stats) return

    // hitPoints and exhaustion were already updated during combat on the deployed agent
    // Copy them to the state agent
    stateAgent.hitPoints = deployedAgent.hitPoints
    stateAgent.exhaustion = deployedAgent.exhaustion

    const isTerminated = deployedAgent.hitPoints <= 0

    // Apply mission conclusion exhaustion
    if (!isTerminated) {
      stateAgent.exhaustion += AGENT_EXHAUSTION_RECOVERY_PER_TURN

      // Additional exhaustion for each terminated agent
      stateAgent.exhaustion += combatReport.agentsCasualties * AGENT_EXHAUSTION_RECOVERY_PER_TURN
    }

    // Update skill
    if (!isTerminated) {
      // Skill from combat (this was accumulated in stats during battle)
      stateAgent.skill += stats.skillGained

      // Skill from mission survival
      stateAgent.missionsSurvived += 1
      const survivalIndex = Math.min(stateAgent.missionsSurvived - 1, MISSION_SURVIVAL_SKILL_REWARD.length - 1)
      const survivalSkillReward = MISSION_SURVIVAL_SKILL_REWARD[survivalIndex] ?? 0
      stateAgent.skill += survivalSkillReward

      console.log(
        `📈 Agent ${stateAgent.id} gained ${stats.skillGained + survivalSkillReward} skill (${stats.skillGained} from combat, ${survivalSkillReward} from survival)`,
      )
    }

    // Update state and assignment
    if (isTerminated) {
      stateAgent.state = 'Terminated'
      stateAgent.assignment = 'KIA'
    } else {
      stateAgent.state = 'InTransit'

      // Check if agent took damage
      const tookDamage = stateAgent.hitPoints < stateAgent.maxHitPoints
      if (tookDamage) {
        stateAgent.assignment = 'Recovery'
        stateAgent.hitPointsLostBeforeRecovery = stateAgent.maxHitPoints - stateAgent.hitPoints
        stateAgent.recoveryTurns = getRecoveryTurns(stateAgent.hitPointsLostBeforeRecovery, stateAgent.maxHitPoints)
      } else {
        stateAgent.assignment = 'Standby'
      }
    }
  })
}
