import { getMissionById } from '../collections/missions'
import { AGENT_EXHAUSTION_RECOVERY_PER_TURN, MISSION_SURVIVAL_SKILL_REWARD } from '../model/ruleset/constants'
import type { GameState, MissionRewards, MissionSite, EnemyUnit } from '../model/model'
import { getRecoveryTurns } from '../model/ruleset/ruleset'
import { agsV, type AgentsView } from '../model/agents/AgentsView'
import { conductMissionSiteBattle, type CombatParticipant, type CombatReport } from './combatSystem'

/**
 * Updates a deployed mission site according to about_deployed_mission_sites.md.
 * This includes the mission site battle, agent updates, and rewards.
 * Returns the mission rewards to be applied later in the turn advancement process.
 */
export function updateDeployedMissionSite(state: GameState, missionSite: MissionSite): MissionRewards | undefined {
  // Get the mission to access enemy units
  const mission = getMissionById(missionSite.missionId)

  // Get agents deployed to this mission site
  const deployedAgentViews = agsV(state.agents).withIds(missionSite.agentIds)

  // Prepare combat participants
  const agentParticipants = prepareAgentParticipants(deployedAgentViews)
  const enemyParticipants = prepareEnemyParticipants(missionSite.enemyUnits)

  // Conduct mission site battle
  const combatReport = conductMissionSiteBattle(agentParticipants, enemyParticipants)

  // Update agents based on combat results
  updateAgentsAfterCombat(state, agentParticipants, combatReport)

  // Determine mission site outcome
  const allEnemiesNeutralized = enemyParticipants.every((enemy) => enemy.isTerminated)

  missionSite.state = allEnemiesNeutralized ? 'Successful' : 'Failed'

  // Return mission rewards to be applied later, don't apply them immediately
  if (missionSite.state === 'Successful') {
    return mission.rewards
  }

  return undefined
}

function prepareAgentParticipants(agentViews: AgentsView): CombatParticipant[] {
  return agentViews.map((agentView) => {
    const agent = agentView.agent()
    return {
      id: agent.id,
      type: 'agent' as const,
      skill: agent.skill,
      effectiveSkill: agentView.effectiveSkill(),
      hitPoints: agent.hitPoints,
      maxHitPoints: agent.maxHitPoints,
      weapon: agent.weapon,
      exhaustion: agent.exhaustion,
      skillGained: 0,
      isTerminated: false,
    }
  })
}

function prepareEnemyParticipants(enemyUnits: EnemyUnit[]): CombatParticipant[] {
  return enemyUnits.map((enemy) => ({
    id: enemy.id,
    type: 'enemy' as const,
    skill: enemy.skill,
    // Enemy effective skill is simply skill, as they are assumed to have no debuffs like exhaustion or damage.
    effectiveSkill: enemy.skill,
    hitPoints: enemy.hitPoints,
    maxHitPoints: enemy.maxHitPoints,
    weapon: enemy.weapon,
    exhaustion: 0,
    skillGained: 0,
    isTerminated: false,
  }))
}

function updateAgentsAfterCombat(
  state: GameState,
  agentParticipants: CombatParticipant[],
  combatReport: CombatReport,
): void {
  agentParticipants.forEach((participant) => {
    const agent = state.agents.find((stateAgent) => stateAgent.id === participant.id)
    if (!agent) return

    // Update hit points
    agent.hitPoints = participant.hitPoints

    // Update exhaustion
    agent.exhaustion = participant.exhaustion

    // Apply mission conclusion exhaustion
    if (!participant.isTerminated) {
      agent.exhaustion += AGENT_EXHAUSTION_RECOVERY_PER_TURN

      // Additional exhaustion for each terminated agent
      agent.exhaustion += combatReport.agentsCasualties * AGENT_EXHAUSTION_RECOVERY_PER_TURN
    }

    // Update skill
    if (!participant.isTerminated) {
      // Skill from combat
      agent.skill += participant.skillGained

      // Skill from mission survival
      agent.missionsSurvived += 1
      const survivalIndex = Math.min(agent.missionsSurvived - 1, MISSION_SURVIVAL_SKILL_REWARD.length - 1)
      const survivalSkillReward = MISSION_SURVIVAL_SKILL_REWARD[survivalIndex] ?? 0
      agent.skill += survivalSkillReward

      console.log(
        `📈 Agent ${agent.id} gained ${participant.skillGained + survivalSkillReward} skill (${participant.skillGained} from combat, ${survivalSkillReward} from survival)`,
      )
    }

    // Update state and assignment
    if (participant.isTerminated) {
      agent.state = 'Terminated'
      agent.assignment = 'KIA'
    } else {
      agent.state = 'InTransit'

      // Check if agent took damage
      const tookDamage = agent.hitPoints < agent.maxHitPoints
      if (tookDamage) {
        agent.assignment = 'Recovery'
        agent.hitPointsLostBeforeRecovery = agent.maxHitPoints - agent.hitPoints
        agent.recoveryTurns = getRecoveryTurns(agent.hitPointsLostBeforeRecovery, agent.maxHitPoints)
      } else {
        agent.assignment = 'Standby'
      }
    }
  })
}
